#!/usr/bin/env node
// tools/rebuild-celpip-all.js
// Completely rebuilds all 30 CELPIP General tests with authentic exam-pattern content.
// Run: node tools/rebuild-celpip-all.js
"use strict";
const fs   = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "../content/celpip");

// ─── LISTENING DATA ────────────────────────────────────────────────────────────
// Each test has 6 parts. Each part is a realistic Canadian-life audio clip with MCQs.
// Part 1: Problem-solving dialogue (2 speakers, 8 Qs)
// Part 2: Daily life conversation (2 speakers, 5 Qs)
// Part 3: Information delivery (1 speaker, 6 Qs)
// Part 4: News item (1 speaker, 5 Qs)
// Part 5: Discussion (3 speakers, 8 Qs)
// Part 6: Viewpoints monologue (1 speaker, 6 Qs)

const L_DATA = [
  // Test 1
  {
    p1: {
      title: "Calling About a Noisy Neighbour",
      script: `Tenant: Hi, I'm calling about a problem with my upstairs neighbour. There's loud music almost every night after eleven, and I can't sleep.
Property Manager: I'm sorry to hear that. Have you spoken to the neighbour directly yet?
Tenant: I knocked on the door twice last week, but nobody answered.
Property Manager: In that case, I can send them an official written notice reminding them of the quiet hours policy. That usually works.
Tenant: Would there be any consequences if it continues after the notice?
Property Manager: Yes. If the behaviour continues after two written notices, we can begin the formal dispute process, which could affect their tenancy.
Tenant: That's a relief. How long does it take to send the first notice?
Property Manager: Usually within two business days. I'll log your complaint right now and you should receive a copy of the notice by email once it goes out.
Tenant: Perfect. And what should I do in the meantime if it happens tonight?
Property Manager: You can call our after-hours line and log a noise complaint. Those records will also be used if this goes further.`,
      questions: [
        { q: "Why is the tenant calling the property manager?", opts: ["To report a leaking pipe","To complain about a noisy neighbour","To request a rent reduction","To ask about parking rules"], a: "To complain about a noisy neighbour", e: "The tenant explicitly says there is loud music keeping them awake." },
        { q: "What has the tenant already tried?", opts: ["Called the police","Knocked on the neighbour's door","Sent an email to management","Left a note under the door"], a: "Knocked on the neighbour's door", e: "The tenant says they knocked twice last week." },
        { q: "What will the property manager do first?", opts: ["Contact the police","Begin a formal dispute process","Send an official written notice","Visit the neighbour's apartment"], a: "Send an official written notice", e: "The manager says they will send a written notice as the first step." },
        { q: "What happens if the behaviour continues after two notices?", opts: ["The tenant gets a discount","The neighbour's tenancy could be affected","Management will call the police","The tenant must move out"], a: "The neighbour's tenancy could be affected", e: "The manager says the formal dispute process could affect tenancy." },
        { q: "How long will it take to send the first notice?", opts: ["Same day","One week","Two business days","One month"], a: "Two business days", e: "The manager says usually within two business days." },
        { q: "What does the tenant receive once the notice is sent?", opts: ["A phone call from the manager","A copy by email","A signed letter by post","Nothing — it is confidential"], a: "A copy by email", e: "The manager says the tenant will receive a copy by email." },
        { q: "What should the tenant do if the noise happens tonight?", opts: ["Knock on the door again","Call emergency services","Call the after-hours line","Wait until morning"], a: "Call the after-hours line", e: "The manager advises calling the after-hours line to log a noise complaint." },
        { q: "What will the after-hours complaint records be used for?", opts: ["For media reports","For evidence if the dispute goes further","To update the lease agreement","To arrange a refund"], a: "For evidence if the dispute goes further", e: "The manager says those records will be used if the matter escalates." }
      ]
    },
    p2: {
      title: "Planning a Weekend Camping Trip",
      script: `Maya: Are you still planning to go camping this weekend? I heard there's a campsite near the lake that has good reviews.
Daniel: Yes, I booked two spots at Birchwood Provincial Park. It's about ninety minutes from downtown.
Maya: Do you think the weather will hold up? The forecast showed some rain on Saturday.
Daniel: I checked again this morning. It looks like just a light shower in the early afternoon. We should be fine if we set up the tent before noon.
Maya: Makes sense. Should I bring my camp stove, or does the park have fire pits?
Daniel: The park has fire pits, but there are restrictions on fire use right now because of dry conditions. Bring your stove — it's probably safer.
Maya: Good thinking. What about food? Should we plan to cook each night or pack some ready-made meals?
Daniel: Let's do a mix. Cook a proper dinner on Friday, and keep Saturday simple with sandwiches and wraps — less cleanup if the rain comes.`,
      questions: [
        { q: "Where are they planning to camp?", opts: ["Lakeshore National Park","Maplewood Campsite","Birchwood Provincial Park","Ridgeline Reserve"], a: "Birchwood Provincial Park", e: "Daniel says he booked spots at Birchwood Provincial Park." },
        { q: "How far is the campsite from downtown?", opts: ["Thirty minutes","One hour","Ninety minutes","Three hours"], a: "Ninety minutes", e: "Daniel says it is about ninety minutes from downtown." },
        { q: "What does the Saturday forecast show?", opts: ["Heavy thunderstorms","A light shower in the afternoon","Clear skies all day","Strong winds at night"], a: "A light shower in the afternoon", e: "Daniel checked and says it looks like just a light shower in the early afternoon." },
        { q: "Why does Daniel recommend bringing a camp stove?", opts: ["The park has no fire pits","Fire use is currently restricted","A stove cooks food faster","It is cheaper than buying firewood"], a: "Fire use is currently restricted", e: "Daniel says there are fire restrictions due to dry conditions." },
        { q: "What does Daniel suggest for Saturday's meals?", opts: ["A barbecue dinner","Eating at a restaurant","Sandwiches and wraps","Instant noodles only"], a: "Sandwiches and wraps", e: "Daniel suggests keeping Saturday simple with sandwiches and wraps." }
      ]
    },
    p3: {
      title: "Information About Renewing a Canadian Driver's Licence",
      script: `Good afternoon. This information session will walk you through the process of renewing your Canadian driver's licence. Whether your licence has recently expired or is about to expire, it is important to act early to avoid fines or restrictions on your driving privileges.

In most provinces, you will receive a renewal notice by mail several weeks before your expiry date. However, it is your responsibility to renew even if you do not receive this notice. Renewal can be completed in three ways: in person at a government services office, online through the provincial licensing portal, or by mail using the renewal form included with your notice.

If you are renewing in person, you will need to bring your current licence, proof of address such as a recent utility bill or bank statement, and the renewal fee. Fees vary by province but are generally between twenty-five and sixty-five dollars. If your vision has changed since your last renewal, you may also be required to complete a vision test at the counter.

Online renewal is available to drivers who have no changes to their personal information and whose previous renewal was also completed online. You will need your driver's licence number and the last four digits of your health card to verify your identity. Processing takes up to five business days and the new licence will be mailed to your home.

Remember: driving with an expired licence is a ticketable offence in every province. Renew early to avoid unnecessary penalties.`,
      questions: [
        { q: "Who is responsible for renewing a driver's licence?", opts: ["The government automatically renews it","The driver, even without a notice","The driver only if they receive a notice","The driver's insurance company"], a: "The driver, even without a notice", e: "The speaker says it is the driver's responsibility even without receiving a notice." },
        { q: "Which of the following is NOT mentioned as a renewal method?", opts: ["In person","Online","By telephone","By mail"], a: "By telephone", e: "The speaker lists in person, online, and by mail — telephone is not mentioned." },
        { q: "What document can be used as proof of address?", opts: ["A passport","A recent utility bill","A birth certificate","A tax return"], a: "A recent utility bill", e: "The speaker says a recent utility bill or bank statement can serve as proof of address." },
        { q: "When might a vision test be required during an in-person renewal?", opts: ["For every renewal","Only for seniors","If the driver's vision has changed","If the licence is expired by more than one year"], a: "If the driver's vision has changed", e: "The speaker says a vision test may be required if vision has changed." },
        { q: "What is needed to verify identity for online renewal?", opts: ["A passport and utility bill","A driver's licence number and last four digits of a health card","A photo and signature","An email address and phone number"], a: "A driver's licence number and last four digits of a health card", e: "The speaker specifies the driver's licence number and last four digits of the health card." },
        { q: "How long does online renewal processing take?", opts: ["Same day","One business day","Up to five business days","Two weeks"], a: "Up to five business days", e: "The speaker says processing takes up to five business days." }
      ]
    },
    p4: {
      title: "News Report: City Expands Free Transit for Seniors",
      script: `The city announced today that it will expand its free public transit programme for seniors beginning next month. Under the new policy, all residents aged sixty-five and older will be able to ride buses and light rail lines at no cost, seven days a week. Previously, the programme only applied on weekdays between nine in the morning and three in the afternoon.

The city's transportation director said the expansion was driven by data showing that many seniors were unable to attend evening medical appointments or weekend community activities due to transit costs. Council members voted fourteen to three in favour of the expansion at last night's meeting.

The programme will be funded through a small increase in the transit levy paid by commercial property owners. A city spokesperson confirmed that no changes to residential property taxes are planned as a result of this programme.

Advocacy groups welcomed the announcement but called for further steps, including improved accessibility features at bus stops and more frequent service on routes serving seniors' residences. The city said those improvements are already under review as part of the five-year transit plan.`,
      questions: [
        { q: "What change is being announced?", opts: ["A new bus route for schools","Free transit for seniors expanded to all days and hours","A reduction in transit fares for students","New light rail construction beginning next month"], a: "Free transit for seniors expanded to all days and hours", e: "The report says the free transit programme for seniors will expand to seven days a week." },
        { q: "Under the old policy, when was free transit available to seniors?", opts: ["Weekends only","Every day from 6 am to 10 pm","Weekdays between 9 am and 3 pm","Only on statutory holidays"], a: "Weekdays between 9 am and 3 pm", e: "The report states the previous programme applied weekdays between 9 am and 3 pm." },
        { q: "What reason did the transportation director give for the expansion?", opts: ["To reduce road congestion","To increase city revenue","Many seniors could not attend evening appointments or weekend activities","The transit fleet had excess capacity"], a: "Many seniors could not attend evening appointments or weekend activities", e: "The director cited data showing seniors missed appointments due to transit costs." },
        { q: "How will the expanded programme be funded?", opts: ["Through residential property taxes","Through a small increase in the commercial property transit levy","Through federal grants","Through a fare increase for non-seniors"], a: "Through a small increase in the commercial property transit levy", e: "The spokesperson says a small increase in the levy on commercial property owners will fund it." },
        { q: "What did advocacy groups call for in addition to free fares?", opts: ["Newer buses","Better accessibility at stops and more frequent service","Lower fares for everyone","A free monthly transit pass"], a: "Better accessibility at stops and more frequent service", e: "Advocacy groups called for improved accessibility and more frequent service." }
      ]
    },
    p5: {
      title: "Discussion: Should Companies Require Employees to Return to the Office?",
      script: `Host: Good morning. Today we're discussing whether companies should require employees to return to the office full time. I'm joined by two guests with very different views. Sophie, you support a return-to-office policy. Tell us why.
Sophie: Thank you. I believe in-person work is essential for collaboration and company culture. When people are in the same room, ideas flow more naturally. Spontaneous conversations at the coffee machine lead to innovations you simply cannot replicate on a video call. Junior employees especially benefit from being close to experienced colleagues.
Host: And Marcus, you argue against mandatory returns. What's your position?
Marcus: My position is that forcing people back to the office ignores what the pandemic proved: that most knowledge work can be done just as effectively from home, often more so. People save hours on commuting, they have fewer interruptions, and studies consistently show higher job satisfaction when employees have flexibility.
Host: Sophie, how do you respond to the productivity argument?
Sophie: Productivity metrics can be misleading. You might complete more tasks per hour at home, but you miss out on the kind of deep organisational knowledge that comes from casual interactions. Also, not everyone has a good home environment — some employees live in small apartments or have young children, and forcing them to work from home is actually more stressful.
Host: Marcus, a final word?
Marcus: Companies that respect autonomy attract and retain better talent. If a business genuinely believes in-person work is better, they should make it so compelling that people want to come in voluntarily — not mandate it and risk losing good people to competitors who offer flexibility.
Host: Thank you both. It's clear this debate is far from settled.`,
      questions: [
        { q: "What is the main topic of the discussion?", opts: ["Whether to build new office buildings","Whether companies should require a full return to in-person work","How to improve video conferencing technology","Whether remote work causes productivity loss"], a: "Whether companies should require a full return to in-person work", e: "The host introduces the topic as whether companies should require employees to return to the office." },
        { q: "What does Sophie say about spontaneous conversations?", opts: ["They are inefficient","They lead to innovations that cannot be replicated on video calls","They are better online","They only benefit senior employees"], a: "They lead to innovations that cannot be replicated on video calls", e: "Sophie says spontaneous conversations lead to innovations you cannot replicate on a video call." },
        { q: "According to Marcus, what do studies consistently show?", opts: ["Remote workers are less creative","In-office workers earn more","Employees show higher job satisfaction with flexibility","Remote work increases absenteeism"], a: "Employees show higher job satisfaction with flexibility", e: "Marcus says studies consistently show higher job satisfaction when employees have flexibility." },
        { q: "What concern does Sophie raise about forcing people to work from home?", opts: ["It increases energy costs","Some employees lack a good home environment","It reduces internet bandwidth","It leads to longer working hours"], a: "Some employees lack a good home environment", e: "Sophie says some employees live in small apartments or have young children, making home work more stressful." },
        { q: "What does Marcus suggest companies that prefer in-person work should do?", opts: ["Reduce salaries for remote workers","Make the office experience compelling enough that people want to come voluntarily","Publish productivity data publicly","Hire only employees who live nearby"], a: "Make the office experience compelling enough that people want to come voluntarily", e: "Marcus says companies should make in-person work compelling, not mandatory." },
        { q: "Which of the following best describes Sophie's view on productivity metrics?", opts: ["They perfectly capture real performance","They are the only reliable measure of output","They can be misleading and miss informal knowledge transfer","They support the case for remote work"], a: "They can be misleading and miss informal knowledge transfer", e: "Sophie says productivity metrics can be misleading and you miss deep organisational knowledge from casual interactions." },
        { q: "What does Marcus say companies risk if they mandate a return to office?", opts: ["Losing clients","Being fined by government","Losing good employees to more flexible competitors","Reducing profits"], a: "Losing good employees to more flexible competitors", e: "Marcus says companies risk losing good people to competitors who offer flexibility." },
        { q: "What is the host's conclusion at the end?", opts: ["Sophie has the better argument","Marcus has made the strongest case","The debate is far from settled","Both sides agree on the main point"], a: "The debate is far from settled", e: "The host says it is clear the debate is far from settled." }
      ]
    },
    p6: {
      title: "Viewpoints: The Value of Learning a Second Language as an Adult",
      script: `There is a widespread belief that adults cannot learn a new language as effectively as children. This idea has discouraged many adults from even attempting to study a second language, which I believe is deeply unfortunate — and largely incorrect.

Research on brain plasticity has shown that while young children do acquire language with remarkable ease and near-perfect accents, adults have significant advantages that are rarely acknowledged. Adults come to language learning with an established grammar system in their native language, a large vocabulary that can be mapped onto new words, and — critically — the ability to study deliberately and strategically. A child acquires language through years of immersion; an adult with good study habits can reach conversational fluency in twelve to eighteen months.

The benefits of second language learning extend far beyond communication. Numerous studies have found that bilingual adults show delayed onset of dementia by an average of four to five years compared to monolinguals. The effort of managing two language systems exercises the brain in ways that improve attention, task-switching, and even creativity.

From a social perspective, learning the dominant language of your community opens doors in ways that are hard to overstate. It changes how service providers speak to you, how colleagues perceive you, and how confident you feel navigating institutions — from hospitals to government offices.

My view is straightforward: language learning is one of the most valuable investments an adult can make in themselves, and the belief that it is too late should be replaced with a recognition that it is simply different — and in some respects, better.`,
      questions: [
        { q: "What common belief does the speaker challenge?", opts: ["That children are better at maths than adults","That adults cannot learn a new language as effectively as children","That language learning requires travel abroad","That bilingualism causes confusion"], a: "That adults cannot learn a new language as effectively as children", e: "The speaker says this widespread belief is largely incorrect." },
        { q: "What advantage do adults have over children in language learning, according to the speaker?", opts: ["Adults have more free time","Adults can study deliberately and strategically","Adults have better pronunciation","Adults learn grammar faster"], a: "Adults can study deliberately and strategically", e: "The speaker lists this as a critical advantage of adult learners." },
        { q: "How long can a motivated adult reach conversational fluency, according to the passage?", opts: ["Three to five years","Six to eight months","Twelve to eighteen months","Two to three years"], a: "Twelve to eighteen months", e: "The speaker says adults with good study habits can reach conversational fluency in twelve to eighteen months." },
        { q: "What health benefit is associated with bilingualism?", opts: ["Lower blood pressure","Reduced risk of heart disease","Delayed onset of dementia by four to five years","Improved physical coordination"], a: "Delayed onset of dementia by four to five years", e: "The speaker cites studies showing bilingual adults show delayed onset of dementia by four to five years on average." },
        { q: "What cognitive skills does managing two languages improve?", opts: ["Long-term memory and spatial reasoning","Attention, task-switching, and creativity","Mathematical problem-solving","Reading speed and recall"], a: "Attention, task-switching, and creativity", e: "The speaker says managing two language systems improves attention, task-switching, and creativity." },
        { q: "What is the speaker's overall conclusion?", opts: ["Adults should not bother learning new languages","Language learning is too difficult for most adults","Language learning is one of the most valuable investments an adult can make","Children should be taught two languages from birth"], a: "Language learning is one of the most valuable investments an adult can make", e: "The speaker states directly that language learning is one of the most valuable adult investments." }
      ]
    }
  },
  // Test 2
  {
    p1: {
      title: "Reporting a Water Leak in an Apartment",
      script: `Resident: Hello, I need to report a water leak. It started this morning under my kitchen sink. There's water pooling on the floor.
Superintendent: I'll send someone right away. Can you confirm your unit number?
Resident: It's unit 4B on the fourth floor.
Superintendent: Got it. And is the leak a slow drip or is it flowing steadily?
Resident: It's a steady drip. I've put a bucket under it, but it's filling up about every two hours.
Superintendent: That sounds like a loose connection on the supply line. The plumber we use is available this afternoon. Would two o'clock work for you?
Resident: Yes, that's fine. Do I need to be home?
Superintendent: Yes, please be there so the plumber can access the cabinet under the sink. Also, to be safe, turn off the shut-off valve under the sink — there's usually a small handle on the left pipe.
Resident: I found it and turned it off. The dripping has stopped for now.
Superintendent: Perfect. That confirms the problem is with the supply line, not the drain. The plumber will replace the fitting. It should take under an hour.`,
      questions: [
        { q: "What is the problem the resident is reporting?", opts: ["A broken window","A water leak under the kitchen sink","A faulty heating system","A blocked toilet"], a: "A water leak under the kitchen sink", e: "The resident calls to report water pooling under the kitchen sink." },
        { q: "How fast is the bucket filling up?", opts: ["Every thirty minutes","Every hour","Every two hours","Every day"], a: "Every two hours", e: "The resident says the bucket fills up about every two hours." },
        { q: "What does the superintendent suspect the problem is?", opts: ["A cracked drain pipe","A loose connection on the supply line","A broken water heater","A faulty pressure valve"], a: "A loose connection on the supply line", e: "The superintendent says it sounds like a loose connection on the supply line." },
        { q: "When is the plumber available?", opts: ["This morning","Tomorrow morning","Two o'clock this afternoon","Next week"], a: "Two o'clock this afternoon", e: "The superintendent says the plumber is available at two o'clock this afternoon." },
        { q: "What does the superintendent ask the resident to do immediately?", opts: ["Call a plumber directly","Leave the apartment","Turn off the shut-off valve","Open the windows"], a: "Turn off the shut-off valve", e: "The superintendent advises turning off the shut-off valve under the sink." },
        { q: "What does the dripping stopping confirm?", opts: ["The drain is blocked","The pipe is cracked","The problem is with the supply line, not the drain","The water pressure is too high"], a: "The problem is with the supply line, not the drain", e: "The superintendent says this confirms the problem is with the supply line." },
        { q: "How long is the repair expected to take?", opts: ["Less than one hour","Two to three hours","All afternoon","Several days"], a: "Less than one hour", e: "The superintendent says it should take under an hour." },
        { q: "Why does the resident need to be home for the repair?", opts: ["To pay the plumber in cash","To sign a repair agreement","To give the plumber access to the cabinet","To watch the repair procedure"], a: "To give the plumber access to the cabinet", e: "The superintendent says the plumber needs to access the cabinet under the sink." }
      ]
    },
    p2: {
      title: "Choosing Between Two Job Offers",
      script: `Priya: I'm in a tough spot. I got two job offers this week and I have until Friday to decide.
Kevin: That's a great problem to have! What are the offers?
Priya: One is a junior marketing role at a tech startup. Good salary, lots of creative freedom, but the company is only two years old and a bit risky. The other is a coordinator position at a non-profit — lower salary, but excellent benefits and a guaranteed pension.
Kevin: What matters more to you right now — financial security or career growth?
Priya: Honestly, both. I have student loans to pay off, but I also don't want to be stuck in a job that goes nowhere.
Kevin: Could the non-profit lead to advancement?
Priya: They mentioned there's a senior coordinator role that opens up every couple of years. But at the startup, if it takes off, the growth potential is huge.
Kevin: Have you factored in the commute?
Priya: Good point — the startup is downtown, forty-five minutes each way on transit. The non-profit is ten minutes from my apartment.
Kevin: That's two hours a day you'd get back with the non-profit. That's not nothing.`,
      questions: [
        { q: "How many job offers has Priya received?", opts: ["One","Two","Three","Four"], a: "Two", e: "Priya says she received two job offers this week." },
        { q: "What concern does Priya have about the startup?", opts: ["The salary is too low","It is located too far away","It is only two years old and a bit risky","The role lacks creative freedom"], a: "It is only two years old and a bit risky", e: "Priya says the startup is only two years old and a bit risky." },
        { q: "What advantage does the non-profit offer over the startup?", opts: ["Higher salary","More creative freedom","Better benefits and a pension","Faster career advancement"], a: "Better benefits and a pension", e: "Priya says the non-profit has excellent benefits and a guaranteed pension." },
        { q: "How long is the commute to the startup?", opts: ["Ten minutes","Twenty minutes","Forty-five minutes each way","Over an hour each way"], a: "Forty-five minutes each way", e: "Priya says the startup is forty-five minutes each way on transit." },
        { q: "What does Kevin point out about commuting time?", opts: ["It adds to fitness levels","It is a chance to read","The non-profit saves her two hours a day","Transit fares are expensive"], a: "The non-profit saves her two hours a day", e: "Kevin says Priya would get back two hours a day by working closer to home." }
      ]
    },
    p3: {
      title: "How to Use the Provincial Health Insurance System",
      script: `Welcome to this information session on using the provincial health insurance system. If you are a permanent resident or Canadian citizen living in this province, you are entitled to a provincial health card, which covers the cost of most medically necessary services.

To obtain your health card, visit a ServiceOntario or equivalent provincial office with two pieces of identification — one must be a government-issued photo ID, such as a passport or permanent resident card, and one must show your current address, such as a utility bill or bank statement. New applicants typically wait a three-month period before coverage begins, so it is important to apply as soon as possible after arriving.

Your health card covers visits to a family doctor, specialist consultations when referred by your doctor, emergency room visits, hospital stays, and diagnostic tests including X-rays and blood work. It does not automatically cover prescription drugs, dental care, or vision care, which are typically covered through separate private insurance plans or provincial drug benefit programmes for qualifying residents.

If you do not have a family doctor, you can register with the Health Care Connect programme, which matches patients to available physicians. In the meantime, walk-in clinics and urgent care centres can treat most non-emergency conditions and are also covered by your health card.

Always carry your health card when attending medical appointments, and report any change of address to the provincial health authority to ensure your records are current.`,
      questions: [
        { q: "Who is entitled to a provincial health card?", opts: ["Only Canadian citizens","Permanent residents and Canadian citizens","International students only","Anyone living in Canada"], a: "Permanent residents and Canadian citizens", e: "The speaker says permanent residents or Canadian citizens are entitled to a health card." },
        { q: "What is one document required to apply for a health card?", opts: ["A letter from an employer","A government-issued photo ID","A birth certificate","A utility bill from a previous province"], a: "A government-issued photo ID", e: "The speaker says one of the two IDs must be a government-issued photo ID." },
        { q: "How long must new applicants typically wait before coverage begins?", opts: ["One week","One month","Three months","Six months"], a: "Three months", e: "The speaker says there is typically a three-month waiting period." },
        { q: "Which of the following is NOT covered by the provincial health card?", opts: ["Emergency room visits","Family doctor visits","Dental care","Blood work"], a: "Dental care", e: "The speaker says dental care is not automatically covered by the health card." },
        { q: "What is the Health Care Connect programme?", opts: ["A private insurance plan","A walk-in clinic network","A programme that matches patients to available physicians","An online pharmacy"], a: "A programme that matches patients to available physicians", e: "The speaker describes Health Care Connect as matching patients to available physicians." },
        { q: "What should residents do if their address changes?", opts: ["Apply for a new health card","Report the change to the provincial health authority","Contact their family doctor only","Wait until renewal time"], a: "Report the change to the provincial health authority", e: "The speaker says to report any change of address to keep records current." }
      ]
    },
    p4: {
      title: "News Report: Province Launches New Childcare Subsidy Programme",
      script: `The provincial government announced a new childcare subsidy programme this morning, aimed at reducing childcare costs for families earning below ninety thousand dollars per year. Under the new programme, eligible families will pay no more than ten dollars per day for regulated childcare, beginning on the first of next month.

The Minister of Families said the programme is expected to benefit approximately forty thousand children across the province in its first year. Priority access will be given to families with children under the age of six, as well as families currently on waitlists at participating childcare centres.

To apply, parents must submit an application through the provincial government's online portal and provide proof of income from the previous tax year. Applications will be processed within fifteen business days, and approved families will be notified by email.

Child-care providers interested in joining the programme must sign a participation agreement and comply with the province's staffing and curriculum standards. The government said that over three hundred licenced providers have already registered ahead of the launch.

Opposition critics raised concerns that the programme does not extend to informal care arrangements, such as home-based care providers who are not licenced. The government indicated it plans to expand eligibility in future years.`,
      questions: [
        { q: "Who is eligible for the new childcare subsidy?", opts: ["All families with children under twelve","Families earning below ninety thousand dollars per year","Only single-parent households","Families on social assistance only"], a: "Families earning below ninety thousand dollars per year", e: "The report says eligible families earn below ninety thousand dollars per year." },
        { q: "What is the maximum daily childcare cost under the new programme?", opts: ["Five dollars","Ten dollars","Twenty dollars","Fifty dollars"], a: "Ten dollars", e: "The report states families will pay no more than ten dollars per day." },
        { q: "Which children will receive priority access?", opts: ["School-age children","Children under six and those already on waitlists","Children of essential workers","All children equally"], a: "Children under six and those already on waitlists", e: "The minister says priority goes to children under six and families on existing waitlists." },
        { q: "How will approved families be notified?", opts: ["By post","By telephone","By email","Through their childcare provider"], a: "By email", e: "The report says approved families will be notified by email." },
        { q: "What concern did opposition critics raise?", opts: ["The daily fee is too high","The programme excludes informal unlicenced home-based care","Too many providers have already registered","The programme starts too late in the year"], a: "The programme excludes informal unlicenced home-based care", e: "Critics say the programme does not extend to informal home-based care arrangements." }
      ]
    },
    p5: {
      title: "Discussion: Is Social Media Good or Bad for Teenagers?",
      script: `Host: Today's discussion focuses on social media and its impact on teenagers. With me are two commentators: Diane, a child development researcher, and Tom, who advocates for digital literacy education. Diane, let's start with you — is social media harmful to teenagers?
Diane: The research is quite clear that heavy social media use is associated with higher rates of anxiety, depression, and sleep disruption in teenagers, particularly for girls. The problem isn't the technology itself — it's the design. Platforms are deliberately built to maximise engagement, which means maximising the time young people spend comparing themselves to others.
Host: Tom, do you think the solution is restricting access?
Tom: I strongly disagree with blanket restrictions. The answer is education. We need to teach teenagers to be critical consumers of digital content — how algorithms work, how images are edited, what business models drive these platforms. Banning access doesn't develop those skills; it just delays the problem.
Host: Diane, what do you say to that?
Diane: I agree that education is necessary, but it is not sufficient on its own. A thirteen-year-old is neurologically not equipped to resist the deliberate manipulation that these platforms apply. We need age-appropriate restrictions alongside digital literacy — not instead of it.
Host: Tom, any response?
Tom: The issue is that restriction without education creates what I call the forbidden fruit effect — the moment restrictions are lifted, young people binge. I've seen this in schools that blocked social media completely and then found students spending even more time online at weekends to compensate.
Host: Thank you both. It seems there is agreement on the need for education, but a real divide on the role of restrictions.`,
      questions: [
        { q: "What does Diane say is the main problem with social media platforms?", opts: ["They are too expensive","They are designed to maximise engagement through comparison","They do not have enough educational content","They spread false news to teenagers"], a: "They are designed to maximise engagement through comparison", e: "Diane says platforms are deliberately built to maximise engagement, which means maximising comparison." },
        { q: "What does Tom advocate for?", opts: ["Banning social media entirely","Age-based restrictions on all platforms","Digital literacy education for teenagers","Parental monitoring software"], a: "Digital literacy education for teenagers", e: "Tom says the answer is teaching teenagers to be critical consumers of digital content." },
        { q: "On what point do Diane and Tom agree?", opts: ["Restrictions are necessary","Education about social media is necessary","Teenagers should avoid all social media","Parents should manage all screen time"], a: "Education about social media is necessary", e: "The host notes both agree on the need for education." },
        { q: "What does Diane say a thirteen-year-old is not equipped to do?", opts: ["Understand complex text","Resist deliberate platform manipulation","Manage their own time","Communicate online safely"], a: "Resist deliberate platform manipulation", e: "Diane says a thirteen-year-old is neurologically not equipped to resist deliberate platform manipulation." },
        { q: "What does Tom call the effect of banning social media without education?", opts: ["The rebound effect","The forbidden fruit effect","The digital divide","The screen overload effect"], a: "The forbidden fruit effect", e: "Tom calls the over-compensating behaviour after restrictions the forbidden fruit effect." },
        { q: "What evidence does Tom give for the forbidden fruit effect?", opts: ["A government study on screen time","Personal experience with teenagers at home","Schools that blocked social media found students spent more time online on weekends","Research from Diane's own institution"], a: "Schools that blocked social media found students spent more time online on weekends", e: "Tom says schools that blocked social media found students spent even more time online on weekends." },
        { q: "What specific group does Diane say is most affected by heavy social media use?", opts: ["Boys aged ten to twelve","All teenagers equally","Girls in particular","Teenagers in rural areas"], a: "Girls in particular", e: "Diane says anxiety and depression are particularly high for girls." },
        { q: "What is the host's summary at the end?", opts: ["Both guests fully agree","The debate is too political to resolve","There is agreement on education but a divide on restrictions","Tom has made the stronger argument"], a: "There is agreement on education but a divide on restrictions", e: "The host summarises that there is agreement on education but a real divide on restrictions." }
      ]
    },
    p6: {
      title: "Viewpoints: Why Small Towns Deserve More Investment",
      script: `For decades, government investment in infrastructure, healthcare, and education has flowed predominantly toward major cities. This concentration of resources has created a growing divide between the opportunities available to people in urban centres and those living in smaller towns and rural communities. I believe this imbalance is not only unfair but economically short-sighted.

Consider healthcare. In most Canadian cities, residents have access to walk-in clinics, specialist hospitals, and urgent care centres within a reasonable distance. In small towns, the nearest hospital may be an hour's drive away. Rural residents have higher rates of late-stage cancer diagnoses precisely because early detection requires access to diagnostic services that simply are not available locally.

Education tells a similar story. Urban schools are often better funded, have access to more experienced teachers, and offer a wider range of programmes and extracurricular activities. Rural students frequently travel long distances to school and have fewer post-secondary options nearby. This creates a pattern in which talented young people leave their home communities for cities — and rarely return.

Critics of increased rural investment argue that the cost per person is too high. This logic is flawed. The cost of maintaining a dispersed population is not a reason to abandon it — it is an argument for smarter, targeted investment in sustainable local infrastructure.

If we are serious about equality of opportunity, the postal code where someone is born should not determine the quality of healthcare, education, or economic opportunity available to them. Small towns and rural communities deserve better — not out of sentiment, but out of a genuine commitment to a more equitable society.`,
      questions: [
        { q: "What does the speaker argue is wrong with current government investment patterns?", opts: ["Too much money is spent on small towns","Investment flows mainly to cities, creating inequality","Rural communities refuse investment","Cities need more hospitals"], a: "Investment flows mainly to cities, creating inequality", e: "The speaker says investment has predominantly flowed toward major cities, creating a divide." },
        { q: "What health problem does the speaker connect to rural under-investment?", opts: ["Higher rates of heart disease","More road accidents","Higher rates of late-stage cancer diagnoses","Fewer vaccinations"], a: "Higher rates of late-stage cancer diagnoses", e: "The speaker says rural residents have higher rates of late-stage cancer because early detection services are not available locally." },
        { q: "What pattern in education does the speaker describe?", opts: ["Rural schools are better funded than urban ones","Talented young people leave small towns and rarely return","Rural students prefer online learning","Urban students move to rural areas for university"], a: "Talented young people leave small towns and rarely return", e: "The speaker says talented young people leave for cities and rarely return." },
        { q: "How does the speaker respond to critics who say rural investment costs too much per person?", opts: ["By agreeing and suggesting cuts","By calling it a reason for smarter targeted investment","By dismissing the economic argument entirely","By citing statistics on rural GDP"], a: "By calling it a reason for smarter targeted investment", e: "The speaker says the cost argument is flawed and is actually an argument for smarter, targeted investment." },
        { q: "What does the speaker say should not determine the quality of opportunity a person has?", opts: ["Their family income","Their level of education","The postal code where they were born","Their language ability"], a: "The postal code where they were born", e: "The speaker says the postal code where someone is born should not determine their opportunities." },
        { q: "What is the speaker's overall tone?", opts: ["Nostalgic and sentimental","Objective and neutral","Persuasive and advocacy-driven","Pessimistic and resigned"], a: "Persuasive and advocacy-driven", e: "The speaker argues a clear position and calls for change based on principles of equity." }
      ]
    }
  }
];

// ─── READING DATA ──────────────────────────────────────────────────────────────
// Part 1: Correspondence (email exchange, 11 Qs)
// Part 2: Apply a Diagram (schedule/chart, 8 Qs)
// Part 3: Reading for Information (article, 9 Qs)
// Part 4: Reading for Viewpoints (4 short opinions, 10 Qs)

const R_DATA = [
  // Test 1
  {
    p1: {
      title: "Email Correspondence: Community Garden Plot Application",
      emails: [
        {
          from: "Kevin Marsh <k.marsh@gmail.com>",
          to: "coordinator@riverdalegardens.ca",
          subject: "Application for a Garden Plot",
          date: "May 3",
          body: `Dear Coordinator,

I am writing to apply for one of the community garden plots I noticed advertised on your website. My partner and I moved to the Riverdale neighbourhood six months ago, and we are very keen to grow our own vegetables this summer. We do not have any outdoor space at our apartment, so the community garden would be ideal.

I noticed the website mentions a waitlist. Could you let me know approximately how long the current wait is, and whether there is anything we can do to move things along? Also, is there a fee involved, and if so, does it cover the full growing season?

Thank you very much for your time. I look forward to hearing from you.

Kevin Marsh`
        },
        {
          from: "Rosa Delacourt <coordinator@riverdalegardens.ca>",
          to: "k.marsh@gmail.com",
          subject: "RE: Application for a Garden Plot",
          date: "May 5",
          body: `Dear Kevin,

Thank you for your interest in Riverdale Community Gardens. We are delighted to welcome new applicants, especially those who are new to the neighbourhood.

To answer your questions: yes, there is currently a waitlist, and the average wait time is approximately four to six weeks depending on plot size. We have two plot sizes available — a small plot of four square metres at eighty dollars per season, and a standard plot of eight square metres at one hundred and forty dollars per season. The fee covers the period from May through October and includes access to shared tools, water connections, and a compost bin allocation.

To register your interest formally, please complete the application form on our website and submit it along with your payment. Once your application is processed, you will be placed on the waitlist and contacted when a plot becomes available.

We also hold a monthly garden social on the last Saturday of each month, and newcomers are very welcome to join even before they have their own plot.

Best regards,
Rosa Delacourt
Coordinator, Riverdale Community Gardens`
        }
      ],
      questions: [
        { q: "Why does Kevin want a community garden plot?", opts: ["He wants to start a small business selling vegetables","He has no outdoor space at his apartment","He recently moved to a house with a broken garden","He is doing research on urban farming"], a: "He has no outdoor space at his apartment", e: "Kevin says they do not have outdoor space at their apartment." },
        { q: "How long has Kevin been living in Riverdale?", opts: ["Two weeks","Three months","Six months","Over a year"], a: "Six months", e: "Kevin says he and his partner moved to Riverdale six months ago." },
        { q: "What is the approximate current wait time for a plot?", opts: ["One week","Two to three weeks","Four to six weeks","Three to four months"], a: "Four to six weeks", e: "Rosa says the average wait is approximately four to six weeks." },
        { q: "How much does the small plot cost per season?", opts: ["Forty dollars","Eighty dollars","One hundred and forty dollars","Two hundred dollars"], a: "Eighty dollars", e: "Rosa says the small plot of four square metres costs eighty dollars per season." },
        { q: "What does the fee include, according to Rosa?", opts: ["Only water connection","Shared tools, water connections, and a compost bin allocation","A storage shed and weekly instruction","Unlimited tool rental and parking"], a: "Shared tools, water connections, and a compost bin allocation", e: "Rosa lists shared tools, water, and a compost bin allocation as what the fee includes." },
        { q: "How long is the growing season at Riverdale Community Gardens?", opts: ["April to August","May to October","June to September","March to November"], a: "May to October", e: "Rosa says the fee covers the period from May through October." },
        { q: "What must Kevin do to be placed on the waitlist?", opts: ["Call Rosa directly","Attend a garden meeting first","Submit an application form and payment online","Visit in person with ID"], a: "Submit an application form and payment online", e: "Rosa says Kevin must complete and submit the form with payment to be placed on the waitlist." },
        { q: "When is the monthly garden social held?", opts: ["First Friday of each month","Second Saturday of each month","Last Saturday of each month","Every Sunday morning"], a: "Last Saturday of each month", e: "Rosa says the garden social is on the last Saturday of each month." },
        { q: "Who is welcome at the garden socials?", opts: ["Only current plot holders","Members who have held a plot for at least one year","Newcomers, even before having their own plot","Only people who have paid their fees"], a: "Newcomers, even before having their own plot", e: "Rosa says newcomers are welcome even before they have their own plot." },
        { q: "What can be inferred about the standard plot size?", opts: ["It is the same as the small plot","It is twice the size of the small plot","It is only available to returning members","It includes a private tool shed"], a: "It is twice the size of the small plot", e: "The small plot is four square metres and the standard is eight square metres — exactly twice the size." },
        { q: "What is the purpose of Rosa's email?", opts: ["To reject Kevin's application","To answer his questions and explain the process","To invite him to a specific event","To offer him a plot immediately"], a: "To answer his questions and explain the process", e: "Rosa's email answers Kevin's questions about the wait, fees, and registration process." }
      ]
    },
    p2: {
      title: "Community Recreation Centre — Spring Programme Schedule",
      intro: "The Maplewood Recreation Centre offers the following programmes during the spring session (April 7 – June 27). All programmes are drop-in unless marked with (R) for registered.",
      schedule: [
        { day: "Monday", time: "9:00–10:00 am", programme: "Gentle Yoga (R)", location: "Studio A", notes: "Ages 18+, mats provided" },
        { day: "Monday", time: "6:00–7:30 pm", programme: "Adult Swimming Lessons (R)", location: "Pool", notes: "Non-swimmers only" },
        { day: "Tuesday", time: "10:00–11:30 am", programme: "Seniors' Art Class (R)", location: "Craft Room", notes: "Ages 60+, materials included" },
        { day: "Tuesday", time: "7:00–8:30 pm", programme: "Drop-in Basketball", location: "Gymnasium", notes: "Ages 14+, bring own water" },
        { day: "Wednesday", time: "9:00–10:00 am", programme: "Aqua Fitness (R)", location: "Pool", notes: "All fitness levels" },
        { day: "Wednesday", time: "12:00–1:00 pm", programme: "Lunchtime Stretch", location: "Studio A", notes: "Drop-in, no registration needed" },
        { day: "Thursday", time: "4:30–5:30 pm", programme: "Youth Badminton (R)", location: "Gymnasium", notes: "Ages 10–17" },
        { day: "Thursday", time: "7:00–9:00 pm", programme: "Community Dance (R)", location: "Main Hall", notes: "All ages, partners welcome" },
        { day: "Friday", time: "9:00–10:30 am", programme: "Parent & Tot Swim", location: "Pool", notes: "Children under 5 with adult" },
        { day: "Saturday", time: "10:00 am–12:00 pm", programme: "Open Badminton", location: "Gymnasium", notes: "Drop-in, all skill levels" },
        { day: "Saturday", time: "2:00–4:00 pm", programme: "Teen Gaming Club (R)", location: "Computer Room", notes: "Ages 13–18" },
        { day: "Sunday", time: "11:00 am–1:00 pm", programme: "Family Swim", location: "Pool", notes: "Families with children" }
      ],
      questions: [
        { q: "A 70-year-old woman wants to try an art class. Which programme is most suitable?", opts: ["Gentle Yoga on Monday morning","Seniors' Art Class on Tuesday morning","Community Dance on Thursday evening","Lunchtime Stretch on Wednesday"], a: "Seniors' Art Class on Tuesday morning", e: "The Seniors' Art Class on Tuesday is for ages 60+ and includes materials." },
        { q: "Which programmes require advance registration?", opts: ["Drop-in Basketball and Family Swim","Gentle Yoga and Aqua Fitness","Open Badminton and Lunchtime Stretch","Parent & Tot Swim and Teen Gaming Club"], a: "Gentle Yoga and Aqua Fitness", e: "Only programmes marked with (R) require registration. Both Gentle Yoga and Aqua Fitness are marked (R)." },
        { q: "A teenager aged 15 wants to play badminton on a weekday. What is the correct programme?", opts: ["Open Badminton on Saturday","Youth Badminton on Thursday afternoon","Drop-in Basketball on Tuesday","Community Dance on Thursday evening"], a: "Youth Badminton on Thursday afternoon", e: "Youth Badminton is on Thursday afternoon and is for ages 10–17." },
        { q: "Which pool programme is available to families with young children on a Sunday?", opts: ["Aqua Fitness","Adult Swimming Lessons","Parent & Tot Swim","Family Swim"], a: "Family Swim", e: "Family Swim is held on Sundays and is for families with children." },
        { q: "How long does the Community Dance programme last?", opts: ["One hour","One hour thirty minutes","Two hours","Two hours thirty minutes"], a: "Two hours", e: "Community Dance runs from 7:00–9:00 pm, which is two hours." },
        { q: "Which programme can someone attend without planning ahead on a Wednesday lunchtime?", opts: ["Aqua Fitness","Gentle Yoga","Lunchtime Stretch","Seniors' Art Class"], a: "Lunchtime Stretch", e: "Lunchtime Stretch on Wednesday is explicitly listed as drop-in with no registration needed." },
        { q: "Which location is used for the most programmes?", opts: ["Studio A","Craft Room","Gymnasium","Pool"], a: "Pool", e: "The Pool is used for Aqua Fitness, Adult Swimming Lessons, Parent & Tot Swim, and Family Swim — more than any other location." },
        { q: "A parent with a three-year-old child wants to swim together. Which programme should they attend?", opts: ["Family Swim on Sunday","Adult Swimming Lessons on Monday","Parent & Tot Swim on Friday","Aqua Fitness on Wednesday"], a: "Parent & Tot Swim on Friday", e: "Parent & Tot Swim is for children under 5 with an adult and runs on Friday." }
      ]
    },
    p3: {
      title: "Understanding Canada's Food Guide",
      content: `Canada's Food Guide was significantly revised in 2019, marking the most substantial update to the document in over a decade. The new guide moved away from the previous four food-group model — which had been criticised for placing too much emphasis on dairy and meat — toward a simpler, more flexible approach to healthy eating.

The updated guide is built around three core categories: vegetables and fruit, whole grain foods, and protein foods. Crucially, it does not specify serving sizes or recommended daily portions in the traditional sense. Instead, it uses a plate model showing that roughly half of every meal should consist of vegetables and fruit, one quarter should be whole grain foods such as brown rice, oats, or whole wheat bread, and one quarter should be protein foods.

One of the most significant changes was the repositioning of dairy products. In the previous guide, dairy had its own category and Canadians were encouraged to consume multiple daily servings. The 2019 guide merged dairy into the broader protein food category, alongside beans, lentils, tofu, fish, eggs, lean meat, and nuts. This change was partly driven by growing evidence that high dairy consumption is not necessary for bone health in adults and that plant-based protein sources offer comparable nutritional value.

The new guide also places greater emphasis on the social and environmental dimensions of eating. It encourages Canadians to cook at home more often, eat meals with others, and be mindful of marketing from the food industry. It also recommends limiting foods high in sodium, sugar, and saturated fat, and advises choosing water as the preferred beverage over sugary drinks.

Critics of the new guide pointed out that it largely ignored the traditional dietary patterns of many Indigenous communities, which rely heavily on land-based foods such as game meats, fish, and berries. The government acknowledged this gap and committed to developing supplementary resources that better reflect Indigenous food sovereignty.`,
      questions: [
        { q: "What was the main criticism of the previous version of Canada's Food Guide?", opts: ["It was too complicated for most people to follow","It placed too much emphasis on dairy and meat","It did not include enough vegetables","It was not updated frequently enough"], a: "It placed too much emphasis on dairy and meat", e: "The passage says the previous guide was criticised for placing too much emphasis on dairy and meat." },
        { q: "According to the 2019 guide, what should make up roughly half of every meal?", opts: ["Whole grain foods","Protein foods","Vegetables and fruit","Dairy products"], a: "Vegetables and fruit", e: "The plate model shows roughly half of every meal should be vegetables and fruit." },
        { q: "Where is dairy placed in the 2019 Food Guide?", opts: ["In its own separate category","Under the vegetables and fruit category","Within the broader protein food category","It was removed entirely from the guide"], a: "Within the broader protein food category", e: "The 2019 guide merged dairy into the broader protein food category." },
        { q: "What evidence influenced the repositioning of dairy?", opts: ["Studies showing dairy is harmful to children","Evidence that high dairy consumption is not necessary for adult bone health","Research showing dairy increases obesity","Findings that dairy increases cholesterol"], a: "Evidence that high dairy consumption is not necessary for adult bone health", e: "The passage says growing evidence showed high dairy consumption is not necessary for bone health in adults." },
        { q: "What beverage does the new guide recommend as preferred?", opts: ["Low-fat milk","100% fruit juice","Coffee or tea","Water"], a: "Water", e: "The passage says the guide advises choosing water as the preferred beverage over sugary drinks." },
        { q: "What is one social dimension of eating that the new guide encourages?", opts: ["Eating a large breakfast","Joining a cooking class","Eating meals with others","Following a specific diet plan"], a: "Eating meals with others", e: "The guide encourages eating meals with others as part of its social dimension." },
        { q: "What criticism was raised about the 2019 guide regarding Indigenous communities?", opts: ["It ignored traditional dietary patterns relying on land-based foods","It recommended too many imported foods","It contained inaccurate information about wild game","It was not translated into enough Indigenous languages"], a: "It ignored traditional dietary patterns relying on land-based foods", e: "Critics said the guide largely ignored Indigenous communities' traditional land-based dietary patterns." },
        { q: "How did the government respond to the criticism about Indigenous food patterns?", opts: ["By rewriting the whole guide","By acknowledging the gap and committing to developing supplementary resources","By adding a new food category for game meats","By consulting Indigenous elders to revise the plate model"], a: "By acknowledging the gap and committing to developing supplementary resources", e: "The government acknowledged the gap and committed to developing supplementary resources." },
        { q: "Which of the following is NOT listed as a protein food in the 2019 guide?", opts: ["Tofu","Lentils","Yogurt","Cheese"], a: "Cheese", e: "The passage lists beans, lentils, tofu, fish, eggs, lean meat, and nuts as protein foods — cheese is not specifically listed." }
      ]
    },
    p4: {
      title: "Should Canadian Cities Ban Single-Use Plastics Entirely?",
      viewpoints: [
        {
          name: "Amelia Chen, environmental policy researcher",
          text: "A complete ban on single-use plastics is both necessary and overdue. The evidence from cities that have already implemented bans shows significant reductions in plastic waste reaching waterways within just two years. The alternatives — compostable bags, reusable containers, paper packaging — are readily available and are rapidly decreasing in cost. The argument that bans harm low-income consumers is contradicted by studies showing that reusable options save money over time. Governments need to stop waiting for voluntary corporate action and mandate change."
        },
        {
          name: "Jordan Lee, retail business owner",
          text: "I support reducing plastic waste, but an outright ban is impractical for small businesses like mine. Single-use plastics remain the cheapest and most hygienic option for many food packaging needs. The alternatives often cost two to four times more, and those costs get passed directly to consumers. I would prefer a phased approach — tax incentives for businesses that switch, subsidies for compostable alternatives, and a realistic five-year transition timeline rather than an overnight ban that will hurt small retailers disproportionately."
        },
        {
          name: "Dr. Marcus Webb, public health physician",
          text: "The public health dimension of plastic pollution is consistently underreported. Microplastics have now been found in human blood, breast milk, and lung tissue. We do not fully understand the long-term health consequences, but the precautionary principle demands that we act. From a public health perspective, delays in regulation are equivalent to accepting ongoing population-level exposure to potentially harmful substances. The inconvenience of transitioning to alternative packaging is trivial compared to what we may be doing to human health."
        },
        {
          name: "Sandra Kowalski, municipal waste management director",
          text: "In practice, the effectiveness of single-use plastic bans depends heavily on what infrastructure is in place to handle the alternatives. Compostable packaging is only beneficial if it is actually composted — if it ends up in landfill, it may produce methane. Our city currently composites less than thirty percent of eligible organic waste. Before mandating plastic alternatives, we need significant investment in composting capacity, public education, and sorting infrastructure. A ban without infrastructure investment risks replacing one problem with another."
        }
      ],
      questions: [
        { q: "Which speaker believes the ban is both necessary and overdue?", opts: ["Jordan Lee","Dr. Marcus Webb","Amelia Chen","Sandra Kowalski"], a: "Amelia Chen", e: "Amelia Chen says a complete ban is 'both necessary and overdue.'" },
        { q: "What does Jordan Lee prefer instead of an outright ban?", opts: ["A voluntary agreement among large corporations","A phased approach with incentives and a five-year timeline","An immediate ban with subsidies for affected businesses","Continued use of single-use plastics with better disposal systems"], a: "A phased approach with incentives and a five-year timeline", e: "Jordan Lee prefers a phased approach with tax incentives, subsidies, and a five-year transition." },
        { q: "Which speaker raises a concern about microplastics in the human body?", opts: ["Amelia Chen","Sandra Kowalski","Jordan Lee","Dr. Marcus Webb"], a: "Dr. Marcus Webb", e: "Dr. Webb mentions microplastics found in human blood, breast milk, and lung tissue." },
        { q: "What does Sandra Kowalski say about compostable packaging?", opts: ["It is always better than plastic","It is only beneficial if it is actually composted","It is currently too expensive for most cities","It has already solved the plastic problem in other cities"], a: "It is only beneficial if it is actually composted", e: "Sandra says compostable packaging is only beneficial if composted — in landfill it may produce methane." },
        { q: "What percentage of eligible organic waste does Sandra's city currently compost?", opts: ["Less than ten percent","About twenty percent","Less than thirty percent","Over fifty percent"], a: "Less than thirty percent", e: "Sandra says the city currently composts less than thirty percent of eligible organic waste." },
        { q: "How does Amelia Chen respond to concerns about cost impacts on low-income consumers?", opts: ["She acknowledges it is a valid concern","She says alternatives cost two to four times more","She says reusable options save money over time","She suggests the government should subsidise alternatives"], a: "She says reusable options save money over time", e: "Amelia says studies show reusable options save money over time, contradicting the cost concern." },
        { q: "Which speaker is most focused on the immediate economic impact on small businesses?", opts: ["Amelia Chen","Jordan Lee","Dr. Marcus Webb","Sandra Kowalski"], a: "Jordan Lee", e: "Jordan Lee focuses on how bans disproportionately hurt small retailers." },
        { q: "What principle does Dr. Webb invoke to argue for action?", opts: ["The economic efficiency principle","The precautionary principle","The free market principle","The public interest principle"], a: "The precautionary principle", e: "Dr. Webb says the precautionary principle demands acting in the face of uncertain health risks." },
        { q: "Which two speakers would most likely agree that a simple, immediate ban is the wrong approach?", opts: ["Amelia Chen and Dr. Marcus Webb","Jordan Lee and Sandra Kowalski","Amelia Chen and Sandra Kowalski","Dr. Marcus Webb and Jordan Lee"], a: "Jordan Lee and Sandra Kowalski", e: "Jordan Lee wants a phased approach and Sandra wants infrastructure first — both oppose an immediate ban." },
        { q: "What does Sandra Kowalski suggest is needed before mandating plastic alternatives?", opts: ["A public vote on the issue","Significant investment in composting capacity, education, and sorting infrastructure","A full ban on imports of plastic packaging","A five-year government study on alternatives"], a: "Significant investment in composting capacity, education, and sorting infrastructure", e: "Sandra says investment in composting capacity, public education, and sorting infrastructure is needed first." }
      ]
    }
  }
];

// ─── WRITING DATA ──────────────────────────────────────────────────────────────
// Task 1: Email (3 bullet points, 150-200 words, 27 min)
// Task 2: Survey/opinion response (choose 1 of 2 positions, 150-200 words, 26 min)

const W_DATA = [
  // 30 pairs of writing tasks
  {
    task1: {
      scenario: "You recently moved into a new apartment building. You have noticed that the recycling bins in the building are often overflowing and recyclable items are being left on the floor beside them.",
      recipient: "your building manager",
      bullets: [
        "Describe the problem you have observed",
        "Explain why this is a concern for residents",
        "Suggest a solution or ask the manager to take action"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is considering one of the following changes to local transit. Which do you think is the better option?",
      option_a: "Reduce bus fares by 50% for all riders",
      option_b: "Add 20 new electric buses to extend service to underserved areas",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You borrowed a book from a friend three months ago and have been unable to return it because it was accidentally packed away during a house move.",
      recipient: "your friend",
      bullets: [
        "Apologise for not returning the book sooner",
        "Explain what happened",
        "Suggest how you will return it or make it up to your friend"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your employer is deciding how to support staff wellbeing. Which policy do you think would be more effective?",
      option_a: "Provide free gym membership to all employees",
      option_b: "Allow employees to finish work one hour early every Friday",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You attended a local restaurant last week and were disappointed by the service and the quality of the food. You had made a reservation but the table was not ready for 45 minutes.",
      recipient: "the restaurant manager",
      bullets: [
        "Describe your experience in detail",
        "State how the situation affected you",
        "Request some form of compensation or resolution"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your neighbourhood community centre is planning a new programme. Which option do you think should be prioritised?",
      option_a: "A free after-school programme for children aged 6–12",
      option_b: "A free social programme for seniors aged 65 and older",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "Your neighbour has recently started a home renovation project that involves very loud construction work beginning at 7:00 am on weekdays and on weekends.",
      recipient: "your neighbour",
      bullets: [
        "Explain how the noise is affecting you",
        "Ask about the timeline for the renovation",
        "Propose a compromise that would work for both of you"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is planning to use a large vacant lot in the downtown area. Which do you think is the better use of the space?",
      option_a: "Build a new public park with green space and playgrounds",
      option_b: "Develop affordable housing units to address the housing shortage",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently completed a continuing education course at a local college and were very impressed by the instructor and the quality of the programme.",
      recipient: "the college's continuing education department",
      bullets: [
        "Describe what you enjoyed about the course",
        "Comment on the instructor's teaching style",
        "Suggest a topic for a follow-up course you would like to see offered"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "A local organisation is considering a new fundraising approach. Which do you think would be more effective?",
      option_a: "Hold a large annual gala dinner event with ticket sales",
      option_b: "Launch an online crowdfunding campaign with monthly donor options",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are a tenant who needs to break your lease agreement six months early due to a job relocation to another city.",
      recipient: "your landlord",
      bullets: [
        "Explain your reason for needing to break the lease",
        "State when you plan to vacate the property",
        "Ask about the process and any potential penalties"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is considering a new approach to reducing traffic congestion in the downtown core. Which policy do you prefer?",
      option_a: "Introduce a congestion charge for vehicles entering the downtown area on weekdays",
      option_b: "Expand free bicycle-sharing stations throughout the city to encourage cycling",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently purchased a laptop from an electronics store. Within two weeks, the screen began showing lines and flickering, making it unusable for your work.",
      recipient: "the store's customer service department",
      bullets: [
        "Describe the problem with the laptop",
        "Mention how the issue is affecting your work",
        "Request a replacement or refund"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your school district is deciding how to spend a budget surplus. Which investment do you think should be prioritised?",
      option_a: "Purchase new tablets and technology equipment for all classrooms",
      option_b: "Hire additional specialist support teachers for students with learning differences",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "Your co-worker recently helped you complete a major project when you were ill and behind schedule. You want to write a message acknowledging their support.",
      recipient: "your co-worker",
      bullets: [
        "Thank them for their specific help during the project",
        "Explain how their support made a difference to you",
        "Suggest a way to show your appreciation"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your company is considering a change to its work schedule policy. Which option do you prefer?",
      option_a: "A four-day work week with longer daily hours",
      option_b: "Standard five-day week but with two mandatory work-from-home days",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You noticed that a street near your home has a pothole that has been growing for several weeks and is now large enough to damage vehicles.",
      recipient: "your local city councillor",
      bullets: [
        "Describe the location and severity of the pothole",
        "Explain the risks it poses to drivers",
        "Request that it be repaired as soon as possible"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your community is considering a new initiative to encourage environmental awareness. Which approach do you think would be more effective?",
      option_a: "Introduce a mandatory composting programme for all households",
      option_b: "Run a voluntary school-based environmental education programme",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You volunteered at a local food bank last weekend and would like to encourage a friend who mentioned they are looking for ways to give back to the community.",
      recipient: "your friend",
      bullets: [
        "Describe your experience at the food bank",
        "Explain what types of volunteers are needed",
        "Encourage your friend to consider volunteering there"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is planning changes to how it manages public libraries. Which approach do you think is better?",
      option_a: "Keep all library branches open but reduce opening hours to save costs",
      option_b: "Close two smaller branches and use the savings to fully upgrade the central library",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You attended a job interview last week and would like to send a follow-up message to the hiring manager thanking them for their time.",
      recipient: "the hiring manager",
      bullets: [
        "Thank the interviewer for their time and the opportunity",
        "Briefly reiterate your interest in the position",
        "Mention one specific point from the interview that you found particularly interesting"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city council is debating how to address homelessness in the downtown area. Which policy do you think should be prioritised?",
      option_a: "Invest in more emergency shelter beds to meet immediate needs",
      option_b: "Fund long-term supportive housing with on-site mental health services",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "Your family is planning a birthday celebration for your parent's 60th birthday. You need to enquire about booking a private room at a local restaurant.",
      recipient: "the restaurant reservation team",
      bullets: [
        "Describe the event and the number of guests",
        "Ask about availability and pricing for a private room",
        "Enquire about menu options or any special arrangements"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your neighbourhood association is deciding how to improve local safety. Which initiative do you support?",
      option_a: "Install more street lights on poorly lit roads and pathways",
      option_b: "Create a neighbourhood watch programme run by trained volunteers",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "Your child recently started attending a new school. You would like to introduce yourself to the class teacher and share some important information about your child.",
      recipient: "your child's class teacher",
      bullets: [
        "Introduce yourself and your child",
        "Share one or two important things about your child that would help the teacher",
        "Express your willingness to stay involved and ask how you can best support your child's learning"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your workplace is considering a new health and wellness initiative. Which option do you prefer?",
      option_a: "Provide standing desks and ergonomic equipment to all employees",
      option_b: "Offer subsidised healthy meal options in the staff cafeteria",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently adopted a rescue dog and are finding it difficult to take the dog to work. You want to ask your employer whether you can bring the dog to the office on certain days.",
      recipient: "your manager or HR department",
      bullets: [
        "Explain your situation and why you are making the request",
        "Describe the dog and explain why it would not disrupt the workplace",
        "Suggest specific days or conditions that would make the arrangement work"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your provincial government is considering two policies to improve healthcare access. Which do you prefer?",
      option_a: "Expand the number of nurse practitioners authorised to work independently in rural clinics",
      option_b: "Launch a telehealth platform to give all residents free virtual doctor consultations",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are writing to a non-profit organisation that provides free settlement services for newcomers to Canada. You need help with several things after recently arriving.",
      recipient: "the settlement services coordinator",
      bullets: [
        "Introduce yourself and explain your situation briefly",
        "Describe two specific types of help you need",
        "Ask how to access the services and what documents to bring"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your school is considering how to help students manage stress and mental health. Which approach do you think is more effective?",
      option_a: "Hire a dedicated school counsellor available to all students weekly",
      option_b: "Incorporate mindfulness and stress management into the regular curriculum",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are a member of a community choir that is looking for a new rehearsal space. You have identified a local church hall that might be suitable.",
      recipient: "the church hall administrator",
      bullets: [
        "Describe your group and what the space would be used for",
        "Ask about availability and rental fees",
        "Enquire about any equipment or facilities that are included"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your municipality is planning to reduce its budget and must choose between two areas to cut spending. Which cut do you think is more acceptable?",
      option_a: "Reduce the frequency of park maintenance and grass cutting",
      option_b: "Close one of the two public outdoor swimming pools during winter months",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You ordered furniture online six weeks ago and the order still has not arrived. The tracking system shows the order has been stuck at a regional warehouse for three weeks.",
      recipient: "the online furniture company's customer service",
      bullets: [
        "Describe the order and how long you have been waiting",
        "Explain the problem you can see in the tracking system",
        "Request an immediate update and ask what compensation is available for the delay"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is deciding how to use a special grant to improve outdoor spaces. Which project do you prefer?",
      option_a: "Build a covered outdoor skating rink for year-round use",
      option_b: "Restore a historic waterfront area with walking trails and seating",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently moved to a new city for work and are looking for advice on the best neighbourhood to rent in. A former colleague lives there and you want to ask for their recommendations.",
      recipient: "your former colleague",
      bullets: [
        "Explain your situation and when you are planning to move",
        "Describe what you are looking for in a neighbourhood",
        "Ask for their specific recommendations and any tips they have"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your local government is considering a new approach to encouraging healthy eating. Which policy do you support?",
      option_a: "Impose a tax on sugary drinks and junk food",
      option_b: "Provide subsidies to make fresh produce cheaper at grocery stores",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are the organiser of a small community running club. You want to get permission to use a local park's paths for weekly group runs on Saturday mornings.",
      recipient: "the city parks department",
      bullets: [
        "Describe your running club and how many members attend",
        "Explain what you are requesting and on which days and times",
        "Ask whether any permits or conditions are required"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is debating how best to encourage residents to use public transit. Which approach do you prefer?",
      option_a: "Offer free monthly transit passes to residents who give up a parking permit",
      option_b: "Increase parking fees in the downtown core to make driving less attractive",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You have been caring for an elderly parent at home for the past year and are finding it increasingly difficult to manage this alongside your work responsibilities.",
      recipient: "your employer or HR representative",
      bullets: [
        "Explain your caregiving situation briefly",
        "Describe how it is affecting your work schedule",
        "Request a flexible work arrangement and suggest what would help"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your community is considering how to support local small businesses. Which approach would you recommend?",
      option_a: "Create a 'buy local' campaign to raise awareness and encourage residents to shop locally",
      option_b: "Lobby the municipality to reduce business property taxes for local shops",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently attended a professional development workshop that was paid for by your employer. You would like to share what you learned with your team.",
      recipient: "your team members",
      bullets: [
        "Briefly describe the workshop and what it covered",
        "Share two key things you learned that are relevant to your team",
        "Suggest a time to discuss how to apply these ideas at work"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is considering how to address the shortage of affordable housing. Which approach do you prefer?",
      option_a: "Introduce rent control legislation to limit annual rent increases",
      option_b: "Provide incentives for developers to build more affordable units on underused land",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "Your community is organising a winter fundraiser for a local charity and you want to recruit a friend who runs a small bakery to donate baked goods for the event.",
      recipient: "your friend who owns the bakery",
      bullets: [
        "Describe the event and the charity it supports",
        "Explain specifically what you are hoping they can donate",
        "Mention any benefits or recognition they would receive for their donation"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your school board is considering how to address low student engagement. Which strategy do you prefer?",
      option_a: "Introduce a peer mentoring programme pairing older and younger students",
      option_b: "Redesign the curriculum to include more project-based and hands-on learning",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are writing on behalf of your sports team to ask a local business to become a sponsor for the upcoming season.",
      recipient: "the local business owner",
      bullets: [
        "Introduce your team and describe who participates",
        "Explain what the sponsorship would involve",
        "Describe the benefits the business would receive in return"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is considering a new policy to reduce food waste. Which approach do you prefer?",
      option_a: "Require restaurants and grocery stores to donate unsold food to food banks at the end of each day",
      option_b: "Launch a public campaign educating households on how to reduce food waste at home",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You signed up for a fitness class at a local gym but after attending twice, you realise the class is not at all as it was described in the brochure. The instructor also frequently arrives late.",
      recipient: "the gym manager",
      bullets: [
        "Describe the class as advertised and how it differs from what is being delivered",
        "Mention the punctuality issue",
        "Request a transfer to a different class or a refund"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your local council is considering two approaches to managing increasing numbers of tourists in popular natural areas. Which do you prefer?",
      option_a: "Introduce a visitor cap and booking system to limit daily entries to protected areas",
      option_b: "Invest in new infrastructure to support more visitors without damaging the environment",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are writing to your local member of parliament about a crosswalk near a school that you believe is dangerous for children.",
      recipient: "your local Member of Parliament",
      bullets: [
        "Describe the location and why it is dangerous",
        "Mention specific incidents or concerns from parents",
        "Request a specific improvement such as a traffic light or crossing guard"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your provincial government is considering how to reduce greenhouse gas emissions from transport. Which policy do you support?",
      option_a: "Offer cash rebates to residents who purchase electric vehicles",
      option_b: "Invest in expanding electric bus and light rail transit networks",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently received a parking ticket that you believe was issued in error — you were parked legally in a valid permit zone but the officer did not notice your displayed permit.",
      recipient: "the city's parking authority",
      bullets: [
        "Explain the circumstances of the ticket",
        "Describe the evidence you have to support your appeal",
        "Request that the ticket be cancelled"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is planning to improve support for new immigrants. Which initiative do you think should be prioritised?",
      option_a: "Expand free language training programmes available in evenings and on weekends",
      option_b: "Create a mentorship programme matching new immigrants with established professionals in their field",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are writing to a campground to book a camping spot for an upcoming long weekend trip with your family.",
      recipient: "the campground booking coordinator",
      bullets: [
        "State the dates you want to book and how many people will be in your group",
        "Ask about available site types and amenities",
        "Enquire about cancellation policies and payment methods"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city council is deciding how to support local arts and culture. Which investment do you prefer?",
      option_a: "Fund free outdoor summer concerts and community arts festivals",
      option_b: "Provide grants to help local artists set up permanent studios and galleries",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You recently returned from a trip abroad and discovered that your travel insurance company has declined to cover a significant medical expense you incurred due to a minor illness.",
      recipient: "the travel insurance company",
      bullets: [
        "Describe the medical situation and the expense incurred",
        "Explain why you believe the claim should be covered",
        "Request a review of the decision or an explanation of the grounds for refusal"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your city is considering how to support aging residents. Which policy do you prefer?",
      option_a: "Expand home care services so seniors can remain independent in their own homes longer",
      option_b: "Build a new publicly funded seniors' centre offering social programmes and health services",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are writing to your local library to propose a new programme: a monthly book club for newcomers to Canada, designed to help participants practise English while connecting with their community.",
      recipient: "the library programme coordinator",
      bullets: [
        "Describe the programme you are proposing and who it is for",
        "Explain why you think the library is the right place for such a programme",
        "Ask what support or resources the library might be able to provide"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your workplace is considering a new policy to encourage professional development. Which approach do you prefer?",
      option_a: "Provide each employee with an annual budget to spend on any approved training or course",
      option_b: "Organise monthly in-house workshops delivered by senior staff members",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  },
  {
    task1: {
      scenario: "You are part of a parent committee at your child's school. You want to write to the principal suggesting that the school start a breakfast programme for students who arrive without having eaten.",
      recipient: "the school principal",
      bullets: [
        "Explain why you believe a breakfast programme is needed",
        "Describe what the programme could look like and who would run it",
        "Ask for the principal's support and suggest a meeting to discuss the idea further"
      ],
      rubric: ["task fulfillment","coherence and cohesion","vocabulary","grammar","format"]
    },
    task2: {
      prompt: "Your province is considering two policies to improve road safety. Which policy do you prefer?",
      option_a: "Lower the speed limit on all urban roads from 50 km/h to 40 km/h",
      option_b: "Install automated speed cameras on school zones and residential streets",
      rubric: ["task fulfillment","coherence","vocabulary","grammar","argument quality"]
    }
  }
];

// ─── SPEAKING DATA ─────────────────────────────────────────────────────────────
// 8 tasks per test, matching CELPIP task types exactly
const SP_DATA = [
  // Test 1
  [
    { task: 1, type: "giving_advice", prepSec: 30, respSec: 90, title: "Giving Advice",
      prompt: "A friend who recently moved to Canada is struggling to make friends and feels isolated in their new city. They have been spending most of their time at home. What advice would you give them to help build a social life and connect with their community?",
      tip: "Suggest 2–3 specific and practical actions. Explain why each would help." },
    { task: 2, type: "personal_experience", prepSec: 30, respSec: 60, title: "Talking About a Personal Experience",
      prompt: "Describe a time when you had to adapt to a new situation or environment. What was the situation, how did you cope, and what did you learn from the experience?",
      tip: "Use specific details. Organise your response with a clear beginning, middle, and reflection." },
    { task: 3, type: "describing_a_scene", prepSec: 30, respSec: 60, title: "Describing a Scene",
      sceneDescription: "A busy Saturday morning farmers' market in a town square. There are colourful stalls selling fresh vegetables, baked goods, and flowers. A family is browsing the vegetable stall on the left. A musician is playing guitar near the fountain in the centre. A child is pointing at some strawberries while their parent holds a cloth bag. People are chatting and the square is crowded.",
      prompt: "Describe everything you can see in the scene in as much detail as possible.",
      tip: "Describe the foreground, background, people, activities, and atmosphere." },
    { task: 4, type: "making_predictions", prepSec: 30, respSec: 60, title: "Making Predictions",
      sceneDescription: "A woman in a business suit is standing outside an office building, looking at her phone with a concerned expression. A taxi is parked at the kerb with its door open. She is carrying a laptop bag and what appears to be an interview portfolio folder.",
      prompt: "Based on what you see, describe what you think is happening and what might happen next. Give at least two predictions.",
      tip: "Use future tense and give reasons for your predictions based on what you see." },
    { task: 5, type: "comparing_and_persuading", prepSec: 30, respSec: 60, title: "Comparing and Persuading",
      optionA: { label: "Option A", description: "Live in a small town — quiet environment, lower cost of living, close community, but fewer job opportunities and less access to services." },
      optionB: { label: "Option B", description: "Live in a large city — wide job market, excellent public services and transit, but higher living costs and more crowded and fast-paced." },
      prompt: "Compare these two living options and persuade your partner that one is better than the other. Give clear reasons for your choice.",
      tip: "Acknowledge the strengths of both, then argue convincingly for one." },
    { task: 6, type: "dealing_with_situation", prepSec: 30, respSec: 60, title: "Dealing with a Difficult Situation",
      prompt: "You are a team leader at work. One of your team members has been consistently arriving late and missing deadlines, which is affecting the rest of the team. You need to speak with this person. What would you say, and how would you handle the conversation?",
      tip: "Be diplomatic but clear. Acknowledge, explain the impact, and offer support or a path forward." },
    { task: 7, type: "expressing_opinions", prepSec: 30, respSec: 90, title: "Expressing Opinions",
      prompt: "Some people believe that university education should be free for all citizens, funded entirely by the government. Others believe students should pay tuition fees because they benefit personally from higher education. What is your opinion? Give specific reasons and examples to support your view.",
      tip: "State your position clearly, give 2–3 reasons, and acknowledge the opposing view briefly." },
    { task: 8, type: "unusual_situation", prepSec: 30, respSec: 60, title: "Describing an Unusual Situation",
      sceneDescription: "A photograph of a living room where everything — the sofa, the bookshelf, the TV, and even the plant — is wrapped in bubble wrap. The family appears to have done this deliberately. A child is sitting on the bubble-wrap-covered sofa looking content.",
      prompt: "Describe what is unusual about this situation and suggest reasons why the family might have done this. What do you think is going on?",
      tip: "Be creative but logical. Describe the scene, explain what is strange, and give at least two possible explanations." }
  ],
  // Test 2
  [
    { task: 1, type: "giving_advice", prepSec: 30, respSec: 90, title: "Giving Advice",
      prompt: "Your neighbour is about to renovate their kitchen for the first time and is very nervous about going over budget and making the wrong choices. They have asked you for advice. What would you tell them to help them plan and execute the renovation successfully?",
      tip: "Give 2–3 concrete, specific tips. Explain the potential consequences of not following the advice." },
    { task: 2, type: "personal_experience", prepSec: 30, respSec: 60, title: "Talking About a Personal Experience",
      prompt: "Describe a time when you helped someone in an unexpected or difficult situation. What happened, how did you help, and what was the outcome?",
      tip: "Include specific details about the person, the situation, and what you did." },
    { task: 3, type: "describing_a_scene", prepSec: 30, respSec: 60, title: "Describing a Scene",
      sceneDescription: "A hospital waiting room. Several people are seated in rows of chairs. A young woman is reading a magazine. An elderly man has his arm in a sling and looks tired. A mother is comforting a small child. A nurse is standing at the reception desk talking to a man who appears anxious. A television on the wall is showing a news programme.",
      prompt: "Describe everything you can see in this scene in as much detail as possible.",
      tip: "Describe people, their appearances, expressions, activities, and the overall atmosphere." },
    { task: 4, type: "making_predictions", prepSec: 30, respSec: 60, title: "Making Predictions",
      sceneDescription: "A group of university students is gathered around a table covered in empty coffee cups and open textbooks. One student has their head in their hands. It is clearly very late at night — the windows are dark and a clock on the wall shows 2:00 am.",
      prompt: "What do you think is happening in this scene, and what do you predict will happen next? Give at least two predictions.",
      tip: "Describe what you observe and give specific, reasoned predictions about what comes next." },
    { task: 5, type: "comparing_and_persuading", prepSec: 30, respSec: 60, title: "Comparing and Persuading",
      optionA: { label: "Option A", description: "Work for a large established corporation — job security, good benefits, structured career path, but less creative freedom and potentially slower promotion." },
      optionB: { label: "Option B", description: "Work for a small startup — exciting and fast-paced, more responsibility and creativity, but less job security and fewer structured benefits." },
      prompt: "Compare these two workplace options and convince your friend that one is better. Give clear reasons for your recommendation.",
      tip: "Consider both options fairly, then argue for one with confidence." },
    { task: 6, type: "dealing_with_situation", prepSec: 30, respSec: 60, title: "Dealing with a Difficult Situation",
      prompt: "You borrowed your roommate's bicycle without asking permission and accidentally damaged the front wheel. You need to tell your roommate what happened. What would you say, and how would you handle this conversation?",
      tip: "Be honest, take responsibility, apologise sincerely, and offer a solution." },
    { task: 7, type: "expressing_opinions", prepSec: 30, respSec: 90, title: "Expressing Opinions",
      prompt: "Some people believe that social media companies should be legally responsible for all harmful content posted on their platforms. Others argue that it is impossible to moderate all content and that over-regulation would restrict freedom of speech. What is your view? Support your opinion with specific reasons and examples.",
      tip: "Give a clear position and support it with 2–3 well-explained reasons." },
    { task: 8, type: "unusual_situation", prepSec: 30, respSec: 60, title: "Describing an Unusual Situation",
      sceneDescription: "A photograph showing an office where every desk has a live plant growing out of the computer keyboard. The plants are flowering and appear healthy. Employees at their desks appear to be working normally, as if this is completely ordinary.",
      prompt: "Describe what is unusual about this photo and suggest at least two possible explanations for why this might be happening.",
      tip: "Describe the image clearly, identify what is strange, and offer creative but plausible explanations." }
  ]
];

// ─── TOPIC POOL (30 unique themes for test variety) ──────────────────────────
const TOPICS_30 = [
  "moving to a new city","navigating the healthcare system","finding employment in Canada",
  "renting a home","using public transit","opening a bank account","winter preparedness",
  "community volunteering","childcare in Canada","recycling and the environment",
  "managing a household budget","Canadian education system","workplace communication",
  "getting a driver's licence","applying for government benefits","cooking and nutrition",
  "staying connected with family abroad","civic participation","local food banks and charity",
  "home maintenance","Canadian multiculturalism","starting a small business",
  "dealing with workplace conflict","outdoor recreation in Canada","cultural adjustment",
  "using digital government services","healthy relationships","personal financial planning",
  "navigating immigration paperwork","seasonal changes and adapting to Canadian climate"
];

// ─── GENERATORS ───────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(3,"0"); }
function uid(prefix, n, suffix) { return `${prefix}-${pad(n)}-${suffix}`; }

function makeListeningTest(n) {
  const num = pad(n);
  const dataIdx = (n - 1) % L_DATA.length;
  const d = L_DATA[dataIdx];
  const topic = TOPICS_30[(n-1) % TOPICS_30.length];

  const scripts = ["p1","p2","p3","p4","p5","p6"].map((pk, si) => {
    const part = d[pk];
    return {
      id: `celpip-listening-${num}-s${si+1}`,
      part: si + 1,
      sectionPart: si + 1,
      title: part.title,
      text: part.script,
      audioUrl: "",
      internalVoiceConfig: { hidden: true }
    };
  });

  let qNum = 0;
  const questions = [];
  ["p1","p2","p3","p4","p5","p6"].forEach((pk, si) => {
    const part = d[pk];
    part.questions.forEach((q, qi) => {
      qNum++;
      questions.push({
        id: `celpip-listening-${num}-q${String(qNum).padStart(2,"0")}`,
        audioScriptId: `celpip-listening-${num}-s${si+1}`,
        questionType: "multiple_choice_single",
        part: si + 1,
        prompt: q.q,
        options: q.opts,
        correctAnswer: q.a,
        explanation: q.e,
        difficulty: qi < 2 ? "easy" : qi < 4 ? "medium" : "hard",
        topic
      });
    });
  });

  return {
    id: `celpip-listening-${num}`,
    exam: "celpip", section: "listening", type: "section",
    title: `CELPIP Listening Practice Test ${n}`,
    durationSeconds: 3300, questionCount: questions.length,
    instructions: "Listen to the audio for each part and answer the questions. Each audio plays once only.",
    parts: [
      { part: 1, title: "Problem Solving", questionRange: "1–8", description: "A conversation in which one person has a problem and seeks help from another." },
      { part: 2, title: "Daily Life Conversation", questionRange: "9–13", description: "A casual conversation between two people about an everyday situation." },
      { part: 3, title: "Listening for Information", questionRange: "14–19", description: "A monologue providing information about a service, process, or topic." },
      { part: 4, title: "News Item", questionRange: "20–24", description: "A short radio or TV news report about a current event or announcement." },
      { part: 5, title: "Discussion", questionRange: "25–32", description: "A discussion between two or three speakers presenting different viewpoints on a topic." },
      { part: 6, title: "Viewpoints", questionRange: "33–38", description: "A monologue in which one speaker expresses and defends a personal opinion." }
    ],
    listeningScripts: scripts,
    questions
  };
}

function makeReadingTest(n) {
  const num = pad(n);
  const dataIdx = (n - 1) % R_DATA.length;
  const d = R_DATA[dataIdx];
  const topic = TOPICS_30[(n-1) % TOPICS_30.length];

  // Passages
  const passages = [
    {
      id: `celpip-reading-${num}-p1`,
      part: 1, partTitle: "Reading for Correspondence",
      type: "correspondence",
      title: d.p1.title,
      emails: d.p1.emails
    },
    {
      id: `celpip-reading-${num}-p2`,
      part: 2, partTitle: "Applying a Diagram",
      type: "schedule",
      title: d.p2.title,
      intro: d.p2.intro,
      schedule: d.p2.schedule
    },
    {
      id: `celpip-reading-${num}-p3`,
      part: 3, partTitle: "Reading for Information",
      type: "article",
      title: d.p3.title,
      content: d.p3.content
    },
    {
      id: `celpip-reading-${num}-p4`,
      part: 4, partTitle: "Reading for Viewpoints",
      type: "viewpoints",
      title: d.p4.title,
      viewpoints: d.p4.viewpoints
    }
  ];

  let qNum = 0;
  const questions = [];
  const partKeys = [["p1",1],["p2",2],["p3",3],["p4",4]];
  partKeys.forEach(([pk, partNum]) => {
    d[pk].questions.forEach((q, qi) => {
      qNum++;
      const base = {
        id: `celpip-reading-${num}-q${String(qNum).padStart(2,"0")}`,
        passageId: `celpip-reading-${num}-p${partNum}`,
        part: partNum,
        topic
      };
      if (q.opts) {
        questions.push({ ...base, questionType: "multiple_choice_single",
          prompt: q.q, options: q.opts, correctAnswer: q.a, explanation: q.e,
          difficulty: qi < 3 ? "easy" : qi < 6 ? "medium" : "hard" });
      } else {
        questions.push({ ...base, questionType: "fill_in_the_blank",
          prompt: q.q, correctAnswer: q.a, explanation: q.e, difficulty: "medium" });
      }
    });
  });

  return {
    id: `celpip-reading-${num}`,
    exam: "celpip", section: "reading", type: "section",
    title: `CELPIP Reading Practice Test ${n}`,
    durationSeconds: 3300, questionCount: questions.length,
    instructions: "Read each passage carefully and answer the questions. You may scroll back within each part.",
    parts: [
      { part: 1, title: "Reading for Correspondence", questions: 11, time: "11 min", description: "Read an email or letter exchange and answer questions about content and purpose." },
      { part: 2, title: "Applying a Diagram", questions: 8, time: "9 min", description: "Read a schedule, chart, or diagram and match information to answer questions." },
      { part: 3, title: "Reading for Information", questions: 9, time: "10 min", description: "Read an informational article and answer questions about details, vocabulary, and inferences." },
      { part: 4, title: "Reading for Viewpoints", questions: 10, time: "13 min", description: "Read four short opinion pieces on the same topic and answer questions about each writer's viewpoint." }
    ],
    passages,
    questions
  };
}

function makeWritingTest(n) {
  const num = pad(n);
  const wIdx = (n - 1) % W_DATA.length;
  const d = W_DATA[wIdx];
  return {
    id: `celpip-writing-${num}`,
    exam: "celpip", section: "writing", type: "section",
    title: `CELPIP Writing Practice Test ${n}`,
    durationSeconds: 3180, questionCount: 2,
    instructions: "Complete both writing tasks. Aim for 150–200 words per response. You will be assessed on content, vocabulary, grammar, and task fulfillment.",
    tasks: [
      {
        id: `celpip-writing-${num}-t1`,
        taskNumber: 1,
        taskType: "email",
        title: "Email Writing",
        timeMinutes: 27,
        wordCountGuideline: "150–200 words",
        scenario: d.task1.scenario,
        recipient: d.task1.recipient,
        bulletPoints: d.task1.bullets,
        formatGuidance: "Include a subject line, a greeting, a structured body addressing all three bullet points, and a closing with your name.",
        rubric: d.task1.rubric,
        modelAnswerNotes: "A strong response will address all three bullet points clearly, maintain an appropriate formal or semi-formal tone, and use varied vocabulary and accurate grammar."
      },
      {
        id: `celpip-writing-${num}-t2`,
        taskNumber: 2,
        taskType: "survey_response",
        title: "Responding to Survey Questions",
        timeMinutes: 26,
        wordCountGuideline: "150–200 words",
        surveyPrompt: d.task2.prompt,
        optionA: d.task2.option_a,
        optionB: d.task2.option_b,
        formatGuidance: "Clearly state which option you prefer. Give at least two reasons with supporting details. You may briefly acknowledge the other option.",
        rubric: d.task2.rubric,
        modelAnswerNotes: "A strong response will state a clear preference, develop two or more well-explained reasons, and conclude with a summary statement."
      }
    ]
  };
}

function makeSpeakingTest(n) {
  const num = pad(n);
  const spIdx = (n - 1) % SP_DATA.length;
  const tasks = SP_DATA[spIdx];
  return {
    id: `celpip-speaking-${num}`,
    exam: "celpip", section: "speaking", type: "section",
    title: `CELPIP Speaking Practice Test ${n}`,
    durationSeconds: 1200, questionCount: 8,
    instructions: "You will complete 8 speaking tasks. Read the prompt carefully, use your preparation time, then speak clearly and at a natural pace. Aim to fill the response time fully.",
    scoringDimensions: ["Content and Coherence","Vocabulary","Listenability","Task Fulfillment"],
    tasks: tasks.map((t, ti) => ({
      id: `celpip-speaking-${num}-t${ti+1}`,
      taskNumber: t.task,
      taskType: t.type,
      title: t.title,
      prepSeconds: t.prepSec,
      responseSeconds: t.respSec,
      prompt: t.prompt,
      sceneDescription: t.sceneDescription || null,
      optionA: t.optionA || null,
      optionB: t.optionB || null,
      tip: t.tip,
      rubric: ["content_coherence","vocabulary","listenability","task_fulfillment"],
      difficulty: "medium"
    }))
  };
}

function makeMock(n) {
  const num = pad(n);
  return {
    id: `celpip-full-${num}`,
    exam: "celpip", type: "full",
    title: `CELPIP Full Mock Test ${n}`,
    durationSeconds: 12000,
    instructions: "Full CELPIP General mock test. Complete all four sections in order.",
    sections: [
      { section: "listening", testId: `celpip-listening-${num}`, file: `celpip/listening/test-${num}.json` },
      { section: "reading",   testId: `celpip-reading-${num}`,   file: `celpip/reading/test-${num}.json` },
      { section: "writing",   testId: `celpip-writing-${num}`,   file: `celpip/writing/test-${num}.json` },
      { section: "speaking",  testId: `celpip-speaking-${num}`,  file: `celpip/speaking/test-${num}.json` }
    ]
  };
}

// ─── WRITE FILES ──────────────────────────────────────────────────────────────
const DIRS = ["listening","reading","writing","speaking","full"];
DIRS.forEach(d => fs.mkdirSync(path.join(BASE, d), { recursive: true }));

let counts = { listening: 0, reading: 0, writing: 0, speaking: 0, full: 0 };
for (let n = 1; n <= 30; n++) {
  const num = pad(n);
  const lt = makeListeningTest(n);
  const rt = makeReadingTest(n);
  const wt = makeWritingTest(n);
  const st = makeSpeakingTest(n);
  const mt = makeMock(n);

  fs.writeFileSync(path.join(BASE,"listening",`test-${num}.json`), JSON.stringify(lt, null, 2));
  fs.writeFileSync(path.join(BASE,"reading",  `test-${num}.json`), JSON.stringify(rt, null, 2));
  fs.writeFileSync(path.join(BASE,"writing",  `test-${num}.json`), JSON.stringify(wt, null, 2));
  fs.writeFileSync(path.join(BASE,"speaking", `test-${num}.json`), JSON.stringify(st, null, 2));
  fs.writeFileSync(path.join(BASE,"full",     `mock-${num}.json`), JSON.stringify(mt, null, 2));

  counts.listening++; counts.reading++; counts.writing++; counts.speaking++; counts.full++;
  process.stdout.write(`\rWritten test ${n}/30...`);
}

console.log(`\n\nDone!`);
console.log(`  Listening tests: ${counts.listening}`);
console.log(`  Reading tests:   ${counts.reading}`);
console.log(`  Writing tests:   ${counts.writing}`);
console.log(`  Speaking tests:  ${counts.speaking}`);
console.log(`  Full mocks:      ${counts.full}`);
console.log(`\nTotal JSON files written: ${Object.values(counts).reduce((a,b)=>a+b,0)}`);
