/* global React, window */
"use strict";

(function () {
  const { useState, useRef, useCallback, useEffect } = React;

  // ── Exam-specific word minimums ──────────────────────────────────────────────
  const EXAM_MIN_WORDS = {
    ielts_task1: 150, ielts_task2: 250,
    toefl_email: 100, toefl_discussion: 100, toefl_sentence: 0,
    gre: 350, gmat: 350, pte: 200, celpip: 150, duolingo: 35, default: 150,
  };

  // ── Prompt bank ─────────────────────────────────────────────────────────────
  const BASE_PROMPTS = {

    ielts: [
      {
        id: "task2-tech", type: "Task 2", taskKind: "ielts_task2", target: 250,
        label: "Technology & Society",
        prompt: "Some people believe that technology has made our lives more complicated, while others think it has made our lives easier. Discuss both views and give your own opinion.",
        bandSample: { 7: `Technology has fundamentally reshaped modern life, and opinions are sharply divided about whether this transformation has been beneficial or burdensome. While I acknowledge that technology has introduced new layers of complexity, I firmly believe that its overall effect has been to simplify and enhance our daily existence.\n\nProponents of the view that technology complicates life often point to the constant connectivity that smartphones demand. Employees are now expected to respond to emails outside working hours, eroding the boundary between professional and personal time. Furthermore, the proliferation of devices, subscriptions, and digital platforms requires technical literacy that older generations particularly struggle to acquire. The sheer volume of information available online can also lead to decision fatigue and heightened anxiety among users.\n\nNevertheless, the counterarguments are compelling. Navigation applications have eliminated the stress of getting lost in unfamiliar cities. Online banking allows transactions to be completed in seconds rather than requiring physical visits to branches. Medical advances powered by artificial intelligence enable faster and more accurate diagnoses, potentially saving millions of lives. These concrete benefits demonstrate that technology, when used purposefully, dramatically reduces friction in everyday tasks.\n\nIn my view, the apparent complexity that technology introduces is largely a transitional challenge. Societies adapt to new tools over time, and what once seemed bewildering—such as using an ATM or sending an email—becomes second nature within a generation. The net effect of technology is therefore one of simplification rather than complication.\n\nIn conclusion, although technology presents new challenges during periods of adoption, its long-term impact is overwhelmingly one of convenience and efficiency. Policymakers and educators should focus on digital literacy programmes to help all citizens reap these considerable benefits.` }
      },
      {
        id: "task2-env", type: "Task 2", taskKind: "ielts_task2", target: 250,
        label: "Environment & Responsibility",
        prompt: "Protecting the environment is the responsibility of governments and large corporations, not individuals. To what extent do you agree or disagree?",
        bandSample: { 7: `The question of who bears primary responsibility for environmental protection is a contentious one. Although governments and corporations undeniably possess the resources and regulatory authority to drive meaningful change, I would argue that individual action remains an indispensable component of any comprehensive environmental strategy.\n\nIt is beyond dispute that governmental and corporate actors hold the greatest leverage. Governments can legislate carbon emission caps, fund renewable energy infrastructure, and enforce penalties for environmental violations. A single piece of legislation—such as a carbon tax—can reduce industrial emissions on a scale that no individual behavioural change could match. Similarly, a decision by a major corporation to switch to a circular supply chain instantly transforms the environmental impact of thousands of products simultaneously.\n\nHowever, to absolve individuals of responsibility is both logically flawed and strategically counterproductive. Consumer demand drives corporate behaviour; when millions of individuals collectively choose plant-based diets, reduce air travel, or buy second-hand goods, market signals shift and businesses respond accordingly. Furthermore, democratic governments reflect the values of their electorates; citizens who prioritise environmental issues elect representatives who will enact stronger protections. Individual agency, therefore, amplifies institutional action rather than replacing it.\n\nIn my opinion, framing this as an either-or question is a false dichotomy. Environmental challenges require coordinated effort at every level of society. Governments must set the framework, corporations must operate within it responsibly, and individuals must exercise the meaningful choices available to them.\n\nIn conclusion, while systemic change driven by governments and corporations is essential, individual responsibility remains a powerful and necessary force in the broader effort to protect the planet for future generations.` }
      },
      {
        id: "task2-edu", type: "Task 2", taskKind: "ielts_task2", target: 250,
        label: "Education & Schools",
        prompt: "Some educators argue that schools should focus entirely on academic subjects, while others believe that practical life skills such as cooking, budgeting, and interpersonal communication should also be taught. Discuss both views and give your own opinion.",
        bandSample: { 7: `The debate over what schools should teach reflects fundamental disagreements about the purpose of education itself. While a strong academic foundation is undeniably valuable, I believe that limiting schools to purely academic content leaves students ill-equipped for the realities of adult life.\n\nAdvocates of an exclusively academic curriculum argue that schools occupy a unique and irreplaceable position as providers of intellectual knowledge. The core subjects—mathematics, science, literature, and history—develop critical reasoning, analytical skills, and cultural literacy in ways that practical training cannot replicate. Proponents also contend that practical skills, such as cooking or budgeting, are more effectively taught within the family unit, where they can be contextualised to the specific circumstances of each household.\n\nNevertheless, this view underestimates how profoundly social conditions have changed. Many young people today leave home with little ability to manage finances, prepare nutritious meals, or navigate professional relationships. These deficiencies carry real consequences: high levels of personal debt, poor nutritional choices, and conflict in workplaces are all partly attributable to gaps in practical education. Incorporating structured life-skills modules alongside academic subjects need not dilute intellectual rigour; rather, it produces graduates who are more rounded, resilient, and ready for independent living.\n\nIn my opinion, the two approaches are entirely compatible. Schools can dedicate the majority of the timetable to academic content while reserving dedicated sessions for practical skills. Nordic countries, which consistently rank highly in educational outcomes, have long integrated life skills into their national curricula without compromising academic standards.\n\nIn conclusion, a balanced curriculum that honours both intellectual and practical development serves students and society far better than a narrowly academic one.` }
      },
      {
        id: "task1-bar", type: "Task 1", taskKind: "ielts_task1", target: 150,
        label: "Bar Chart — Social Media",
        prompt: "The bar chart below shows the average number of hours per week that people in four countries (USA, UK, Japan, and Brazil) spend on social media. Summarise the information by selecting and reporting the main features and making comparisons where relevant.",
        visual: { chartType: "bar", title: "Average weekly hours spent on social media by country", xAxis: ["USA", "UK", "Japan", "Brazil"], series: [{ label: "Hours per week", values: [11, 8, 5, 14] }], yLabel: "Hours per week" },
        bandSample: { 7: `The bar chart illustrates weekly social media usage across four countries: the USA, the UK, Japan, and Brazil.\n\nOverall, Brazil recorded by far the highest usage, while Japan showed notably lower engagement compared to the other three nations surveyed. There is a considerable spread between the highest and lowest values, suggesting significant regional variation in digital behaviour.\n\nBrazil led all four countries with an average of 14 hours per week, approximately three times the figure for Japan, which reported the lowest usage at just 5 hours per week. The USA ranked second at 11 hours, followed by the UK at 8 hours. It is notable that both English-speaking nations fell between the two extremes, with the USA's figure being roughly 38% higher than that of the UK.\n\nThe data suggest a considerable regional variation in social media behaviour. The contrast between Brazil and Japan is particularly striking and may reflect differences in cultural attitudes towards digital communication, the relative popularity of specific platforms in each market, or broader socioeconomic factors influencing internet access and leisure time.\n\nIn conclusion, social media usage varies markedly across the four countries, with Brazil emerging as a clear outlier at the higher end and Japan at the lower end of the spectrum.` }
      },
      {
        id: "task1-line", type: "Task 1", taskKind: "ielts_task1", target: 150,
        label: "Line Graph — Renewable Energy",
        prompt: "The line graph below shows the percentage of electricity generated from renewable sources in three countries (Germany, Australia, and Canada) between 2010 and 2022. Summarise the information by selecting and reporting the main features and making comparisons where relevant.",
        visual: { chartType: "line", title: "Renewable electricity generation (% of total)", xAxis: ["2010","2012","2014","2016","2018","2020","2022"], series: [{ label: "Germany", values: [17, 22, 28, 32, 38, 46, 49] }, { label: "Australia", values: [9, 11, 14, 17, 22, 29, 35] }, { label: "Canada", values: [62, 63, 65, 64, 67, 69, 70] }], yLabel: "% of electricity" },
        bandSample: { 7: `The line graph illustrates the proportion of electricity derived from renewable sources in Germany, Australia, and Canada between 2010 and 2022.\n\nOverall, all three countries experienced growth in renewable energy generation over the period, with Canada maintaining the highest share throughout. Germany and Australia both showed more dramatic rates of increase from a lower starting point, while Canada's share grew more gradually from an already substantial base.\n\nCanada consistently led the three countries, starting at approximately 62% in 2010 and rising steadily to around 70% by 2022. This relatively modest growth rate reflects Canada's long-established hydroelectric capacity, which already accounted for the majority of its renewable output at the beginning of the period.\n\nGermany began at 17% in 2010 and experienced the steepest increase of all three countries, reaching approximately 49% by 2022—nearly tripling its share over the twelve-year period. This dramatic rise coincides with Germany's Energiewende policy, which prioritised wind and solar expansion. Australia followed a broadly similar trajectory, rising from 9% to 35%, with the most rapid growth occurring after 2016.\n\nIn conclusion, while Canada remained the leading renewable electricity producer throughout, Germany's sustained policy-driven growth brought it close to matching Canada's share by 2022.` }
      },
    ],

    // ── TOEFL iBT 2026 writing format ──────────────────────────────────────────
    toefl: [
      {
        id: "toefl-discussion-1", type: "Academic Discussion", taskKind: "toefl_discussion", target: 100,
        label: "Write for Academic Discussion",
        professor: {
          name: "Dr. Chen",
          question: "In this week's discussion, I'd like you to think about the role of artificial intelligence in education. Do you think AI tutoring systems will eventually replace human teachers, or do they serve a fundamentally different purpose? Please share your perspective and engage with your classmates' ideas."
        },
        studentPosts: [
          { name: "Priya", text: "I don't think AI will replace teachers because teaching is more than delivering content. Teachers build relationships, notice when a student is struggling emotionally, and adapt lessons based on classroom energy. AI systems can't do any of that, at least not yet." },
          { name: "Marcus", text: "I disagree with Priya. AI tutors are already outperforming human tutors in certain subjects because they give personalised feedback instantly and are available 24/7. The question isn't whether they're the same—it's whether they're effective enough to be worth using." }
        ],
        prompt: "Write a post of at least 100 words contributing to this academic discussion. Engage with the professor's question and respond to at least one of your classmates.",
        bandSample: { 5: `Both Priya and Marcus make compelling points, and I believe the reality lies somewhere between their positions. AI tutoring systems have demonstrated remarkable effectiveness at delivering personalised, adaptive instruction in structured subjects like mathematics and language learning. The ability to provide immediate feedback, adjust difficulty in real time, and maintain consistent patience represents a genuine advantage over human tutors in certain contexts.\n\nHowever, I agree with Priya that teaching encompasses dimensions that current AI systems are not equipped to replicate. A skilled teacher cultivates curiosity, models intellectual humility, and responds to the emotional landscape of a classroom in ways that require genuine human understanding. These qualities are not peripheral to education—they are central to it.\n\nRather than framing AI as a replacement for teachers, I would argue that the most productive model is one of augmentation. AI handles routine instruction and assessment efficiently, freeing teachers to focus on mentorship, complex problem-solving, and the interpersonal dimensions of learning where human judgment is irreplaceable.` }
      },
      {
        id: "toefl-email-1", type: "Write an Email", taskKind: "toefl_email", target: 100,
        label: "Write an Email",
        scenario: "You are a university student. Your professor has just announced that the final exam for your course will be moved to a date that conflicts with your previously scheduled travel plans for a family event.",
        bullets: [
          "Explain the conflict and why the date is a problem for you",
          "Describe the importance of the family event",
          "Propose a solution or ask for options"
        ],
        prompt: "Write an email to your professor about this situation. Address all three points above. Your email should be between 100 and 120 words.",
        bandSample: { 5: `Subject: Final Exam Rescheduling Request\n\nDear Professor Williams,\n\nI am writing to respectfully address the change to our final exam date. Unfortunately, the new date conflicts with a long-standing family commitment—my sister's wedding, which has been planned for over a year. As the only sibling attending from abroad, my presence is essential to my family, and I am unable to reschedule my travel arrangements.\n\nI fully understand that exam scheduling involves many competing factors, and I apologise for any inconvenience this request may cause. I would be grateful if you could advise whether an alternative sitting is available, or if there are other options I could explore.\n\nThank you sincerely for your understanding.\n\nBest regards,\nAlex Johnson` }
      },
      {
        id: "toefl-sentence-1", type: "Build a Sentence", taskKind: "toefl_sentence", target: 0,
        label: "Build a Sentence (Grammar)",
        prompt: "Arrange the following words and phrases to form a grammatically correct and meaningful sentence. Type your answer in the box below.",
        sentences: [
          { words: ["the", "despite", "team", "challenges", "numerous", "succeeded", "project"], answer: "Despite numerous challenges, the team succeeded in the project.", hint: "Think: contrast clause + main subject + verb" },
          { words: ["been", "have", "decades", "for", "studied", "scientists", "this", "phenomenon"], answer: "Scientists have studied this phenomenon for decades.", hint: "Think: subject + perfect tense + object + time phrase" },
          { words: ["provided", "if", "opportunities", "better", "were", "outcomes", "improved", "training"], answer: "If better training opportunities were provided, outcomes would improve.", hint: "Think: conditional clause + result" },
          { words: ["not", "research", "only", "does", "but", "advance", "knowledge", "also", "it", "solutions", "practical", "provides"], answer: "Research not only advances knowledge but also provides practical solutions.", hint: "Think: not only...but also structure" },
          { words: ["are", "that", "technologies", "argued", "renewable", "many", "essential", "experts", "energy"], answer: "Many experts argued that renewable energy technologies are essential.", hint: "Think: subject + reporting verb + that clause" },
        ]
      },
      {
        id: "toefl-discussion-2", type: "Academic Discussion", taskKind: "toefl_discussion", target: 100,
        label: "Discussion — Remote Work",
        professor: {
          name: "Dr. Martinez",
          question: "This week, let's discuss the long-term effects of widespread remote work on urban development and communities. As more companies adopt permanent remote work policies, what do you think will happen to city centres and suburban areas? Is this a positive development?"
        },
        studentPosts: [
          { name: "Sofia", text: "I think remote work will cause a revival of smaller cities and rural areas as people move away from expensive urban centres. This could reduce inequality and give people a better quality of life outside of crowded, polluted cities." },
          { name: "James", text: "I'm not so optimistic. City centres depend on office workers for their economic vitality—think of all the cafes, restaurants, and retail businesses that rely on foot traffic from commuters. A mass exodus could devastate urban economies." }
        ],
        prompt: "Contribute at least 100 words to this academic discussion. Respond to the professor's question and engage with at least one classmate's perspective.",
        bandSample: { 5: `Sofia and James both raise important points, but I think the long-term picture is more nuanced than either suggests. The shift toward remote work does appear to be accelerating the decentralisation of population centres, and this has significant implications for urban planning and regional economic development.\n\nI agree with Sofia that smaller cities and regional towns may benefit as people seek more space and affordability. There is already evidence of this trend in countries like the United States and Australia, where real estate markets in mid-sized cities have boomed since 2020.\n\nHowever, James is right to highlight the risk to urban economies. City centres that fail to adapt—by repurposing office space, attracting tourism, or fostering arts and culture—may struggle. The most resilient cities will likely be those that diversify their economic base beyond office-dependent industries.\n\nIn conclusion, whether remote work is a net positive depends largely on how proactively cities and communities respond to these structural changes.` }
      },
    ],

    // ── GRE ─────────────────────────────────────────────────────────────────────
    gre: [
      {
        id: "issue-uni", type: "Analytical Writing", taskKind: "gre", target: 400,
        label: "Issue Essay — University Education",
        prompt: `Write a response in which you discuss the extent to which you agree or disagree with the following statement and explain your reasoning.\n\n"The primary goal of a university education should be to prepare students for the workforce, not to foster independent thinking."`,
        bandSample: { 7: `The claim that universities should prioritise workforce preparation over the cultivation of independent thought reflects a narrow and ultimately self-defeating conception of education. While professional preparation is a legitimate function of higher education, reducing it to a purely vocational enterprise would impoverish both graduates and the societies they inhabit.\n\nA university that abandons the goal of independent thinking trains technicians rather than professionals. The distinction matters enormously in practice. A technician applies established procedures; a professional exercises judgment, recognises when procedures are inadequate, and generates new solutions. The physician who can only follow protocols will be paralysed when a patient presents atypically. The engineer who cannot think critically will miss the flaw in a design specification that causes a bridge to fail. In both cases, independent thinking is not decorative—it is operationally essential.\n\nMoreover, the claim assumes a stable relationship between what universities teach and what employers need. This assumption fails empirically. Research consistently shows that many graduates will work in fields that do not yet exist at the time of their enrolment. Teaching students to think, research, and adapt equips them far better for this reality than any narrowly vocational curriculum could. The World Economic Forum, in its annual Future of Jobs reports, consistently identifies critical thinking and creativity—both products of independent intellectual development—as the most sought-after skills by employers.\n\nAdmittedly, universities that ignore professional concerns entirely do their students a disservice. Irrelevant curricula and unmarketable skills harm graduates and waste resources. But the appropriate response is to integrate professional preparation within a broader educational mission, not to replace one with the other. The finest universities achieve precisely this balance: their graduates are both intellectually equipped and professionally competitive.\n\nIn conclusion, the dichotomy proposed by the statement is false. Independent thinking is not opposed to workforce readiness; it is the quality that makes professionals genuinely valuable over an entire career. Universities that cultivate both serve their students and society far more effectively than those that choose one at the expense of the other.` }
      },
      {
        id: "issue-tech", type: "Analytical Writing", taskKind: "gre", target: 400,
        label: "Issue Essay — Technology & Privacy",
        prompt: `Write a response in which you discuss the extent to which you agree or disagree with the following statement.\n\n"Modern societies have made privacy an outdated concept by embracing technologies that require constant data sharing."`,
        bandSample: { 7: `The assertion that privacy has become obsolete in the age of ubiquitous data collection contains a kernel of truth but ultimately overstates the case. While the widespread adoption of technologies that monetise personal information has undeniably eroded privacy norms, the concept of privacy remains not only relevant but essential to individual autonomy and democratic governance.\n\nIt is true that many technologies widely regarded as indispensable—search engines, social media platforms, smartphone applications—operate on business models premised on the collection and commercialisation of user data. The behavioural economist Shoshana Zuboff has termed this phenomenon "surveillance capitalism," arguing persuasively that it represents a fundamental shift in the relationship between individuals and institutions. Users of these platforms surrender extraordinary amounts of personal information, often without meaningful awareness of what they are sharing or how it will be used.\n\nNevertheless, the conclusion that privacy is therefore obsolete conflates two distinct claims: that privacy has become harder to maintain and that it has ceased to matter. These are not equivalent. The very outrage that accompanies high-profile data breaches, the political pressure that produced the European Union's General Data Protection Regulation, and the growing consumer market for privacy-preserving products all testify to a continuing and indeed intensifying public desire for privacy. If privacy were truly obsolete, these responses would be inexplicable.\n\nFurthermore, the erosion of privacy carries consequences that extend beyond individual inconvenience. Democratic discourse depends on citizens being able to form opinions, explore ideas, and engage in political activity free from systematic surveillance. The documented chilling effects of mass data collection on search behaviour, reading habits, and political expression suggest that the retreat of privacy does genuine harm to democratic institutions.\n\nIn conclusion, modern technology has made privacy more difficult and more contested, not more obsolete. The appropriate societal response is stronger legal frameworks and more informed user behaviour, not passive acceptance of surveillance as inevitable.` }
      }
    ],

    // ── GMAT ────────────────────────────────────────────────────────────────────
    gmat: [
      {
        id: "argument-newspaper", type: "Analysis of an Argument", taskKind: "gmat", target: 400,
        label: "Argument Analysis — Newspaper",
        prompt: `The following appeared in a memo from the director of a regional newspaper:\n\n"Last year, our online readership increased by 40% after we reduced the subscription price. This year, to further increase readership and advertising revenue, we should eliminate the subscription fee entirely and make all content available for free."\n\nWrite a response in which you examine the stated and/or unstated assumptions of the argument. Be sure to explain how the argument depends on these assumptions and what the implications are if the assumptions prove unwarranted.`,
        bandSample: { 6: `The director's argument rests on a chain of assumptions that, if examined carefully, reveal significant logical vulnerabilities. The conclusion—that eliminating the subscription fee will increase both readership and advertising revenue—follows only if several unstated premises hold true, none of which the memo attempts to verify.\n\nFirst, the argument assumes that the previous year's readership increase was caused solely by the price reduction. However, correlation does not establish causation. The 40% increase might have resulted from a major news event that drove traffic, from improvements in the website's usability, or from a competitor's website going offline. Without controlling for these alternative explanations, the causal claim is unsubstantiated and the proposed intervention could prove ineffective.\n\nSecond, the argument assumes that the relationship between price and readership is linear and unlimited: if reducing price increases readership, then eliminating price will increase it further. This extrapolation is unwarranted. A small price reduction may attract readers who found the previous price marginally too high; eliminating the fee entirely may not attract proportionally more readers if the remaining non-subscribers are simply uninterested in the content regardless of cost.\n\nThird, and most critically, the argument assumes that higher readership will translate into advertising revenue sufficient to replace subscription income. This is a complex economic assumption that depends on the newspaper's ability to monetise increased traffic, the willingness of advertisers to pay higher rates for larger audiences, and whether the readership demographics match what advertisers seek. A larger but less affluent or less engaged audience may actually be worth less to advertisers than a smaller, more targeted subscriber base.\n\nFinally, the argument ignores the possibility that free content may signal lower quality to readers, paradoxically reducing the credibility and prestige that makes the newspaper attractive to both readers and advertisers.\n\nIn conclusion, the director's recommendation may have merit, but the argument as presented relies on too many unverified assumptions to be persuasive. A rigorous analysis would require controlled data on causation, elasticity modelling, and a detailed revenue projection under the proposed model before any recommendation can be responsibly made.` }
      }
    ],

    // ── PTE ─────────────────────────────────────────────────────────────────────
    pte: [
      {
        id: "pte-essay-1", type: "Write Essay", taskKind: "pte", target: 200,
        label: "City vs Countryside",
        prompt: "Is it better for children to grow up in the city or in the countryside? Discuss the advantages of both environments and give your own view. Write 200–300 words.",
        bandSample: { 7: `Children's developmental environments profoundly shape their values, skills, and future opportunities. Both urban and rural upbringings confer distinct advantages, though I believe the city ultimately offers a broader platform for development in the modern era.\n\nGrowing up in a city exposes children to cultural diversity, world-class educational institutions, and extensive professional networks. Urban children gain early familiarity with public transport, multicultural peers, and a wider range of extracurricular activities—from art galleries to coding workshops. This exposure cultivates adaptability and global awareness that are increasingly valued in the twenty-first century workforce.\n\nCountryside upbringings, however, offer their own significant benefits. Children raised in rural areas typically enjoy greater physical freedom, closer community bonds, and lower levels of environmental stress. Research consistently suggests that regular exposure to natural environments reduces anxiety, improves concentration, and may produce children who are more emotionally resilient and connected to the natural world.\n\nIn my view, while the countryside provides a nurturing environment during early childhood, the city's resources become increasingly advantageous as children approach adolescence and begin preparing for higher education and careers. Families who can provide meaningful countryside experiences during school holidays may offer their children the best of both worlds.\n\nUltimately, both environments can produce well-rounded individuals. The quality of parenting, community support, and access to educational resources matters more than geography alone. What matters most is that children feel safe, loved, and intellectually stimulated—conditions achievable in either setting.` }
      },
      {
        id: "pte-essay-2", type: "Write Essay", taskKind: "pte", target: 200,
        label: "Social Media & Society",
        prompt: "Social media has transformed the way people communicate and access information. Do the benefits outweigh the disadvantages? Write 200–300 words giving your opinion with reasons and examples.",
        bandSample: { 7: `Social media platforms have become central to modern communication and information sharing, bringing both considerable benefits and serious drawbacks. On balance, I believe the advantages outweigh the disadvantages, provided users engage with these platforms critically and responsibly.\n\nThe most significant benefit of social media is its capacity to connect people across geographical and social boundaries. Individuals can maintain relationships with family and friends in different countries, professional networks can span continents, and communities built around shared interests can form and organise effectively. During periods of social crisis or natural disaster, social media has proven invaluable for coordinating relief efforts and disseminating vital information rapidly.\n\nHowever, the disadvantages cannot be dismissed. Misinformation spreads with alarming speed across social platforms, often outpacing corrections and contributing to public health risks, as was evident during the COVID-19 pandemic. Furthermore, research has documented correlations between heavy social media use and increased rates of anxiety, depression, and loneliness, particularly among younger users who may be more vulnerable to social comparison and cyberbullying.\n\nIn my assessment, these harms are genuine but not inherent to social media itself—they reflect the design choices of profit-driven companies and insufficient digital literacy education. Stronger regulation, algorithmic transparency, and comprehensive media literacy programmes in schools could mitigate the most serious risks while preserving the real communicative and informational benefits that social media provides.\n\nIn conclusion, social media's benefits to human connection and information access are substantial, but realising them responsibly requires both individual awareness and systemic change.` }
      }
    ],

    // ── CELPIP ──────────────────────────────────────────────────────────────────
    celpip: [
      {
        id: "celpip-email-1", type: "Email Writing", taskKind: "celpip", target: 150,
        label: "Task 1 — Noise Complaint",
        prompt: "You have recently moved into a new apartment. Write an email to your building manager about a persistent noise problem from a neighbouring unit. In your email:\n• Describe the nature and timing of the noise problem\n• Explain how it is affecting your daily routine\n• Suggest what specific action you would like taken",
        bandSample: { 9: `Subject: Noise Disturbance — Unit 4B\n\nDear Mr. Petrov,\n\nI am writing to bring to your attention an ongoing noise issue that has been significantly disrupting my daily routine. Since moving into Unit 4A three weeks ago, I have been disturbed by loud music and repeated thumping sounds from the adjacent Unit 4B, particularly between 11 PM and 2 AM on weekday nights.\n\nThe disturbances have made it extremely difficult for me to sleep adequately, which is affecting my concentration and productivity at work the following day. I have attempted to address the matter directly by knocking on my neighbour's door on two separate occasions, but unfortunately the noise has continued without improvement.\n\nI would greatly appreciate it if you could speak with the occupants of Unit 4B and remind them of the building's quiet hours policy. If the problem persists following this conversation, I would be grateful if you could escalate the matter in accordance with the tenancy agreement.\n\nThank you for your prompt attention to this issue.\n\nSincerely,\nAlex Chen\nUnit 4A` }
      },
      {
        id: "celpip-survey-1", type: "Survey Response", taskKind: "celpip", target: 150,
        label: "Task 2 — Community Investment",
        prompt: "Your city council is asking residents to choose between two investment proposals. Write a response of 150–200 words expressing your preference and reasons.\n\nOption A: Build a new public library with digital resources, study rooms, and community event spaces.\nOption B: Expand the existing recreation centre with a new swimming pool and fitness facilities.",
        bandSample: { 9: `I strongly support Option A: building a new public library with digital resources and community spaces. While I recognise the health benefits of expanded recreation facilities, a modern library addresses a broader range of community needs and provides a more equitable benefit to all residents.\n\nA well-equipped public library serves everyone from young children developing literacy skills to seniors seeking digital assistance, job seekers accessing employment resources, and students requiring study environments. The proposed digital resources would help bridge the technology gap for lower-income families who may lack reliable internet access at home—a particularly important consideration as so many services and employment opportunities increasingly move online.\n\nFurthermore, community event spaces within a library foster social connection, cultural programming, and civic engagement in ways that a swimming pool cannot. Regular events, workshops, and exhibitions strengthen community identity and provide meaningful, affordable activities for all age groups.\n\nI would therefore encourage the council to invest in the library project, as its long-term educational and social impact represents the greater benefit to our community as a whole.` }
      }
    ],

    // ── Duolingo ─────────────────────────────────────────────────────────────────
    duolingo: [
      {
        id: "duo-photo-1", type: "Write About the Photo", taskKind: "duolingo", target: 35,
        label: "Photo: Outdoor Market",
        photoUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80",
        photoAlt: "A busy outdoor market with colourful stalls, vendors selling fruit and vegetables, and shoppers browsing",
        photoFallbackDescription: "The image shows a busy outdoor market. Several colourful stalls are visible, with vendors selling fresh fruit and vegetables. Shoppers of various ages are browsing and selecting items. In the background, a row of market umbrellas provides shade.",
        prompt: "Look at the photograph and write a description of what you see. You have 1 minute to write. Try to describe the people, place, and activities shown. Write at least 35 words.",
        bandSample: { 5: `The photograph shows a lively outdoor market filled with colour and activity. Several market stalls display fresh produce, including vegetables and fruit. Shoppers are walking between the stalls, examining items and speaking with vendors. The scene feels vibrant and community-oriented, suggesting a popular local gathering place.` }
      },
      {
        id: "duo-photo-2", type: "Write About the Photo", taskKind: "duolingo", target: 35,
        label: "Photo: Café Scene",
        photoUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80",
        photoAlt: "Two people sitting at a café table, drinking coffee and having a conversation",
        photoFallbackDescription: "The image shows two people seated at a small table inside a café. Each person has a cup in front of them. They appear to be engaged in friendly conversation. The café has warm lighting and wooden furniture.",
        prompt: "Look at the photograph and write a description of what you see. You have 1 minute to write. Try to describe the people, setting, and what is happening. Write at least 35 words.",
        bandSample: { 5: `The image shows two people sitting at a café table and enjoying a conversation over coffee. The café has a warm, cosy atmosphere with soft lighting and wooden furniture. Both people appear relaxed and engaged, suggesting they are friends catching up or colleagues taking a break.` }
      },
      {
        id: "duo-photo-3", type: "Write About the Photo", taskKind: "duolingo", target: 35,
        label: "Photo: Library / Study",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
        photoAlt: "A student studying at a desk in a library, surrounded by books and a laptop",
        photoFallbackDescription: "The image shows a young person sitting at a desk in what appears to be a library or study room. There are books on the desk and shelves visible in the background. The person is looking at a laptop screen and appears to be concentrating.",
        prompt: "Look at the photograph and write a description of what you see. You have 1 minute to write. Describe the person, the setting, and what they appear to be doing. Write at least 35 words.",
        bandSample: { 5: `The photograph depicts a student studying in a quiet library setting. The young person is seated at a desk and appears focused on a laptop, with several books nearby. The background shows shelves filled with books, creating a calm and academic atmosphere that suggests serious study.` }
      },
      {
        id: "duo-open-1", type: "Open Response", taskKind: "duolingo", target: 35,
        label: "Open Response — Important Skill",
        prompt: "What is one important skill that everyone should learn? Why is it important? Write at least 35 words.",
        bandSample: { 5: `I believe critical thinking is the most important skill anyone can develop. The ability to evaluate evidence and reach well-reasoned conclusions applies to every area of life — from daily decisions to career choices. Without it, people are vulnerable to misinformation and poor judgement.` }
      }
    ],
  };

  // ── Scoring: enforces minimum word count heavily ────────────────────────────
  function scoreWriting(text, minWords) {
    const trimmed = text.trim();
    if (trimmed.length < 20) return { band: 0, label: "No attempt", details: [], pct: 0, penalty: false };

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wc = words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ""))).size;
    const charSet = new Set(trimmed.replace(/\s/g, "").split(""));

    if (charSet.size < 8 || /(.)\1{5,}/.test(trimmed) || wc < 8)
      return { band: 1, label: "Incomprehensible", details: ["The response appears to be random or meaningless text."], pct: 5, penalty: true };

    const min = minWords || 150;

    // ── Word count enforcement: band is CAPPED by length compliance ────────────
    let lengthBandCap = 9;
    let lengthPenalty = false;
    if (wc < min * 0.4)        { lengthBandCap = 2; lengthPenalty = true; }
    else if (wc < min * 0.6)   { lengthBandCap = 3; lengthPenalty = true; }
    else if (wc < min * 0.75)  { lengthBandCap = 4; lengthPenalty = true; }
    else if (wc < min * 0.85)  { lengthBandCap = 5; lengthPenalty = true; }
    else if (wc < min)         { lengthBandCap = 6; lengthPenalty = true; }

    // ── Quality dimensions ─────────────────────────────────────────────────────
    const lexRatio = uniqueWords / Math.max(1, wc);
    const vocabScore = Math.min(9, Math.max(3, Math.round(lexRatio * 15)));

    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentLen = sentences.length > 0 ? wc / sentences.length : wc;
    const coherenceScore = avgSentLen >= 8 && avgSentLen <= 28 ? 8 : avgSentLen < 8 ? 5 : 7;

    const contractionCount = (trimmed.match(/\b(don't|can't|won't|isn't|aren't|I'm|it's|they're|we're|you're|I've|haven't|didn't|couldn't|wouldn't)\b/gi) || []).length;
    const grammarScore = Math.max(4, 9 - contractionCount);

    // Paragraph structure bonus
    const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 40);
    const structureBonus = paragraphs.length >= 3 ? 1 : paragraphs.length === 2 ? 0 : -1;

    const qualityAvg = (vocabScore + coherenceScore + grammarScore) / 3 + structureBonus;
    const qualityBand = Math.min(9, Math.max(1, Math.round(qualityAvg)));

    // Final band = minimum of quality and length cap
    const band = Math.min(lengthBandCap, qualityBand);
    const pct = Math.round((band / 9) * 100);
    const labels = ["", "Very Low", "Poor", "Below Average", "Developing", "Satisfactory", "Good", "Very Good", "Excellent", "Expert"];

    // ── Specific feedback points ───────────────────────────────────────────────
    const details = [];

    // Word count feedback — most important, shown first
    if (wc < min) {
      details.push(`⚠ Word count (${wc}) is below the minimum of ${min} words. This significantly lowers your band score. You need ${min - wc} more words.`);
    } else {
      details.push(`✓ Word count (${wc}) meets or exceeds the ${min}-word minimum.`);
    }

    // Structure feedback
    if (paragraphs.length < 2) details.push("Structure: Your response appears to lack clear paragraph breaks. Use separate paragraphs for introduction, body, and conclusion.");
    else if (paragraphs.length >= 4) details.push("Structure: Good paragraph organisation with multiple clear sections.");
    else details.push("Structure: Consider expanding to at least 4 paragraphs: Introduction → Body 1 → Body 2 → Conclusion.");

    // Vocabulary
    if (lexRatio < 0.45) details.push("Vocabulary: Many words are repeated. Use synonyms and more varied expressions to improve your Lexical Resource score.");
    else if (lexRatio >= 0.6) details.push("Vocabulary: Good range of vocabulary demonstrated throughout your response.");
    else details.push("Vocabulary: Aim for more diverse word choices. Avoid repeating the same nouns and verbs within paragraphs.");

    // Grammar
    if (contractionCount > 2) details.push(`Grammar: Found ${contractionCount} contraction(s) (e.g. don't, can't). Use formal forms (do not, cannot) in academic writing.`);
    else if (grammarScore >= 8) details.push("Grammar: Formal register maintained well — no contractions detected.");

    // Sentence variety
    if (avgSentLen > 30) details.push("Sentences: Some sentences are very long. Break them up with full stops to improve readability and coherence.");
    else if (avgSentLen < 8) details.push("Sentences: Sentences are very short. Combine ideas using relative clauses and connectives for a more sophisticated style.");

    return { band, label: labels[band] || "Satisfactory", pct, details, penalty: lengthPenalty, wordCount: wc, minWords: min };
  }

  // ── Context-aware chatbot ───────────────────────────────────────────────────
  const KB = [
    { keys: ["band","score","grade","calculate"], reply: "Band scores are calculated across four criteria, each worth 25%: Task Achievement (did you fully address the question?), Coherence & Cohesion (is your writing logically organised?), Lexical Resource (vocabulary range and accuracy), and Grammatical Range & Accuracy. A Band 7 typically requires competency in all four areas." },
    { keys: ["word count","words","length","minimum","250","150"], reply: "Word count is critical: IELTS Task 2 requires at least 250 words; Task 1 requires 150. Writing significantly fewer words directly lowers your Task Achievement score — typically by 1–2 bands. There is no strict upper limit, but concise, well-developed essays (260–300 words for Task 2) usually score better than padded responses." },
    { keys: ["time","minutes","duration","manage"], reply: "Time management tips: IELTS Task 1 — 20 minutes (2 planning, 16 writing, 2 checking); Task 2 — 40 minutes (5 planning, 30 writing, 5 checking). Never spend more than 20 minutes on Task 1. TOEFL: Academic Discussion — 10 minutes; Email — approximately 8 minutes." },
    { keys: ["paragraph","structure","essay","organis","organiz"], reply: "A strong IELTS Task 2 essay should have exactly 4 paragraphs:\n1. Introduction: Paraphrase the question + state your position (2–3 sentences)\n2. Body 1: First main idea + explanation + example + mini-conclusion\n3. Body 2: Second main idea + explanation + example + counter-argument if relevant\n4. Conclusion: Restate your position + summarise main points (2–3 sentences)\nNever write 5+ paragraphs for IELTS — quality over quantity." },
    { keys: ["introduction","intro","thesis","opening"], reply: "A strong Task 2 introduction (2–3 sentences) should: (1) Paraphrase the question using different vocabulary — never copy the original wording, (2) State your position clearly using phrases like 'I firmly believe that...' or 'This essay will argue that...', (3) Optionally preview your main points. Avoid starting with 'In today's world' or 'Nowadays' — examiners see these thousands of times." },
    { keys: ["conclusion","ending","closing","summarise","summarize"], reply: "Your conclusion should (2–3 sentences): (1) Restate your main position using paraphrased language, (2) Briefly summarise the key points made in your body paragraphs without adding new information, (3) End with a forward-looking statement or recommendation. Useful phrases: 'In conclusion,' 'To summarise,' 'On balance,' 'All things considered.'" },
    { keys: ["vocabulary","vocab","lexical","word choice","synonym"], reply: "To boost your Lexical Resource score: (1) Never repeat the same key noun/verb within a paragraph — use synonyms, (2) Use precise collocations (e.g. 'address an issue' not 'answer an issue'), (3) Include less common vocabulary naturally (e.g. 'substantial' instead of 'very big'), (4) Avoid overused transitions like 'also' and 'but' — use 'furthermore', 'nonetheless', 'consequently' instead." },
    { keys: ["grammar","tense","article","error","mistake"], reply: "The most common grammar errors in IELTS writing: (1) Subject-verb agreement (e.g. 'governments is' → 'governments are'), (2) Missing or wrong articles (a/an/the), (3) Mixing tenses unnecessarily, (4) Run-on sentences joined with commas instead of full stops or conjunctions, (5) Contractions in formal writing (don't → do not). Proofread specifically for these 5 error types." },
    { keys: ["coherence","cohesion","linking","transition","connector"], reply: "Improve coherence with discourse markers: Addition (Furthermore, In addition, Moreover), Contrast (However, Nevertheless, Despite this, On the other hand), Cause/effect (Consequently, As a result, Therefore, This leads to), Example (For instance, For example, To illustrate), Concession (Admittedly, While it is true that). Vary your connectives — using 'However' repeatedly weakens your score." },
    { keys: ["sample","example","model answer","band 7","band 8"], reply: "Click 'Show Band 7 Sample Answer' below your score to see a full-length model response. Study how the sample: (1) Paraphrases the question in the introduction, (2) Uses linking phrases to connect ideas, (3) Develops each body paragraph with a clear topic sentence, explanation, and example, (4) Maintains formal register throughout." },
    { keys: ["toefl","academic discussion","email","build a sentence"], reply: "TOEFL 2026 writing section has three tasks: (1) Build a Sentence — arrange words into a grammatical sentence; (2) Write an Email — 100–120 words responding to a situation with three bullet points; (3) Academic Discussion — read a professor's question and classmates' posts, then write a 100+ word contribution. Total time: approximately 23 minutes." },
    { keys: ["celpip","canadian","immigration"], reply: "CELPIP writing has two tasks timed at about 27 minutes total: Task 1 — Write an Email (150–200 words, 27 minutes) responding to a situation; Task 2 — Respond to Survey Questions (150–200 words). Both tasks are scored on a 12-point scale. Focus on addressing all bullet points in Task 1 and providing clear reasons in Task 2." },
    { keys: ["improve","help","advice","tips","feedback"], reply: "To improve your writing score quickly: (1) Meet the word count — this is the single most impactful fix, (2) Organise into clear paragraphs with topic sentences, (3) Vary your sentence structure — mix simple, compound, and complex sentences, (4) Replace weak words with precise vocabulary, (5) Proofread for contractions and articles. Even 5 minutes of daily writing practice significantly builds fluency over time." },
    { keys: ["ielts general","general training","letter","gt"], reply: "IELTS General Training Task 1 is a letter (150+ words), not a chart. The tone depends on who you are writing to: Formal (to someone you don't know — manager, official), Semi-formal (to someone you know professionally), or Informal (to a friend or family member). Always address all three bullet points provided. Sign off appropriately: Yours faithfully (formal), Yours sincerely (semi-formal), Best wishes (informal)." },
  ];

  function chatbotReply(msg, exam, recentReplies) {
    const lower = msg.toLowerCase();
    // Find matching KB entries
    const matches = KB.filter(item => item.keys.some(k => lower.includes(k)));
    // Prefer a match not in recent replies
    const fresh = matches.find(item => !recentReplies.includes(item.reply));
    if (fresh) return fresh.reply;
    if (matches.length) return matches[0].reply;

    // Exam-specific fallback
    const examFallbacks = {
      ielts: "Great question! For IELTS writing help, ask me about: band score calculation, minimum word counts, paragraph structure (introduction/body/conclusion), vocabulary, grammar errors, or linking words.",
      toefl: "For TOEFL writing help, ask me about: the Academic Discussion task, the Email task, word count requirements, how to engage with classmates' posts, or scoring criteria.",
      gre: "For GRE Analytical Writing, ask me about: issue essay structure, argument analysis, how to develop your thesis, scoring rubrics, or recommended essay length.",
      gmat: "For GMAT Integrated Reasoning and Analytical Writing, ask me about: identifying logical flaws in arguments, how to structure your analysis, common argument patterns, or scoring criteria.",
    };
    return examFallbacks[exam] || "Ask me about band scores, word count, paragraph structure, vocabulary, grammar, linking words, or the specific exam format you are preparing for.";
  }

  // ── Build-a-Sentence component (TOEFL) ────────────────────────────────────
  function BuildASentence({ sentences }) {
    const [idx, setIdx] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [checked, setChecked] = useState(false);
    const item = sentences[idx] || sentences[0];
    if (!item) return null;

    const shuffled = [...item.words].sort((a, b) => {
      // Deterministic shuffle based on item position
      const ha = (a.charCodeAt(0) * 37 + idx * 13) % 17;
      const hb = (b.charCodeAt(0) * 37 + idx * 13) % 17;
      return ha - hb;
    });

    const normalise = s => s.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
    const isCorrect = checked && normalise(userAnswer) === normalise(item.answer);

    return React.createElement("div", { className: "build-sentence-wrap" },
      React.createElement("div", { className: "bs-progress" }, `Sentence ${idx + 1} of ${sentences.length}`),
      React.createElement("div", { className: "bs-words" },
        shuffled.map((w, i) =>
          React.createElement("span", { key: i, className: "bs-word-chip" }, w)
        )
      ),
      React.createElement("div", { className: "bs-hint", style: { color: "#6b7280", fontSize: "0.82rem", marginBottom: 8 } }, `💡 Hint: ${item.hint}`),
      React.createElement("input", {
        className: "bs-input",
        type: "text",
        value: userAnswer,
        onChange: e => { setUserAnswer(e.target.value); setChecked(false); },
        placeholder: "Type the correct sentence here…",
        onKeyDown: e => e.key === "Enter" && setChecked(true)
      }),
      React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
        React.createElement("button", { className: "btn-primary", style: { fontSize: "0.85rem" }, onClick: () => setChecked(true) }, "Check"),
        React.createElement("button", { className: "btn-outline", style: { fontSize: "0.85rem" }, onClick: () => { setUserAnswer(""); setChecked(false); } }, "Clear"),
        idx < sentences.length - 1 && React.createElement("button", { className: "btn-outline", style: { fontSize: "0.85rem" }, onClick: () => { setIdx(idx + 1); setUserAnswer(""); setChecked(false); } }, "Next →")
      ),
      checked && React.createElement("div", {
        className: "bs-result",
        style: { marginTop: 10, padding: "10px 14px", borderRadius: 8, background: isCorrect ? "#dcfce7" : "var(--tint-red)", border: `1px solid ${isCorrect ? "#86efac" : "#fca5a5"}`, fontSize: "0.9rem" }
      },
        isCorrect
          ? React.createElement("span", { style: { color: "#166534" } }, "✓ Correct! Well done.")
          : React.createElement("span", { style: { color: "#991b1b" } }, `✗ Suggested answer: "${item.answer}"`)
      )
    );
  }

  // ── Duolingo Photo component ──────────────────────────────────────────────
  function DuoPhoto({ promptData }) {
    const [imgError, setImgError] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
      setImgError(false); setTimeLeft(60); setTimerActive(false);
    }, [promptData?.id]);

    useEffect(() => {
      if (!timerActive || timeLeft <= 0) return;
      const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
      return () => clearTimeout(t);
    }, [timerActive, timeLeft]);

    if (!promptData) return null;
    const timerColor = timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f59e0b" : "#22c55e";

    return React.createElement("div", { className: "duo-photo-wrap" },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
        React.createElement("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" } }, "Describe the Photo"),
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
          React.createElement("span", { style: { fontSize: "0.85rem", color: timerColor, fontWeight: 700 } }, `⏱ ${timeLeft}s`),
          !timerActive && React.createElement("button", {
            style: { fontSize: "0.78rem", padding: "2px 10px", border: "1px solid #d1d5db", borderRadius: 6, background: "var(--tint-gray)", cursor: "pointer" },
            onClick: () => setTimerActive(true)
          }, "Start Timer")
        )
      ),
      !imgError
        ? React.createElement("img", {
            src: promptData.photoUrl,
            alt: promptData.photoAlt || "Photo to describe",
            onError: () => setImgError(true),
            style: { width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb", marginBottom: 8 }
          })
        : React.createElement("div", {
            style: { background: "var(--tint-gray)", border: "1px solid #d1d5db", borderRadius: 10, padding: 16, marginBottom: 8, fontSize: "0.88rem", color: "#374151", lineHeight: 1.6 }
          },
            React.createElement("strong", { style: { display: "block", marginBottom: 4, color: "#4b5563" } }, "📷 Scene Description (image unavailable):"),
            promptData.photoFallbackDescription
          )
    );
  }

  // ── Score panel ───────────────────────────────────────────────────────────
  function ScoreBar({ pct, band, label }) {
    const color = band >= 7 ? "#22c55e" : band >= 5 ? "#f59e0b" : "#ef4444";
    return (
      React.createElement("div", { className: "score-bar-wrap" },
        React.createElement("div", { className: "score-bar-header" },
          React.createElement("span", null, `Band ${band} — ${label}`),
          React.createElement("span", { style: { color } }, `${pct}%`)
        ),
        React.createElement("div", { className: "score-bar-track" },
          React.createElement("div", { className: "score-bar-fill", style: { width: `${pct}%`, background: color } })
        )
      )
    );
  }

  function ScorePanel({ result, showSample, sampleText, onToggleSample }) {
    if (!result) return null;
    return (
      React.createElement("div", { className: "score-panel" },
        result.penalty && React.createElement("div", {
          style: { background: "var(--tint-red)", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: "0.88rem", color: "#991b1b", fontWeight: 600 }
        }, "⚠ Response is significantly below the minimum word count. Band score is reduced. Keep writing to unlock a higher score."),
        React.createElement(ScoreBar, { pct: result.pct, band: result.band, label: result.label }),
        React.createElement("ul", { className: "score-details" },
          result.details.map((d, i) => React.createElement("li", { key: i }, d))
        ),
        sampleText && React.createElement("button", {
          className: "btn-outline mt-1",
          style: { fontSize: "0.85rem", width: "100%", marginTop: 10 },
          onClick: onToggleSample,
        }, showSample ? "Hide Sample Answer" : "📄 Show Band 7+ Sample Answer"),
        showSample && sampleText && React.createElement("div", { className: "sample-answer-block" },
          React.createElement("h4", { style: { fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#4b5563" } }, "Band 7 Sample Answer"),
          React.createElement("div", { style: { whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0, fontSize: "0.9rem", lineHeight: 1.75, color:"var(--ink)" } }, sampleText)
        )
      )
    );
  }

  // ── Chat panel ────────────────────────────────────────────────────────────
  function ChatPanel({ examId, currentPromptLabel }) {
    const initMsg = `Hi! I'm your writing coach. I'm here to help you with ${examId.toUpperCase()} writing — band scores, structure, vocabulary, grammar, and strategy. What would you like help with?`;
    const [msgs, setMsgs] = useState([{ role: "agent", text: initMsg }]);
    const [input, setInput] = useState("");
    const [recentReplies, setRecentReplies] = useState([]);
    const endRef = useRef(null);

    useEffect(() => {
      endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    const send = () => {
      const t = input.trim();
      if (!t) return;
      setInput("");
      const newMsgs = [...msgs, { role: "user", text: t }];
      setMsgs(newMsgs);
      setTimeout(() => {
        const reply = chatbotReply(t, examId, recentReplies);
        setRecentReplies(prev => [...prev.slice(-4), reply]);
        setMsgs(prev => [...prev, { role: "agent", text: reply }]);
      }, 400);
    };

    return (
      React.createElement("div", { className: "chatbot-shell" },
        React.createElement("div", { className: "chat-header" },
          React.createElement("strong", null, "Writing Coach"),
          React.createElement("span", { style: { color: "#22c55e", fontSize: "0.78rem" } }, "● Online")
        ),
        React.createElement("div", { className: "chat-area" },
          msgs.map((m, i) =>
            React.createElement("div", {
              key: i,
              className: `chat-bubble ${m.role === "user" ? "chat-user" : "chat-agent"}`,
              style: { alignSelf: m.role === "user" ? "flex-end" : "flex-start" }
            },
              m.role !== "user" && React.createElement("div", { className: "bubble-label" }, "COACH"),
              m.role === "user" && React.createElement("div", { className: "bubble-label" }, "YOU"),
              React.createElement("div", { className: "bubble-text", style: { whiteSpace: "pre-wrap" } }, m.text)
            )
          ),
          React.createElement("div", { ref: endRef })
        ),
        React.createElement("div", { className: "input-bar" },
          React.createElement("input", {
            className: "chat-input",
            type: "text",
            placeholder: `Ask about ${examId.toUpperCase()} band scores, structure, grammar…`,
            value: input,
            onChange: e => setInput(e.target.value),
            onKeyDown: e => e.key === "Enter" && send(),
          }),
          React.createElement("button", {
            className: "btn-primary",
            style: { padding: "0.55rem 1.1rem" },
            onClick: send,
            disabled: !input.trim(),
          }, "Send")
        )
      )
    );
  }

  // ── Main WritingAgent component ────────────────────────────────────────────
  function WritingAgent({ exam }) {
    const EXAM_ID = (exam && exam.id) || "ielts";
    const examColor = (exam && exam.colour) || "#4f46e5";

    // Keep prompt list in state to avoid mutation bugs
    const [promptList, setPromptList] = useState(() => [...(BASE_PROMPTS[EXAM_ID] || BASE_PROMPTS.ielts)]);
    const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
    const [text, setText] = useState("");
    const [result, setResult] = useState(null);
    const [showSample, setShowSample] = useState(false);
    const [aiFb, setAiFb] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [tab, setTab] = useState("write");
    const [wordCount, setWordCount] = useState(0);
    const [showMinWarning, setShowMinWarning] = useState(false);
    const textareaRef = useRef(null);

    // Reset everything when exam or prompt changes
    useEffect(() => {
      setPromptList([...(BASE_PROMPTS[EXAM_ID] || BASE_PROMPTS.ielts)]);
      setSelectedPromptIdx(0);
      setText(""); setResult(null); setShowSample(false); setWordCount(0); setShowMinWarning(false);
    }, [EXAM_ID]);

    useEffect(() => {
      setText(""); setResult(null); setShowSample(false); setWordCount(0); setShowMinWarning(false);
    }, [selectedPromptIdx]);

    const handleTextChange = e => {
      const v = e.target.value;
      setText(v);
      const wc = v.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(v.trim() ? wc : 0);
      if (showMinWarning && wc >= currentPrompt.target) setShowMinWarning(false);
    };

    const currentPrompt = promptList[selectedPromptIdx] || promptList[0];
    const minWords = EXAM_MIN_WORDS[currentPrompt?.taskKind] || currentPrompt?.target || 150;
    const sampleKey = Object.keys(currentPrompt?.bandSample || {}).sort((a, b) => b - a)[0];
    const sampleText = currentPrompt?.bandSample?.[sampleKey];

    const handleScore = () => {
      if (!text.trim()) return;
      if (wordCount < minWords * 0.5 && minWords > 0) {
        setShowMinWarning(true);
      }
      const r = scoreWriting(text, minWords);
      setResult(r);
      setTab("write");
    };

    // Live AI examiner feedback via the Gemini backend (LP_AI_TUTOR). Falls back
    // gracefully to the heuristic score if the backend is offline.
    // Official rubric criteria per exam → calibrated, examiner-style scoring.
    const RUBRICS = {
      ielts:    { scale: "Band 0–9",  criteria: ["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"] },
      celpip:   { scale: "Level 1–12", criteria: ["Content/Coherence", "Vocabulary", "Readability", "Task Fulfilment"] },
      toefl:    { scale: "0–5 (scaled to 30)", criteria: ["Development", "Organization", "Language Use (grammar & vocabulary)"] },
      pte:      { scale: "10–90",     criteria: ["Content", "Form", "Grammar", "Vocabulary", "Spelling", "Development & Structure"] },
      gre:      { scale: "0–6",       criteria: ["Quality of Analysis", "Support & Examples", "Organization", "Language & Control"] },
      duolingo: { scale: "10–160",    criteria: ["Task Relevance", "Coherence", "Vocabulary", "Grammar"] },
    };
    const getAIFeedback = async () => {
      if (!text.trim() || aiLoading) return;
      setAiLoading(true); setAiFb(null);
      const examName = (exam && exam.name) || "IELTS";
      const rb = RUBRICS[(exam && exam.id) || "ielts"] || RUBRICS.ielts;
      // Long responses (GRE issue essays run past 600 words) were silently cut at 3,500
      // chars while the header still claimed the full word count — so the examiner graded a
      // partial essay and marked it down for an ending it never saw. Give it room, and say
      // so explicitly on the rare occasion the cap is still hit.
      const MAX_CHARS = 9000;
      const sent = text.slice(0, MAX_CHARS);
      const truncated = text.length > MAX_CHARS;
      const prompt =
        `You are a certified ${examName} writing examiner. Score the candidate's response strictly against the OFFICIAL ${examName} rubric and give a calibrated, realistic result (do not be generous).\n\n` +
        `TASK: ${currentPrompt.prompt || currentPrompt.label || "Writing task"}\n\n` +
        `CANDIDATE RESPONSE (${wordCount} words${truncated ? `, shown here truncated to the first ${MAX_CHARS} characters — do NOT penalise the ending or a missing conclusion` : ""}):\n"""${sent}"""\n\n` +
        `Reply in under 260 words as plain text with these EXACT labelled sections:\n` +
        `OVERALL: (the overall ${rb.scale} score, with a one-line justification)\n` +
        rb.criteria.map(c => `${c.toUpperCase()}: (sub-score on ${rb.scale} + one specific comment)`).join("\n") + `\n` +
        `TOP FIXES: (3 actionable points — quote the candidate where useful)\n` +
        `REWRITE: (one of the candidate's weaker sentences, rewritten to a higher band).`;
      try {
        const out = window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate ? await window.LP_AI_TUTOR.generate(prompt) : null;
        if (!out || /(?:AI|Smart) Tutor is offline/i.test(out) || out.trim().startsWith("⚠")) setAiFb({ offline: true });
        else setAiFb({ text: out.trim() });
      } catch (_) { setAiFb({ offline: true }); }
      setAiLoading(false);
    };

    const wcPct = Math.min(100, minWords > 0 ? Math.round((wordCount / minWords) * 100) : 100);
    const wcColor = wordCount >= minWords ? "#22c55e" : wordCount >= minWords * 0.7 ? "#f59e0b" : "#ef4444";
    const isBuildSentence = currentPrompt?.taskKind === "toefl_sentence";
    const isDuoPhoto = currentPrompt?.taskKind === "duolingo" && currentPrompt?.photoUrl;
    const isToeflEmail = currentPrompt?.taskKind === "toefl_email";
    const isToeflDiscussion = currentPrompt?.taskKind === "toefl_discussion";

    return (
      React.createElement("div", { className: "writing-agent-shell" },
        // Header
        React.createElement("div", { className: "agent-header", style: { borderColor: examColor } },
          React.createElement("div", { className: "agent-icon", style: { background: examColor } }, "✍️"),
          React.createElement("div", null,
            React.createElement("h2", { style: { margin: 0 } }, "Writing Feedback"),
            React.createElement("p", { style: { margin: 0, color: "#6b7280", fontSize: "0.9rem" } },
              `${(exam && exam.name) || "IELTS"} writing practice with instant scoring`
            )
          )
        ),

        // Prompt selector
        React.createElement("div", { className: "prompt-selector" },
          promptList.map((p, i) =>
            React.createElement("button", {
              key: p.id + "_" + i,
              className: `prompt-tab ${selectedPromptIdx === i ? "active" : ""}`,
              style: selectedPromptIdx === i ? { borderColor: examColor, color: examColor } : {},
              onClick: () => setSelectedPromptIdx(i),
            }, `${p.type}: ${p.label}`)
          ),
          React.createElement("button", {
            className: "prompt-tab",
            style: { borderColor: examColor, color: examColor, fontWeight: 600 },
            title: "Load a fresh original prompt from the Learning Hub",
            onClick: async () => {
              try {
                if (!window.LP_HUB) return;
                const samples = await window.LP_HUB.loadSection(EXAM_ID, "writing");
                if (samples && samples.length) {
                  const pick = window.LP_HUB.pickRandom(samples, currentPrompt?.id);
                  if (pick) {
                    const extraPrompt = {
                      id: "hub_" + pick.id,
                      type: "New Prompt",
                      taskKind: EXAM_ID + "_task2",
                      target: 250,
                      label: pick.topic || "Fresh Topic",
                      prompt: pick.prompt,
                      bandSample: { 7: pick.modelAnswer || pick.band7Answer || "" },
                    };
                    const existingIdx = promptList.findIndex(p => p.id === extraPrompt.id);
                    if (existingIdx >= 0) {
                      setSelectedPromptIdx(existingIdx);
                    } else {
                      setPromptList(prev => {
                        const next = [...prev, extraPrompt];
                        setTimeout(() => setSelectedPromptIdx(next.length - 1), 0);
                        return next;
                      });
                    }
                  }
                }
              } catch (e) { /* swallow */ }
            }
          }, "🎲 New question")
        ),

        // Prompt display card
        React.createElement("div", { className: "prompt-card" },
          React.createElement("div", { className: "prompt-badge" }, currentPrompt.type),

          // Duolingo photo
          isDuoPhoto && React.createElement(DuoPhoto, { promptData: currentPrompt }),

          // Visual chart (IELTS Task 1)
          !isDuoPhoto && window.LP_VisualRenderer && (currentPrompt.visual || /\b(chart|graph|table|map|diagram|process)\b/i.test(currentPrompt.prompt || "")) && currentPrompt.taskKind === "ielts_task1" &&
            React.createElement(window.LP_VisualRenderer, { task: { prompt: currentPrompt.prompt, taskType: "academic_task_1_chart", visual: currentPrompt.visual || null } }),

          // TOEFL Discussion professor + student posts
          isToeflDiscussion && currentPrompt.professor && React.createElement("div", { className: "toefl-discussion-setup" },
            React.createElement("div", { style: { background: "var(--tint-blue)", border: "1px solid #c7d2fe", borderRadius: 8, padding: "12px 14px", marginBottom: 8 } },
              React.createElement("strong", { style: { display: "block", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#4338ca", marginBottom: 6 } }, `Professor ${currentPrompt.professor.name}`),
              React.createElement("p", { style: { margin: 0, fontSize: "0.9rem", lineHeight: 1.65 } }, currentPrompt.professor.question)
            ),
            (currentPrompt.studentPosts || []).map((s, i) =>
              React.createElement("div", { key: i, style: { background: "var(--tint-gray)", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 6 } },
                React.createElement("strong", { style: { fontSize: "0.85rem", display: "block", marginBottom: 4 } }, s.name),
                React.createElement("p", { style: { margin: 0, fontSize: "0.88rem", lineHeight: 1.6, color: "#4b5563" } }, s.text)
              )
            )
          ),

          // TOEFL Email — show scenario + bullet points prominently
          isToeflEmail && React.createElement("div", { style: { background: "var(--tint-amber)", border: "1px solid #fdba74", borderRadius: 8, padding: "12px 14px", marginBottom: 8 } },
            React.createElement("strong", { style: { display: "block", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#c2410c", marginBottom: 6 } }, "Situation"),
            React.createElement("p", { style: { margin: "0 0 10px", fontSize: "0.9rem", lineHeight: 1.65 } }, currentPrompt.scenario),
            React.createElement("ul", { style: { margin: 0, paddingLeft: 18 } },
              (currentPrompt.bullets || []).map((b, i) =>
                React.createElement("li", { key: i, style: { fontSize: "0.88rem", lineHeight: 1.65, color: "#374151" } }, b)
              )
            )
          ),

          // Build-a-Sentence task
          isBuildSentence
            ? React.createElement(BuildASentence, { sentences: currentPrompt.sentences || [] })
            : React.createElement(React.Fragment, null,
                React.createElement("p", { className: "prompt-text" }, currentPrompt.prompt),
                React.createElement("div", { className: "prompt-meta" },
                  minWords > 0 && React.createElement("span", null, `Minimum: ${minWords} words`),
                  React.createElement("span", { style: { color: "#6b7280" } }, " · "),
                  React.createElement("span", null, currentPrompt.label)
                )
              )
        ),

        // Tab bar (only for non-Build-a-Sentence tasks)
        !isBuildSentence && React.createElement("div", { className: "wa-tab-bar" },
          React.createElement("button", {
            className: `wa-tab ${tab === "write" ? "active" : ""}`,
            style: tab === "write" ? { borderBottomColor: examColor, color: examColor } : {},
            onClick: () => setTab("write"),
          }, "Write & Score"),
          React.createElement("button", {
            className: `wa-tab ${tab === "chat" ? "active" : ""}`,
            style: tab === "chat" ? { borderBottomColor: examColor, color: examColor } : {},
            onClick: () => setTab("chat"),
          }, "Writing Coach Chat")
        ),

        // Write tab
        !isBuildSentence && tab === "write" && React.createElement("div", { className: "write-tab" },
          React.createElement("textarea", {
            ref: textareaRef,
            className: "writing-area",
            placeholder: isToeflEmail ? "Write your email here (100–120 words)…" : isToeflDiscussion ? "Write your discussion post here (100+ words)…" : `Start writing your response here (minimum ${minWords} words)…`,
            value: text,
            onChange: handleTextChange,
            rows: 14,
          }),

          // Word count bar
          minWords > 0 && React.createElement("div", { className: "word-count-bar" },
            React.createElement("div", { className: "wc-track" },
              React.createElement("div", { className: "wc-fill", style: { width: `${wcPct}%`, background: wcColor } })
            ),
            React.createElement("div", { className: "wc-label", style: { color: wcColor } },
              `${wordCount} / ${minWords} words${wordCount > 0 && wordCount < minWords ? ` (need ${minWords - wordCount} more)` : wordCount >= minWords ? " ✓" : ""}`
            )
          ),

          showMinWarning && React.createElement("div", {
            style: { background: "var(--tint-red)", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 12px", fontSize: "0.84rem", color: "#b91c1c", marginTop: 6 }
          }, `⚠ Your response has only ${wordCount} words. The minimum is ${minWords}. Band score will be severely penalised. Continue writing to improve your score.`),

          React.createElement("div", { style: { display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" } },
            React.createElement("button", {
              className: "btn-primary",
              style: { background: examColor },
              onClick: handleScore,
              disabled: !text.trim(),
            }, "Score My Writing"),
            React.createElement("button", {
              className: "btn-primary",
              style: { background: "linear-gradient(135deg,#7c3aed,#4f46e5)" },
              onClick: getAIFeedback,
              disabled: !text.trim() || aiLoading,
              title: "Detailed examiner feedback from AI (needs the AI backend online)",
            }, aiLoading ? "✨ Analysing…" : "✨ Get instant feedback"),
            React.createElement("button", {
              className: "btn-outline",
              onClick: () => { setText(""); setResult(null); setShowSample(false); setAiFb(null); setWordCount(0); setShowMinWarning(false); },
              disabled: !text,
            }, "Clear")
          ),

          aiFb && React.createElement("div", { className: "ai-feedback-panel" },
            React.createElement("div", { className: "ai-fb-head" }, "✨ Examiner Feedback"),
            aiFb.offline
              ? React.createElement("p", { className: "ai-fb-offline" }, "The AI examiner is offline right now (start the AI backend to enable it). Your instant heuristic score and the Band model answer below are still available.")
              : React.createElement("div", { className: "ai-fb-body" }, aiFb.text)
          ),

          result && React.createElement(ScorePanel, {
            result,
            showSample,
            sampleText,
            onToggleSample: () => setShowSample(s => !s),
          })
        ),

        // Chat tab — key forces remount on exam+prompt change to clear history
        !isBuildSentence && tab === "chat" && React.createElement(ChatPanel, {
          key: EXAM_ID + "_" + selectedPromptIdx,
          examId: EXAM_ID,
          currentPromptLabel: currentPrompt?.label
        })
      )
    );
  }

  window.LP_WritingAgent = WritingAgent;
})();
