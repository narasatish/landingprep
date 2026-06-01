/**
 * gen-ielts-gt-writing.js
 * Generates 30 IELTS General Training writing tests (test-031.json … test-060.json).
 * Run: node tools/gen-ielts-gt-writing.js
 *
 * Each test has:
 *   Task 1 — Letter (150+ words): situation + 3 bullet points embedded in prompt
 *   Task 2 — Essay  (250+ words): opinion / discussion / problem-solution prompt
 */

const fs   = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "content", "ielts", "writing");

// ── Task 1 letter scenarios ────────────────────────────────────────────────────
const task1Data = [
  {
    prompt: `You recently moved into a rented flat and discovered several problems. Write a letter to your landlord.

In your letter:
• describe the problems you have noticed
• explain how these problems are affecting your daily life
• say what action you would like the landlord to take`
  },
  {
    prompt: `A friend helped you move to a new city last month. Write a letter to thank your friend.

In your letter:
• explain why their help was so important to you
• describe something specific they did that you appreciated
• suggest how you could return the favour`
  },
  {
    prompt: `You saw a job advertisement for a position you are interested in. Write a letter to apply for the job.

In your letter:
• explain why you are interested in the role
• describe your relevant experience and qualifications
• say when you would be available for an interview`
  },
  {
    prompt: `You received an incorrect bill from a company. Write a letter to the company's customer service department.

In your letter:
• describe what the bill says and why it is wrong
• explain what the correct amount should be
• say what you expect the company to do to resolve the matter`
  },
  {
    prompt: `You would like to take some time off work to attend a family event overseas. Write a letter to your manager.

In your letter:
• explain the reason for your leave request
• say how long you need to be away
• suggest how your work will be covered while you are absent`
  },
  {
    prompt: `You missed an important appointment and were unable to contact the person beforehand. Write a letter of apology.

In your letter:
• explain why you missed the appointment
• apologise sincerely for any inconvenience caused
• propose how you would like to reschedule`
  },
  {
    prompt: `You experienced very poor service at a restaurant you recently visited. Write a letter to the restaurant manager.

In your letter:
• describe what happened during your visit
• explain how the experience affected you
• say what you think the restaurant should do to improve`
  },
  {
    prompt: `You would like to enrol in an English language course at a local college. Write a letter to the admissions office.

In your letter:
• explain your reasons for wanting to improve your English
• ask about the courses available and their schedules
• enquire about fees and any financial support available`
  },
  {
    prompt: `A colleague you have worked with for many years is moving to a different company. Write a letter to recommend them for their new position.

In your letter:
• describe your professional relationship with this colleague
• explain their key skills and achievements
• say why you believe they will be successful in the new role`
  },
  {
    prompt: `Your flight was cancelled and you were not offered adequate compensation or assistance by the airline. Write a letter to the airline.

In your letter:
• describe what happened on the day of your cancelled flight
• explain the inconvenience and costs you incurred
• state what compensation you believe you are entitled to`
  },
  {
    prompt: `You are unhappy with the level of noise coming from a neighbouring property. Write a letter to your neighbour.

In your letter:
• describe the noise and when it occurs
• explain the effect it is having on you and your household
• suggest a solution that would be acceptable to both of you`
  },
  {
    prompt: `You borrowed a book from a friend and unfortunately damaged it. Write a letter to your friend.

In your letter:
• explain what happened to the book
• apologise for the damage caused
• suggest how you will make it up to your friend`
  },
  {
    prompt: `You are planning to visit a foreign city and need information before your trip. Write a letter to the local tourist information office.

In your letter:
• say when you are planning to visit and for how long
• ask about the main attractions you should not miss
• enquire about local transport options from the airport`
  },
  {
    prompt: `You recently bought a product online, but it arrived damaged and not as described. Write a letter to the online retailer.

In your letter:
• describe the product you ordered and what arrived instead
• explain the problems with the item you received
• say whether you want a replacement or a full refund`
  },
  {
    prompt: `You would like your employer to allow you to work flexible hours or from home. Write a letter to your manager.

In your letter:
• explain why you are making this request
• describe how flexible working would benefit your productivity
• suggest a trial arrangement that could work for both parties`
  },
  {
    prompt: `You would like to volunteer for a local charity organisation. Write a letter to the charity coordinator.

In your letter:
• explain your reasons for wanting to volunteer
• describe any relevant skills or experience you have
• ask about the types of volunteering opportunities available`
  },
  {
    prompt: `A family member is considering applying to the same university you attended. Write a letter to encourage them and share your experience.

In your letter:
• describe what you enjoyed most about studying at the university
• mention specific facilities or support services that were helpful
• give practical advice on how to make the most of student life`
  },
  {
    prompt: `You have decided to resign from your current job. Write a letter to your employer.

In your letter:
• state clearly that you are resigning and give your notice period
• thank your employer for the opportunities you have had
• offer to help with the transition before you leave`
  },
  {
    prompt: `The heating system in your rented accommodation has broken down in winter. Write a letter to the property management company.

In your letter:
• describe the problem and how long you have been without heating
• explain the impact this is having on you and other residents
• request that the problem is fixed urgently and within a specific timeframe`
  },
  {
    prompt: `You recently attended a training course at work that you found extremely beneficial. Write a letter to your manager recommending the course to other colleagues.

In your letter:
• describe what the training course covered
• explain the skills and knowledge you gained from it
• suggest which other colleagues or teams might benefit from attending`
  },
  {
    prompt: `A friend who lives abroad is thinking of moving to your city. Write a letter giving advice about life there.

In your letter:
• describe the neighbourhoods you think would suit your friend
• mention the cost of living and what to expect financially
• give tips on finding work or making social connections`
  },
  {
    prompt: `You need to request a reference letter from a former professor for a postgraduate course application. Write a letter to the professor.

In your letter:
• remind the professor of your time as their student
• explain the postgraduate programme you are applying to and why
• ask if they would be willing to write a reference and by what deadline it is needed`
  },
  {
    prompt: `Your local park has fallen into disrepair and residents are unhappy. Write a letter to the local council.

In your letter:
• describe the current condition of the park
• explain why the park is important to the local community
• suggest specific improvements you would like the council to carry out`
  },
  {
    prompt: `You have been invited to a friend's wedding but cannot attend. Write a letter to your friend.

In your letter:
• explain clearly why you are unable to attend
• express how much the occasion means to you
• suggest a way to celebrate with your friend after the event`
  },
  {
    prompt: `You are experiencing problems with your internet service provider. Write a letter of complaint.

In your letter:
• describe the problems you are experiencing and how long they have lasted
• explain how the poor service is affecting your work or studies
• state what resolution you expect from the company`
  },
  {
    prompt: `You would like to apply for university accommodation. Write a letter to the accommodation office.

In your letter:
• explain when you will be starting your studies
• describe the type of accommodation you are looking for
• ask about the application process and any deadlines`
  },
  {
    prompt: `You recently used a gym or fitness centre and were disappointed with the facilities. Write a letter to the gym manager.

In your letter:
• describe what you experienced during your visit
• explain which aspects of the gym were not satisfactory
• suggest improvements the management should consider`
  },
  {
    prompt: `A colleague at work has been acting as your mentor and has significantly helped your career. Write a letter to thank them.

In your letter:
• describe specific ways they have supported your professional development
• explain the positive difference their guidance has made
• say how you hope to give back to others in the future`
  },
  {
    prompt: `You would like a refund for a service you paid for but did not receive. Write a letter to the company.

In your letter:
• describe the service you paid for and what you expected
• explain what actually happened and why you are dissatisfied
• state exactly what refund or compensation you are requesting`
  },
  {
    prompt: `You recently stayed at a hotel and experienced both positive and negative aspects. Write a letter to the hotel manager.

In your letter:
• describe what you appreciated about your stay
• explain the problems or issues you encountered
• suggest what the hotel could do to improve the guest experience`
  },
];

// ── Task 2 essay prompts ───────────────────────────────────────────────────────
const task2Data = [
  {
    prompt: `Many people believe that social media has done more harm than good to modern society. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples from your own knowledge or experience.`
  },
  {
    prompt: `Some people argue that governments should invest more in public transport rather than in building new roads. Discuss both views and give your own opinion.`
  },
  {
    prompt: `In many countries, young people today have very different values and attitudes compared to the previous generation. What are the causes of these differences and what effects do they have on society?`
  },
  {
    prompt: `Some people think that the primary purpose of schools is to teach academic knowledge, while others feel that schools should also teach life skills such as cooking, budgeting, and communication. Discuss both sides and give your own opinion.`
  },
  {
    prompt: `Many cities are becoming increasingly overcrowded, which is causing a range of problems. What are the main causes of this growth and what measures could be taken to address the issues it creates?`
  },
  {
    prompt: `Zoos and wildlife parks play an important role in protecting endangered species. To what extent do you agree or disagree? Give reasons and examples to support your answer.`
  },
  {
    prompt: `Some people believe that higher education should be free for all students, funded entirely by the government. Others think that individuals should pay for their own education. Discuss both views and give your own opinion.`
  },
  {
    prompt: `The world is producing more and more waste every year. What problems does this cause, and what steps can governments and individuals take to reduce waste?`
  },
  {
    prompt: `Some employers require employees to wear a uniform or follow a dress code. Do the advantages of this requirement outweigh the disadvantages? Give reasons for your answer.`
  },
  {
    prompt: `In many countries, the gap between rich and poor people is growing. What are the causes of this problem, and what can be done to reduce inequality?`
  },
  {
    prompt: `Some people feel that the rapid advancement of technology is threatening traditional skills and ways of life. Others argue that technology brings benefits that outweigh any losses. Discuss both views and give your opinion.`
  },
  {
    prompt: `Advertising aimed at children should be strictly controlled or banned altogether. To what extent do you agree or disagree? Support your answer with reasons and examples.`
  },
  {
    prompt: `Many people believe that regular exercise should be made compulsory for all schoolchildren. What are the advantages and disadvantages of such a policy? Give reasons for your answer.`
  },
  {
    prompt: `In many countries, it is becoming increasingly difficult for young people to afford to buy their first home. What are the reasons for this, and what solutions could be implemented?`
  },
  {
    prompt: `Tourism brings significant economic benefits to many countries, but it also has a negative impact on local culture and the natural environment. To what extent do you agree or disagree?`
  },
  {
    prompt: `Some people think that it is better for children to grow up in the city, while others believe the countryside is a better environment for raising children. Discuss both views and give your own opinion.`
  },
  {
    prompt: `Many experts argue that learning a foreign language has considerable benefits, not just for communication, but also for cognitive development. To what extent do you agree or disagree?`
  },
  {
    prompt: `The use of animals in scientific and medical research is necessary and justified. To what extent do you agree or disagree? Give relevant reasons and examples in your answer.`
  },
  {
    prompt: `In some societies, older people are increasingly isolated from younger generations. What are the causes of this generational divide, and what could be done to bridge it?`
  },
  {
    prompt: `Some people think that space exploration is a waste of money and that the resources could be better spent solving problems on Earth. To what extent do you agree or disagree?`
  },
  {
    prompt: `Working from home has become increasingly common. What are the advantages and disadvantages of this way of working for both employees and employers?`
  },
  {
    prompt: `Some people believe that fast food should be taxed to discourage unhealthy eating. Others think this would be unfair. Discuss both views and give your own opinion.`
  },
  {
    prompt: `It is argued that the world would be more peaceful if all countries shared a single language. What do you think the advantages and disadvantages of this would be?`
  },
  {
    prompt: `Many people believe that sport and physical activity are becoming less important in modern life. What are the causes of this trend and what effect does it have on individuals and communities?`
  },
  {
    prompt: `Some people feel that renewable energy should replace fossil fuels as quickly as possible, while others argue that the transition must be gradual. Discuss both sides and give your own opinion.`
  },
  {
    prompt: `It is sometimes argued that newspapers and television are the most important sources of news, but others believe that the internet has made these traditional media less relevant. To what extent do you agree or disagree?`
  },
  {
    prompt: `Some people think that it is the responsibility of individuals to protect the environment. Others argue that it is the government's duty to do so. Discuss both views and give your own opinion.`
  },
  {
    prompt: `In many countries, voluntary work—such as helping in hospitals, schools, or community projects—is encouraged. What are the benefits of voluntary work for the volunteers themselves and for society?`
  },
  {
    prompt: `Some people believe that the best way to reduce crime is to give longer prison sentences. Others feel that other measures are more effective. Discuss both views and give your own opinion.`
  },
  {
    prompt: `Globalisation has made the world more connected but has also led to concerns about cultural homogenisation. To what extent do you think globalisation is a positive development? Give reasons and examples to support your answer.`
  },
];

// ── Generate files ─────────────────────────────────────────────────────────────
let created = 0;

for (let i = 0; i < 30; i++) {
  const testNum = 31 + i;
  const pad     = String(testNum).padStart(3, "0");
  const t1      = task1Data[i];
  const t2      = task2Data[i];

  const json = {
    id:              `ielts-writing-${pad}`,
    exam:            "ielts",
    section:         "writing",
    type:            "section",
    variant:         "general",
    title:           `IELTS General Training Writing Practice Test ${testNum - 30}`,
    durationSeconds: 3600,
    questionCount:   2,
    instructions:    "You have 60 minutes for both tasks. Spend about 20 minutes on Task 1 (150+ words) and 40 minutes on Task 2 (250+ words). Task 2 carries more marks than Task 1.",
    questions: [
      {
        id:           `ielts-writing-${pad}-q01`,
        questionType: "writing_task",
        taskNumber:   1,
        variant:      "general",
        minWords:     150,
        prompt:       t1.prompt,
        rubric: [
          "task achievement",
          "coherence and cohesion",
          "lexical resource",
          "grammatical range and accuracy"
        ],
        difficulty: "medium"
      },
      {
        id:           `ielts-writing-${pad}-q02`,
        questionType: "writing_task",
        taskNumber:   2,
        variant:      "general",
        minWords:     250,
        prompt:       t2.prompt,
        rubric: [
          "task response",
          "coherence and cohesion",
          "lexical resource",
          "grammatical range and accuracy"
        ],
        difficulty: "medium"
      }
    ]
  };

  const outPath = path.join(OUT, `test-${pad}.json`);
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2), "utf8");
  created++;
  console.log(`✓ Created ${outPath}`);
}

console.log(`\nDone — ${created} IELTS General Training writing tests created.`);
