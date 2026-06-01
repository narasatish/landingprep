// gen-gt-writing.js — creates gt-006 through gt-030 General Training writing tests
"use strict";
const fs   = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DIR  = path.join(ROOT, "content", "ielts", "writing");

const TESTS = [
  { n:"006", type:"congratulations",
    situation:"Your colleague and close friend has just been promoted to a senior management position at your company. You were not able to congratulate them in person because you are currently working abroad on a six-week project.",
    bullets:["congratulate your friend on their promotion","explain why you were unable to congratulate them in person","suggest meeting up to celebrate when you return"],
    essay:"Some people think that success in the workplace depends mostly on natural talent, while others believe hard work and dedication are more important. Discuss both views and give your own opinion." },

  { n:"007", type:"job_application",
    situation:"You have seen a job advertisement for a Marketing Assistant position at a large retail company. The role requires experience in social media management, customer service, and event organisation — all of which you have.",
    bullets:["explain why you are writing and where you saw the advertisement","describe your relevant experience and qualifications","ask for information about the application process and interview dates"],
    essay:"Many companies now allow employees to work from home instead of commuting to an office. What are the advantages and disadvantages of this trend for employees and employers?" },

  { n:"008", type:"recommendation",
    situation:"A former colleague, Jamie, has asked you to write a reference letter to support their application for the position of community centre manager. You worked with Jamie for three years and know them well both professionally and personally.",
    bullets:["explain how you know the person and for how long","describe their relevant skills and key personal qualities","state clearly why you strongly recommend them for this role"],
    essay:"Some people believe that employers should be required by law to hire a certain percentage of employees from minority groups. Others argue that hiring decisions should be based only on qualifications and ability. Discuss both views and give your own opinion." },

  { n:"009", type:"thank_you",
    situation:"You recently stayed with a family friend named Alex for two weeks while attending a training course in another city. Alex went out of their way to make you feel at home, cooked meals for you every day, and helped you navigate the public transport system.",
    bullets:["thank your friend warmly for their hospitality","mention specific things they did that you particularly appreciated","invite them to visit you in return at some point in the future"],
    essay:"It is becoming increasingly common for people to receive gifts in the form of experiences rather than physical objects. Do the advantages of experiential gifts outweigh the disadvantages?" },

  { n:"010", type:"explanation",
    situation:"You work at a company and were absent for three days last week without giving prior notice. This was because your elderly parent had a sudden medical emergency and had to be rushed to hospital. You are now back at work.",
    bullets:["apologise for your absence without prior notice","explain the personal emergency that caused it","suggest how you will catch up on any work you missed during your absence"],
    essay:"Some people think that adults who commit serious crimes should automatically receive the maximum sentence available under the law. Others believe that judges should have the freedom to consider individual circumstances. Discuss both views and give your own opinion." },

  { n:"011", type:"complaint",
    situation:"You live in a block of flats. For the past three weeks, the family living directly above you has been making excessive noise late at night — loud music, heavy footsteps, and parties lasting past midnight — which is seriously affecting your sleep and work performance.",
    bullets:["describe the problem clearly and explain how long it has been happening","explain specifically how this situation is affecting your daily life","say what action you would like the building management to take and by when"],
    essay:"Noise pollution in urban areas has become an increasingly serious problem in recent decades. What are the main causes of this problem and what measures could be introduced to reduce it effectively?" },

  { n:"012", type:"request",
    situation:"The roof in your rented flat has developed a slow leak that has been getting progressively worse over the past two months. You have mentioned it verbally to your landlord on two separate occasions but no action has been taken. Visible water damage is now appearing on the ceiling.",
    bullets:["describe the problem and explain how long it has been going on","explain what attempts you have already made to resolve the issue","request urgent action and specify a reasonable deadline for the repairs to be carried out"],
    essay:"Some people argue that governments should invest more money in maintaining affordable rental housing for low-income residents. Others believe that providing and maintaining rental properties is the sole responsibility of private landlords. Discuss both views and give your own opinion." },

  { n:"013", type:"invitation",
    situation:"You and your family have recently moved into a new home in the neighbourhood. You would like to introduce yourself to your neighbours and invite them to a small housewarming gathering you are planning for the coming weekend.",
    bullets:["introduce yourself and your family to your neighbours","give details of the event including the date, time, and what guests can expect","let them know what to bring if anything and how they can confirm their attendance"],
    essay:"Some people believe that living in a close-knit community where neighbours know each other well offers significant benefits. Others feel that personal privacy and independence are more important. Discuss both views and give your own opinion." },

  { n:"014", type:"apology",
    situation:"Your close friend got married six months ago and you were invited as a guest but had to cancel at very short notice because of an urgent work commitment. You have not been in contact since then and feel you owe your friend both an explanation and a sincere apology.",
    bullets:["apologise sincerely for missing the wedding and for not being in contact since","explain the circumstances that forced you to cancel and why contact has been delayed","suggest a specific way that you could make it up to your friend"],
    essay:"Some people believe that friendship becomes increasingly difficult to maintain as people grow older and take on more responsibilities. To what extent do you agree or disagree with this view?" },

  { n:"015", type:"advice",
    situation:"A close friend of yours has written to tell you they are very unhappy in their current career as an accountant and are seriously considering leaving their stable job to start a small business selling handmade crafts online. They are anxious about the financial risk involved.",
    bullets:["acknowledge how they are feeling about their current situation","offer specific and practical advice about starting a small business","suggest two or three concrete steps they could take before making a final decision"],
    essay:"Starting and running a small business involves significant financial risk. Do you think governments should do more to support people who want to become self-employed? Give reasons for your answer and include relevant examples." },

  { n:"016", type:"complaint",
    situation:"You stayed at a hotel during a recent business trip and paid a premium nightly rate. However, your room was considerably smaller than advertised on the hotel website, the air conditioning was not working, and the complimentary breakfast that was confirmed in your booking was not available.",
    bullets:["describe your complaints in specific detail","explain the impact these problems had on your overall stay and business commitments","state clearly what compensation or remedial action you expect from the hotel management"],
    essay:"The global hospitality and tourism industry has expanded rapidly in recent decades. What are the benefits and drawbacks of this rapid growth for local communities in popular tourist destinations?" },

  { n:"017", type:"request",
    situation:"You saw an advertisement for a professional photography course being offered at a local college. The advertisement did not include details about the course fees, any prerequisites, the weekly schedule, or whether a certificate of completion would be issued to participants.",
    bullets:["explain why you are interested in enrolling in this particular course","ask about the specific details that were missing from the advertisement","enquire about whether any financial assistance or flexible payment options are available"],
    essay:"An increasing number of adults are returning to formal education later in life in order to gain new qualifications or change careers. What are the main reasons for this trend and is it a positive development overall?" },

  { n:"018", type:"invitation",
    situation:"You are the secretary of a local community running club. You would like to invite a well-known local athlete, Ms Rivera, to speak at your club's upcoming monthly meeting about her experience of training for and completing a full marathon for the first time.",
    bullets:["introduce yourself and the running club","explain why you would like her to speak and what topics you hope she can cover","provide details of the date, time, and venue and politely ask her to confirm her availability"],
    essay:"Participation in sport and regular physical activity among young people has declined significantly in many countries in recent years. What do you think are the main causes of this decline and what could be done to reverse the trend?" },

  { n:"019", type:"apology",
    situation:"You borrowed a significant sum of money from a good friend three months ago to cover an unexpected emergency, promising to repay it within four weeks. Due to ongoing financial difficulties you have been unable to repay it and have been avoiding contact with your friend out of embarrassment.",
    bullets:["apologise sincerely for not repaying the money as agreed and for avoiding contact","explain the financial difficulties that have prevented you from repaying on time","propose a clear and realistic repayment plan that you can commit to"],
    essay:"Some people believe that borrowing money from friends or family members is always a bad idea because it can seriously damage relationships. Do you agree or disagree? Use specific reasons and examples to support your view." },

  { n:"020", type:"advice",
    situation:"A friend from your home country is planning to relocate to the city where you currently live in order to look for work. They have limited English language skills and have no professional contacts or social network in the city. They have asked for your honest advice.",
    bullets:["give an honest assessment of the challenges they are likely to face upon arrival","offer specific and practical advice to help them prepare before they leave home","encourage them while being realistic and honest about what they should expect"],
    essay:"Some people believe that immigration brings significant economic and cultural benefits to a country. Others feel that it creates social tensions and places excessive pressure on public services. Discuss both views and give your own opinion." },

  { n:"021", type:"congratulations",
    situation:"Your neighbour's daughter, Maya, whom you have known since she was a child, has just received an offer to study medicine at a prestigious university — a highly competitive programme. Her parents shared the news at a neighbourhood gathering but you did not have the chance to write to Maya at the time.",
    bullets:["congratulate Maya warmly on her achievement and on being accepted into such a competitive programme","explain why you are writing to her now rather than congratulating her in person at the time","wish her every success in her studies and in her future medical career"],
    essay:"University education is becoming increasingly expensive in many countries around the world. Some people argue that students should be responsible for paying their own tuition fees. Others believe that government funding should cover the full cost of higher education. Discuss both views and give your own opinion." },

  { n:"022", type:"job_application",
    situation:"A local environmental charity called GreenFutures has placed an advertisement calling for volunteers to assist in running weekend beach clean-up events. Volunteers are expected to help with logistics, coordinate small groups of other volunteers, and engage positively with members of the public. No prior experience is required.",
    bullets:["explain why you are interested in volunteering specifically for this charity and this cause","describe any relevant experience, skills, or personal qualities you would bring to the role","ask about the training provided, the weekly time commitment expected, and when you would be able to start"],
    essay:"Volunteers make an essential contribution to communities and non-profit organisations around the world. However, some people argue that all work, including voluntary work, should be financially compensated. To what extent do you agree or disagree with this view?" },

  { n:"023", type:"recommendation",
    situation:"Your university classmate Sam is applying for a highly competitive scholarship to fund postgraduate study at a university overseas. The scholarship committee requires two personal character references from people who know the applicant well. Sam has asked you to write one of these references.",
    bullets:["introduce yourself and describe your relationship with Sam and how long you have known each other","give specific examples of Sam's academic strengths, personal character, and determination","state clearly and enthusiastically why you believe Sam is a highly deserving candidate for this scholarship"],
    essay:"Some people think that scholarship and bursary programmes should prioritise students from economically disadvantaged backgrounds. Others believe scholarships should be awarded purely on the basis of academic merit. Discuss both views and give your own opinion." },

  { n:"024", type:"thank_you",
    situation:"You spent two weeks at the home of your aunt and uncle in another country while attending an international professional conference. During your stay they organised your transport to and from the conference venue each day, helped you rehearse your presentations, and introduced you to several of their professional contacts.",
    bullets:["thank them sincerely and warmly for everything they did for you throughout your stay","mention specific things they did that were especially helpful or meaningful to you","explain how their generous support made a real difference to your experience at the conference"],
    essay:"Family relationships play a crucial role in shaping a person's character, values, and chances of success in life. To what extent do you agree with this statement? Give reasons and specific examples to support your view." },

  { n:"025", type:"explanation",
    situation:"You rent an apartment and have been unable to pay your rent on time for the past two months. This happened because your employer experienced a payroll system failure that delayed salary payments to all staff. The issue has since been fully resolved and all outstanding salary has been paid.",
    bullets:["apologise for the late rental payments and acknowledge the inconvenience caused","explain clearly what caused the delay and why it was entirely beyond your personal control","confirm exactly when the full outstanding amount will be transferred and how you will ensure payments remain on time in the future"],
    essay:"In many countries, housing costs have risen considerably faster than average wages over the past two decades. What factors have contributed to this problem and what measures could governments take to make housing more affordable for ordinary people?" },

  { n:"026", type:"complaint",
    situation:"You commute to work by bus every weekday. Over the past month the bus service on your regular route has become increasingly unreliable — buses run significantly late, are frequently overcrowded, and on two occasions scheduled services were cancelled without any prior notice, causing you to arrive late to work.",
    bullets:["describe the specific problems you have experienced with the service in detail","explain the practical impact these disruptions are having on your work and daily routine","state clearly what improvements you expect the transport authority to make and by when"],
    essay:"A significant proportion of the population in many countries relies on public transport to commute to work each day. What are the main barriers that prevent more people from using public transport and what could be done to encourage greater usage?" },

  { n:"027", type:"request",
    situation:"You have been working at your current company for four years. You would like to take three weeks of unpaid leave to care for a close family member who is recovering from a serious operation and has no one else available to help. Your manager verbally indicated support for the idea but has formally asked you to submit a written request.",
    bullets:["state clearly what you are requesting, including the specific dates of the absence","explain the reason for the leave request and why this particular length of time is necessary","reassure your manager that your responsibilities will be properly covered and that it will not disrupt the team"],
    essay:"Some people believe that employers have a genuine moral responsibility to support workers who need time away from work for family or personal reasons. Others think that managing personal matters in their own time is entirely the employee's responsibility. Discuss both views and give your own opinion." },

  { n:"028", type:"invitation",
    situation:"Your mutual friend is turning 40 next month and a group of friends has agreed to organise a surprise birthday party for them. You have been asked to write to a friend, Jordan, who lives in another city, to personally invite them and ensure they have all the information needed to attend.",
    bullets:["invite Jordan warmly to the surprise party and emphasise how important it is to keep it completely secret from the birthday person","give full details about the date, time, location, dress code, and what to expect at the event","suggest practical travel and accommodation options and offer your personal help in coordinating their arrival"],
    essay:"Significant milestone birthdays such as 30th, 40th, and 50th birthdays are increasingly celebrated with large and elaborate parties. Some people consider this trend wasteful. Others see such celebrations as important social and cultural occasions. What is your opinion and why?" },

  { n:"029", type:"apology",
    situation:"You borrowed your next-door neighbour's car for a weekend trip after they kindly offered it to you. Despite being careful, the car sustained a small but visible dent in the rear bumper while it was parked in a public car park. You returned the car without mentioning the damage, but your neighbour has now noticed it and has contacted you about it.",
    bullets:["apologise sincerely for the damage and for not reporting it to your neighbour immediately upon returning the car","explain exactly what happened that caused the damage and why you did not mention it at the time","offer to cover the full cost of having the damage repaired professionally and explain how you intend to arrange this"],
    essay:"Road traffic accidents continue to cause serious harm to individuals and significant costs to societies around the world. What are the main causes of traffic accidents and what specific measures could be introduced to reduce their frequency and severity?" },

  { n:"030", type:"advice",
    situation:"A close friend has written to you describing serious stress and emotional burnout they are experiencing at work. They feel they are no longer able to cope with the pressure, are sleeping badly, and are actively considering resigning from their well-paid but highly demanding job without any other job lined up.",
    bullets:["acknowledge how serious the situation is and respond with genuine empathy and understanding","offer practical advice about strategies for managing workplace stress and burnout without necessarily leaving the job","suggest whether and how they might speak to their employer about the situation or seek professional support from a counsellor or doctor"],
    essay:"Work-related stress and burnout are becoming increasingly common in modern workplace cultures around the world. What are the main causes of workplace stress and what practical steps can both employers and employees take to reduce it effectively?" }
];

let created = 0;
TESTS.forEach(t => {
  const fp = path.join(DIR, `gt-${t.n}.json`);
  if (fs.existsSync(fp)) { console.log("exists:", fp); return; }
  const obj = {
    id: `ielts-writing-gt-${t.n}`,
    exam: "ielts", section: "writing", type: "section",
    variant: "general_training",
    title: `IELTS GT Writing Practice Test ${parseInt(t.n,10)} — ${t.type.replace(/_/g," ").replace(/\b\w/g, c=>c.toUpperCase())} Letter`,
    durationSeconds: 3600, questionCount: 2, version: 1,
    instructions: "Task 1: Write a letter of at least 150 words. Task 2: Write an essay of at least 250 words.",
    questions: [
      {
        id: `ielts-writing-gt-${t.n}-q01`,
        questionType: "writing_task",
        taskType: "general_task_1_letter",
        letterType: t.type,
        letterSituation: t.situation,
        prompt: `${t.situation}\n\nWrite a letter in response to this situation. In your letter:\n${t.bullets.map(b => "• " + b).join("\n")}\n\nWrite at least 150 words. You do NOT need to write any addresses.`,
        wordTarget: 150,
        modelAnswer: "A strong response should open with an appropriate greeting, address each bullet point in a separate paragraph with specific detail, maintain the correct register throughout, and close with a suitable sign-off.",
        rubric: ["task achievement","coherence and cohesion","lexical resource","grammatical range and accuracy"],
        difficulty: "medium", topic: t.type.replace(/_/g," ")
      },
      {
        id: `ielts-writing-gt-${t.n}-q02`,
        questionType: "writing_task",
        taskType: "academic_task_2_essay",
        prompt: t.essay,
        wordTarget: 250,
        modelAnswer: "A strong response should present a clear position supported by well-developed arguments, relevant specific examples, and a logical structure including a focused introduction, detailed body paragraphs, and a concise conclusion.",
        rubric: ["task response","coherence and cohesion","lexical resource","grammatical range and accuracy"],
        difficulty: "medium", topic: t.type.replace(/_/g," ")
      }
    ]
  };
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
  created++;
});
console.log(`Created: ${created} GT writing tests`);
