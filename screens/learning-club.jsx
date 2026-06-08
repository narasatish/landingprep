// Learning Club — writing topics, speaking topics, vocabulary, math, tips per exam
const { useState: useStateLC, useCallback: useCbLC } = React;

const LC_CONTENT = {
  ielts: {
    label: "IELTS", colour: "#B83A2E",
    writing: [
      {
        id:"lc_iw1",
        prompt:"Some people believe that the best way to improve public health is to increase the number of sports facilities. Others, however, say that this would have little effect unless people are educated to lead a healthier lifestyle. Discuss both views and give your own opinion.",
        approach:"Discuss both views with specific arguments for each, then give your opinion supported by evidence. Avoid sitting on the fence — take a clear position in your conclusion.",
        band7Answer:`It is widely accepted that modern populations are facing serious health challenges, including rising rates of obesity, cardiovascular disease, and mental illness. The question of whether new sports facilities or public health education offers the more effective solution has generated considerable debate.

Those who advocate for more sports facilities argue that easy access to exercise infrastructure directly removes a key barrier to physical activity. When people have nearby gyms, swimming pools, or sports courts available at low or no cost, they are far more likely to incorporate exercise into their routines. Some governments have demonstrated this through investment in public parks and subsidised leisure centres, which have been linked to measurable improvements in community health metrics.

However, critics of this approach contend that physical infrastructure alone is insufficient. Research consistently shows that changes in health behaviour require sustained motivation, and motivation is driven by knowledge and attitude, not just availability. A well-equipped gym helps only those already inclined to use it; those with unhealthy diets, sedentary habits, and low health literacy may not enter sports facilities regardless of their proximity or cost.

My own view is that education must accompany infrastructure investment for either to be fully effective. People who understand the health consequences of their choices, and who have been equipped from a young age with practical knowledge of nutrition and exercise, are far more likely to make use of available facilities. In isolation, neither approach is sufficient; together, they are significantly more powerful.

In conclusion, while expanding sports facilities creates valuable opportunity, it is education that creates the motivation necessary to seize that opportunity. A genuinely effective public health strategy must invest in both.

(270 words)`,
        vocab:["infrastructure","sedentary","health literacy","motivation","cardiovascular","substantially","measurable improvements","in isolation"]
      },
      {
        id:"lc_iw2",
        prompt:"In many countries, the number of animals and plants is declining. Why is this happening? How can this problem be solved?",
        approach:"For a two-part question, address both parts with roughly equal depth. Use problem → cause → effect → solution structure. Include specific examples.",
        band7Answer:`Across the globe, the richness of living species is diminishing at an alarming rate. Scientists estimate that extinction is occurring at one hundred to one thousand times the natural background rate — a crisis that demands urgent examination of its causes and potential remedies.

The primary driver of species decline is habitat destruction. As human populations grow and economies expand, forests are cleared for agriculture, wetlands are drained, and coastlines are developed. This deforestation and habitat fragmentation leaves wildlife with insufficient space to maintain viable populations. In the Amazon basin, for example, decades of deforestation have placed numerous species on the brink of extinction. Climate change compounds these problems by altering temperature, rainfall, and seasonal patterns faster than many species can adapt. Pollution and the introduction of invasive species further weaken native populations already stressed by habitat loss.

Addressing this crisis requires action on multiple fronts. Governments must strengthen environmental legislation and enforce protected area regulations rather than allowing economic interests to override conservation laws. International agreements, such as the Convention on Biological Diversity, need stronger compliance mechanisms and greater funding from developed nations. At the local level, community-based conservation programmes that give indigenous and rural populations a financial stake in protecting their surrounding ecosystems have proven highly effective in regions such as Costa Rica and Namibia.

Individuals also have a role to play through choices in diet — particularly reducing meat consumption, which drives much of the demand for agricultural land — and through supporting organisations that fund conservation research and advocacy.

In conclusion, species decline results primarily from habitat destruction and climate change, and can only be addressed through concerted action by governments, communities, and individuals working in concert.

(276 words)`,
        vocab:["biodiversity","viable populations","deforestation","habitat fragmentation","invasive species","compliance mechanisms","community-based conservation"]
      },
      {
        id:"lc_iw3",
        prompt:"The most important thing parents can do to prepare children for the future is to encourage them to be independent. To what extent do you agree or disagree?",
        approach:"Take a clear position — agree, partially agree, or disagree. Do not write 'it depends' without committing to a view. Use developmental psychology concepts if possible.",
        band7Answer:`Independence — the capacity to think, decide, and act without constant external direction — is undoubtedly a valuable quality that parents can foster in their children. However, to claim it is the most important preparation for the future is to oversimplify the complex set of attributes that children need.

The case for prioritising independence is compelling. As children grow into adulthood, they will face countless situations in which parental guidance is unavailable: choosing a career, managing finances, navigating relationships, and recovering from setbacks. Research in developmental psychology suggests that children who are given age-appropriate autonomy — who are allowed to make decisions, experience the consequences of those decisions, and problem-solve without immediate adult intervention — develop stronger executive function, resilience, and self-efficacy. These qualities serve them across every domain of adult life.

However, independence in isolation is insufficient, and potentially even counterproductive, without the accompanying skills of collaboration, empathy, and communication. In an increasingly interconnected world, the ability to work effectively with others — across cultures, disciplines, and perspectives — is at least as important as self-reliance. A child raised to value only individual agency may struggle in professional and personal contexts that demand compromise, active listening, and shared decision-making.

Furthermore, emotional security in childhood — which comes not from independence but from consistent, responsive parenting — forms the foundation upon which genuine independence can be built. Children who feel securely attached are, paradoxically, better equipped to explore the world independently.

In conclusion, while encouraging independence is highly valuable, it is most effective when developed alongside emotional resilience and collaborative skills, rather than being treated as the single most important goal.

(270 words)`,
        vocab:["executive function","self-efficacy","autonomy","resilience","secure attachment","collaborative","counterproductive"]
      }
    ],
    speaking: [
      {
        part: 2,
        id:"lc_isp1",
        prompt:"Describe a time when you helped someone. You should say: who you helped, what the situation was, how you helped them, and explain how you felt about helping.",
        approach:"Structure: Set the scene → describe the situation → explain what you did → reflect on the impact and your feelings. Aim for 2 minutes of detailed, natural speech.",
        band7Answer:`I'd like to talk about a time a few years ago when I helped a neighbour of mine — an elderly woman named Mrs Patel who lives across the street from my family.

It was during a particularly cold winter, and Mrs Patel had been struggling with some health issues that made it difficult for her to go out. I noticed that her lights seemed to be on all day and that she hadn't been collecting her post, which was a little out of character for her. So I knocked on her door to check if everything was alright.

It turned out she had been ill for about a week and hadn't been able to get to the supermarket. She was running low on food and some essential medications. I offered to do her shopping for her, and over the next two weeks while she was recovering, I made sure to check in with her every couple of days — bringing groceries, sitting with her for a cup of tea, and just keeping her company so she didn't feel quite so isolated.

What struck me was how grateful she was — not just for the practical help, but for the company. She mentioned that she hadn't really spoken to anyone in days, which made me feel that the emotional support was perhaps as valuable as the shopping.

Honestly, it was one of those experiences that stays with you. It reminded me that sometimes small acts of attention — just noticing when someone is struggling — can make a very real difference to a person's wellbeing.`,
        keyVocab:["out of character","essential medications","keeping company","isolated","practical help","emotional support","act of attention","wellbeing"]
      },
      {
        part: 2,
        id:"lc_isp2",
        prompt:"Describe an interesting article or news story you read recently. You should say: where you read it, what it was about, why you found it interesting, and explain what you learned from it.",
        approach:"Pick a topic you genuinely know about — if you struggle to find words, it will show. Link the article to broader ideas in Part 3 discussion.",
        band7Answer:`I'd like to describe an article I came across recently in a science journal — it was about research into how forests communicate through underground fungal networks.

The article explained that trees in a forest are connected via what scientists call the 'mycorrhizal network' — a web of fungal threads in the soil that links the root systems of different trees. Through this network, trees are able to share nutrients: a larger, well-established tree can actually transfer sugars to a younger seedling that is struggling to get enough sunlight. Some researchers have even found that trees can send chemical warning signals through the network when they are under attack from insects or disease.

I found it genuinely fascinating, partly because it fundamentally challenges the assumption that trees — and plants more broadly — are entirely passive and isolated. The idea that a forest might function more like a cooperative community than a collection of competing individuals is quite a radical reframing. The researcher whose work the article focused on, Suzanne Simard, has spent decades studying this, and her description of 'mother trees' — the largest trees that act as hubs for the entire network — was both scientifically interesting and, I have to say, surprisingly moving.

What I took away from it was a broader point about interconnectedness — that even in environments we think of as purely competitive, cooperation can be a more powerful survival strategy than competition. I think there's a lesson in that for human society too, though perhaps I'm reading too much into it.`,
        keyVocab:["mycorrhizal network","fundamentally challenges","passive and isolated","cooperative community","radical reframing","interconnectedness","survival strategy"]
      }
    ],
    vocabulary: [
      { word:"Eloquent", meaning:"Fluent or persuasive in speaking or writing", example:"The candidate gave an eloquent speech that won widespread applause.", synonyms:["articulate","persuasive","expressive"] },
      { word:"Exacerbate", meaning:"To make worse", example:"The drought was exacerbated by poor water management policies.", synonyms:["worsen","aggravate","intensify"] },
      { word:"Alleviate", meaning:"To make something less severe", example:"Regular exercise can alleviate symptoms of mild depression.", synonyms:["ease","reduce","mitigate"] },
      { word:"Ubiquitous", meaning:"Present everywhere", example:"Smartphones have become ubiquitous in modern urban life.", synonyms:["omnipresent","pervasive","widespread"] },
      { word:"Pragmatic", meaning:"Practical, dealing with problems in a realistic way", example:"A pragmatic approach to policy often produces more lasting results than ideological purity.", synonyms:["practical","realistic","utilitarian"] }
    ],
    tips: ["Read IELTS-style texts daily from broadsheet newspapers and academic journals.", "Record yourself speaking for 2 minutes on random topics and listen back critically.", "Practice writing with a timer — 20 min for Task 1, 40 min for Task 2.", "Learn 10 new high-frequency academic words per week using the Oxford Academic Word List.", "Review your error log after every mock test — identify patterns, not just individual mistakes."]
  },
  toefl: {
    label: "TOEFL iBT", colour: "#1F4F8B",
    writing: [
      {
        id:"lc_tw1",
        prompt:"Do you agree or disagree with the following statement? Universities should require all students to take at least one course outside their major field of study. Use specific reasons and examples to support your answer.",
        approach:"TOEFL Independent Writing: Take a clear position in your first sentence. Body paragraphs each support one reason. Concise conclusion. Aim for 300+ words.",
        band7Answer:`I strongly agree that universities should require students to take at least one course outside their major field. In an era of increasing specialisation, exposure to diverse disciplines produces graduates who are not only more knowledgeable but also more adaptable and creative in their professional lives.

The most compelling reason for this requirement is that it promotes cross-disciplinary thinking — the ability to apply insights from one field to problems in another. Some of the most significant innovations of recent decades have emerged precisely at the intersection of disciplines: the development of behavioural economics, for example, required economists to engage seriously with psychology. A computer scientist who has taken a course in ethics is better equipped to think about the social consequences of algorithms. Confining students entirely to their major limits their intellectual toolkit and, by extension, limits the quality of the solutions they can generate.

Beyond professional utility, breadth of education has intrinsic value. University education is arguably the last opportunity most people have to explore subjects beyond their immediate career path in a structured way. A business student who takes a literature course may develop a richer capacity for empathy and narrative — qualities that matter enormously in leadership, negotiation, and communication. These 'soft' benefits are difficult to measure but have significant real-world impact.

Critics argue that requiring courses outside a major wastes time that could be spent deepening expertise. While this concern has some merit, a single course represents a very small proportion of a typical degree programme. The benefits of breadth comfortably outweigh this minimal cost.

In conclusion, mandatory cross-disciplinary courses enrich students' intellectual development, improve their professional adaptability, and contribute to the kind of broad-minded thinking that complex modern problems require.

(283 words)`,
        vocab:["cross-disciplinary","intellectual toolkit","intrinsic value","adaptability","comfortably outweigh","behavioural economics","real-world impact"]
      }
    ],
    speaking: [
      {
        part: 1,
        id:"lc_tsp1",
        prompt:"Task 1 (Independent): Talk about a skill or hobby you enjoy and explain why it is important to you. Include specific details and reasons.",
        approach:"State your topic in sentence 1. Give two reasons with brief examples. Strong conclusion. Target: 45 seconds of continuous speech.",
        band7Answer:`One skill that I really value is cooking — and I've been developing it for about five years.

The first reason it matters to me is practical: cooking my own meals is significantly cheaper than eating out or buying prepared food, and it lets me control the quality and nutrition of what I eat. This has become especially important to me since I started paying closer attention to my health.

The second reason is more personal. Cooking is creative — there's real satisfaction in taking raw ingredients and turning them into something that tastes good and brings people together. I often cook for friends on weekends, and those shared meals have strengthened some of my closest friendships.

So for both practical and social reasons, cooking is a skill I genuinely treasure.`
      }
    ],
    vocabulary: [
      { word:"Substantiate", meaning:"To provide evidence to support a claim", example:"The researcher substantiated her hypothesis with three independent studies.", synonyms:["support","verify","corroborate"] },
      { word:"Nuanced", meaning:"Subtle and complex", example:"A nuanced analysis considers multiple perspectives rather than reducing issues to simple binaries.", synonyms:["subtle","complex","sophisticated"] },
      { word:"Proliferate", meaning:"To increase rapidly in number", example:"Social media platforms have proliferated over the past decade.", synonyms:["multiply","spread","grow rapidly"] }
    ],
    tips: ["TOEFL speaking: practice with a timer and record yourself — unreviewed recordings are wasted practice.", "For Integrated Writing, always note the structure of the reading before the lecture begins.", "Academic Discussion: add a specific example or data point — generic opinions score lower.", "Use the 45-second prep time in speaking to write 3 keywords, not full sentences."]
  },
  gre: {
    label: "GRE", colour: "#5B3A8B",
    writing: [
      {
        id:"lc_grw1",
        prompt:"Claim: 'In any field, the most important factor in achieving success is persistence rather than talent.' Reason: 'Talent alone cannot compensate for a lack of determination and effort.'",
        approach:"GRE Issue tasks require you to take a position and defend it with specific, relevant evidence. Acknowledge counterarguments. Target: 450–550 words, 4–5 paragraphs.",
        band7Answer:`The claim that persistence outweighs talent in achieving success captures a genuine truth about human achievement, though framed as an absolute it overstates the case. The relationship between talent and persistence is better understood as complementary than competitive, and the relative weight of each varies significantly across domains.

The empirical evidence for persistence's importance is substantial. Anders Ericsson's research on expert performance — which popularised the idea that approximately ten thousand hours of deliberate practice is associated with world-class skill — demonstrated that the acquisition of expertise is primarily the result of structured effort, not innate ability. Studies of athletes, musicians, and mathematicians have consistently found that those who practise most deliberately, not those with the highest early aptitude scores, tend to reach the highest levels. This finding is reinforced by Carol Dweck's research on growth mindset: individuals who believe their abilities are developable through effort systematically outperform those who treat ability as fixed, regardless of their starting level.

However, the claim's weakness lies in its universality. In certain domains, particularly those requiring extreme physical capabilities — professional sprinting, for instance — biological constraints cannot be fully overcome by effort alone. Similarly, in highly competitive creative fields, where talent is both widespread and genuinely exceptional among those who succeed, raw ability serves as the entry cost, and persistence determines who rises to the top. Persistence alone, without adequate natural aptitude, may produce competent performance but rarely elite achievement in the most demanding arenas.

Moreover, the relationship is not simply additive. Persistent effort applied without talent may reinforce poor technique, while talent without structured practice rarely self-develops to full potential. The most reliably successful individuals appear to combine above-average natural ability with exceptional commitment to improvement — neither factor sufficient alone, both transformative together.

In conclusion, the claim correctly identifies persistence as the more controllable and often more decisive variable in long-run achievement. Yet casting it as the single most important factor erases the genuine contribution of natural aptitude. A more accurate framing would hold that persistence is necessary but not always sufficient for the highest levels of success, and that in most domains it is the combination of the two that produces truly exceptional outcomes.

(348 words)`,
        vocab:["deliberate practice","aptitude","growth mindset","biological constraints","systematically","complementary","empirical evidence"]
      }
    ],
    math: [
      {
        topic:"Percentage and Ratio Problems",
        concept:`Percentages and ratios appear in nearly every GRE Quantitative section. Key principles:
• Percentage change = (New – Old) / Old × 100
• Successive discounts: multiply the factors, don't add (e.g., 20% then 15% off = 1 – 0.80×0.85 = 32% off, not 35%)
• Ratio problems: use a multiplier variable (e.g., if ratio is 3:5, set amounts as 3x and 5x)
• To find what percent A is of B: (A/B) × 100`,
        formulas:["% change = (new – old)/old × 100","Harmonic mean (for average rate) = 2ab/(a+b)","If A:B = m:n, then A = m/(m+n) of total"],
        example:"A store marks up an item by 40% and then offers a 25% discount. What is the net percentage change from the original price?",
        solution:"Net price = 1.40 × 0.75 = 1.05 of original. Net change = +5%. The item is 5% more expensive than the original price.",
        trap:"Candidates often add percentage changes (40% – 25% = 15% increase). Always multiply the factors."
      },
      {
        topic:"Work and Rate Problems",
        concept:`Work problems follow the formula: Work = Rate × Time.
• If A completes a job in a hours, A's rate = 1/a (jobs per hour)
• Combined rate of A and B working together = 1/a + 1/b
• Time together = 1/(1/a + 1/b) = ab/(a+b)`,
        formulas:["Rate = 1/time (for one complete job)","Combined time = ab/(a+b)","If pipe fills at rate r and pipe empties at rate s, net rate = r – s"],
        example:"Pipe A fills a tank in 3 hours. Pipe B fills the same tank in 6 hours. Pipe C drains it in 9 hours. All three are open simultaneously. How long to fill the tank?",
        solution:"Net rate = 1/3 + 1/6 – 1/9 = 6/18 + 3/18 – 2/18 = 7/18 per hour. Time = 18/7 ≈ 2.57 hours.",
        trap:"Forgetting to subtract the draining pipe's rate, treating it as additive."
      },
      {
        topic:"Permutations and Combinations",
        concept:`Counting problems: determine whether order matters.
• If order matters (arrangements): Permutation → nPr = n!/(n–r)!
• If order does not matter (selections): Combination → nCr = n!/[r!(n–r)!]
• Rule of thumb: 'choosing a committee' = combination; 'arranging on a shelf' = permutation`,
        formulas:["nPr = n!/(n−r)!","nCr = n!/[r!(n−r)!]","nCr = nC(n−r) (symmetry property)"],
        example:"A team of 4 is to be chosen from 9 candidates. How many different teams are possible?",
        solution:"9C4 = 9!/(4!×5!) = (9×8×7×6)/(4×3×2×1) = 3024/24 = 126.",
        trap:"Using permutation (order matters) when a committee question does not care about order, inflating the answer by a factor of r!."
      }
    ],
    tips: ["For Text Completion, read the sentence for logical clues (pivot words like 'however', 'despite', 'because') before looking at options.", "In QC, test with 0, 1, a fraction, and a negative number — this catches most traps.", "AW essays: write a concise but clear outline (30 seconds) before drafting.", "Verbal: don't spend more than 90 seconds on any single question — move on and return if time allows."]
  },
  gmat: {
    label: "GMAT Focus", colour: "#B5852C",
    writing: [
      {
        id:"lc_gmw1",
        prompt:"Note: GMAT Focus Edition does not include Analytical Writing. This section covers Critical Reasoning strategy and Reading Comprehension practice — the core Verbal components.",
        approach:"For CR: identify the conclusion, then the evidence, then the assumption bridge. Pre-think before reading options. For RC: read the first sentence of each paragraph to map structure before answering.",
        band7Answer:`GMAT Focus Edition Verbal Reasoning focuses on Critical Reasoning and Reading Comprehension — no Sentence Correction.

CRITICAL REASONING FRAMEWORK:
Every CR argument has three parts: Premise (evidence given), Conclusion (claim made), and Assumption (unstated premise that bridges premise to conclusion).

To identify the ASSUMPTION: ask 'what must be true for the conclusion to follow from the premises?' This is what Strengthen/Weaken/Assumption questions target.

Common CR question types in GMAT Focus:
• Strengthen: find the answer that most supports the conclusion
• Weaken: find the answer that most undermines the conclusion
• Assumption: find the unstated premise required for the argument to hold
• Inference: find what MUST be true given the premises (not probably/possibly true)
• Boldface: identify the role of highlighted statements in the argument

READING COMPREHENSION STRATEGY:
1. Read the first sentence of each paragraph to build a passage map
2. Note the author's main point and tone (critical, neutral, supportive)
3. For detail questions: return to the passage, don't rely on memory
4. For inference questions: the answer must be directly supported by the text, not merely consistent with it

Pre-thinking strategy: before reading answer options, form your own expected answer. This dramatically reduces the pull of 'attractive but wrong' options.`,
        vocab:["premise","conclusion","assumption","inference","strengthen","weaken","boldface","pre-thinking"]
      }
    ],
    math: [
      {
        topic:"Data Sufficiency Framework",
        concept:`Data Sufficiency is unique to GMAT. You are NOT solving — you are assessing whether the information given is SUFFICIENT to solve.

The 5 answer choices are ALWAYS:
A. Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient
B. Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient
C. BOTH statements TOGETHER are sufficient, but neither alone is sufficient
D. EACH statement ALONE is sufficient
E. Statements (1) and (2) together are NOT sufficient

Memorise these. Every DS question uses exactly these 5 options.`,
        formulas:["Test: is there EXACTLY ONE possible answer? (yes = sufficient; multiple answers = not sufficient)", "If each statement alone → sufficient, answer is D", "If only together → sufficient, answer is C"],
        example:"Is x positive?\n(1) x² = 4\n(2) x + 3 > 0",
        solution:"Statement (1): x = 2 or x = –2 → not sufficient alone (x could be positive or negative). Statement (2): x > –3 → not sufficient (x = –1 satisfies this but is negative; x = 2 also satisfies it and is positive). Together: x = 2 (satisfies both) or x = –2 (does NOT satisfy statement 2 since –2 + 3 = 1 > 0 ✓) — wait, actually x = –2 gives –2+3=1>0, TRUE. And x = 2 gives 4+3=7>0, TRUE. Both values satisfy both statements. So TOGETHER are NOT sufficient. Answer: E.",
        trap:"Assuming that because each statement looks 'restrictive' they must be sufficient together. Always test multiple values."
      },
      {
        topic:"Problem Solving — Algebra and Word Problems",
        concept:`GMAT Focus QR contains 21 Problem Solving questions (no Data Sufficiency). Common topics: linear equations, quadratics, inequalities, ratios, word problems, number properties.

KEY STRATEGY: When algebra gets complex, try Picking Numbers — substitute simple values that satisfy any given constraints and test each answer option.`,
        formulas:["Distance = Rate × Time","Profit = Revenue – Cost","Simple interest = PRT; Compound interest = P(1+r/n)^(nt)","Average = Sum/Count"],
        example:"If x² – 5x + 6 = 0, what is the value of x² + x?",
        solution:"Factor: (x–2)(x–3)=0 → x=2 or x=3. If x=2: x²+x = 4+2=6. If x=3: x²+x=9+3=12. Both values are possible — check if the question restricts to one solution. If no restriction, the answer would be listed as both in a select-all question, or the test would provide more context.",
        trap:"Solving for x and forgetting to evaluate the expression asked for — the question asks for x²+x, not x."
      }
    ],
    tips: ["Memorise the 5 DS answer choices before test day — not knowing them cold costs 15–30 seconds per question.", "CR: spend 30–45 seconds identifying the conclusion and assumption BEFORE reading options.", "GMAT Focus allows section order choice — start with your strongest section to build confidence and perform best where it matters most.", "On RC, wrong answers are often true statements from the passage that do not answer the specific question asked."]
  },
  pte: {
    label: "PTE Academic", colour: "#2F6F4E",
    writing: [
      {
        id:"lc_ptw1",
        prompt:"In many countries, obesity has become a major public health issue. What are the reasons for this trend, and what measures should be taken to address it?",
        approach:"PTE Write Essay: 200–300 words, well-structured. Introduction (define + position) → Body 1 (causes) → Body 2 (solutions) → Conclusion. Clear paragraph breaks, no bullet points.",
        band7Answer:`Obesity rates have risen dramatically across both developed and developing nations, creating significant burdens on public health systems and reducing quality of life for millions. Understanding the causes and identifying effective solutions is therefore a matter of considerable urgency.

Several interconnected factors drive the obesity epidemic. Chief among them is the widespread availability of cheap, calorie-dense processed food that is aggressively marketed, particularly to children. Simultaneously, increasingly sedentary lifestyles — driven by desk-based work, passive entertainment, and urban designs that discourage walking — mean that energy intake routinely exceeds expenditure. In lower-income populations, the problem is often compounded by limited access to affordable fresh produce and safe spaces for physical activity.

Addressing obesity requires coordinated action across multiple levels. Governments can introduce fiscal measures such as taxes on high-sugar beverages and subsidies on fresh food, both of which have shown modest effectiveness in pilot programmes. Schools must prioritise physical education and nutrition literacy, equipping young people with habits and knowledge that can persist into adulthood. Urban planners should design neighbourhoods that make walking and cycling the default option rather than an exceptional choice. At the individual level, public health campaigns can shift cultural attitudes towards food and activity, though evidence suggests that information alone is rarely sufficient without structural changes.

In conclusion, obesity is a multi-causal problem requiring multi-level solutions. A combination of regulatory action, educational investment, and environmental redesign offers the most promising path to reversing current trends.

(244 words)`,
        vocab:["calorie-dense","sedentary","energy expenditure","fiscal measures","nutrition literacy","structural changes","multi-causal"]
      }
    ],
    tips: ["Read Aloud: do NOT pause for more than 3 seconds — the microphone stops recording.", "Repeat Sentence: do NOT focus on individual words — capture sense chunks and reproduce them naturally.", "Write From Dictation: practice this daily — it has the highest weighting of all listening tasks.", "Describe Image: use 'The [chart/graph/image] shows...', mention the main trend, one comparison, and a conclusion.", "PTE Speaking also affects Listening scores — speaking accurately in RA/RS improves your overall Listening band."]
  },
  celpip: {
    label: "CELPIP", colour: "#C8501F",
    writing: [
      {
        id:"lc_cw1",
        prompt:"Email task: Your local community centre has announced that it will close its evening programmes due to budget cuts. Write an email to the centre's director expressing your concern and suggesting what they could do to keep the programmes running.",
        approach:"CELPIP email: Use a friendly, direct Canadian register. Address all three implied points: express concern, explain impact, suggest solutions. 150–200 words.",
        band7Answer:`Subject: Concern Regarding Evening Programme Cuts

Dear Director,

I am writing to express my concern about the proposed closure of the community centre's evening programmes. As a regular participant in the Tuesday evening fitness classes, I rely on these programmes not only for my own health and wellbeing but as an important way to stay connected with my community.

I understand that budget pressures are a real challenge, and I appreciate the difficult position the centre is in. However, I believe there are several alternatives worth exploring before closing the programmes entirely.

One possibility is to introduce a modest fee for evening sessions, which many regular participants — including myself — would likely be willing to pay in order to keep the programmes alive. Alternatively, the centre could explore partnerships with local businesses willing to sponsor specific programmes in exchange for community recognition.

I would welcome the opportunity to meet and discuss these ideas further. I am confident that with some creative thinking, we can find a way to keep these valuable programmes going for the community.

Thank you for your time and consideration.

Warm regards,
[Your name]

(175 words)`,
        vocab:["wellbeing","budget pressures","alternatives","partnership","sponsor","recognition","creative thinking"]
      }
    ],
    tips: ["CELPIP uses Canadian English — be aware of Canadian spelling (colour, honour, centre) and cultural references.", "Speaking Task 1 (Giving Advice): structure as Give the advice → Reason 1 → Reason 2 → Closing recommendation.", "Writing Task 1 email: must hit all three bullet points — missing one drops Task Fulfillment significantly.", "Listening: all audio features Canadian accents and situations — practise with Canadian podcasts and CBC Radio.", "Reading Part 4 is the most time-pressured — practise skimming opinion pieces for main argument."]
  },
  duolingo: {
    label: "Duolingo English Test", colour: "#4F8B2F",
    writing: [
      {
        id:"lc_dw1",
        prompt:"Writing Sample: Many people believe that social media has had a negative impact on how people communicate with each other. Do you agree or disagree? Give specific reasons to support your answer.",
        approach:"DET Writing Sample: 50–200 words. Clear position in the first sentence. Two specific reasons. Brief conclusion. Avoid starting every sentence with 'I'.",
        band7Answer:`Social media has undoubtedly changed communication, but I disagree that the overall impact is negative.

The strongest argument in favour of social media is its capacity to maintain and build meaningful connections across distance. Friends who live in different countries can stay genuinely close through regular exchanges that would have been prohibitively expensive or slow by phone or letter. This keeps relationships alive in ways that enrich people's lives.

Critics point to the shallowness of digital interactions compared to in-person conversations. This concern is valid — passive consumption of content is not the same as genuine communication. However, the issue lies with how social media is used, not with the technology itself. When used intentionally — for regular video calls, shared projects, or community discussion — digital platforms can deepen communication rather than diminish it.

The net impact depends on usage patterns. Used actively and intentionally, social media enhances human connection; used passively and compulsively, it can isolate. The technology is a tool; the quality of communication it enables reflects the choices of its users.

(162 words)`,
        vocab:["prohibitively expensive","genuine connection","passive consumption","intentionally","enhance","compulsively","usage patterns"]
      }
    ],
    tips: ["Read Aloud: clarity beats speed — measure your pace and enunciate clearly.", "Listen and Type: transcribe exactly, including small words like 'the', 'a', 'of' — they count.", "Speak About the Photo: one to two sentences, factual description, brief speculation with 'It appears that...'", "Writing Sample: always take a clear position and back it with at least one specific example.", "The adaptive test rewards correct answers on harder questions — slow down and prioritise accuracy."]
  }
};

function normaliseHubSample(s, kind) {
  // Adapt JSON shape → existing in-code shape used by LearningClub sub-components.
  // kind = "writing" | "speaking"
  if (!s) return s;
  const out = { id: s.id, prompt: s.prompt };
  if (kind === "writing") {
    out.approach = s.approach || (Array.isArray(s.structure) ? "Structure: " + s.structure.join(" → ") : "");
    out.band7Answer = s.band7Answer || s.modelAnswer || s.model_answer || "";
    out.vocab = s.vocab || s.vocabulary || s.keyVocab || [];
    out.topic = s.topic;
  } else if (kind === "speaking") {
    out.part = s.part === "part_2" ? 2 : s.part === "part_3" ? 3 : (typeof s.part === "number" ? s.part : 2);
    out.approach = s.approach || (Array.isArray(s.structure) ? "Structure: " + s.structure.join(" → ") : "");
    out.band7Answer = s.band7Answer || s.modelAnswer || s.model_answer || "";
    out.keyVocab = s.keyVocab || s.vocabulary || s.vocab || [];
    out.topic = s.topic;
  }
  return out;
}

// ── Word of the Day — high-band academic vocabulary, one per day ──────────────
const WORDS = [
  { w: "ubiquitous", pos: "adj.", def: "present, appearing, or found everywhere.", ex: "Smartphones have become ubiquitous in modern classrooms." },
  { w: "mitigate", pos: "verb", def: "to make something less severe, serious, or painful.", ex: "Governments are investing in renewables to mitigate climate change." },
  { w: "pragmatic", pos: "adj.", def: "dealing with things sensibly and realistically.", ex: "She took a pragmatic approach to solving the budget shortfall." },
  { w: "proliferate", pos: "verb", def: "to increase rapidly in number; multiply.", ex: "Online courses have proliferated over the past decade." },
  { w: "salient", pos: "adj.", def: "most noticeable or important.", ex: "The report highlights the salient features of the new policy." },
  { w: "alleviate", pos: "verb", def: "to make suffering or a problem less severe.", ex: "The charity works to alleviate poverty in rural areas." },
  { w: "nuanced", pos: "adj.", def: "characterised by subtle shades of meaning or expression.", ex: "He gave a nuanced analysis of the economic data." },
  { w: "robust", pos: "adj.", def: "strong and effective; able to withstand difficulties.", ex: "The study is based on a robust set of evidence." },
  { w: "advocate", pos: "verb", def: "to publicly recommend or support.", ex: "Many experts advocate for earlier language education." },
  { w: "detrimental", pos: "adj.", def: "tending to cause harm.", ex: "Excessive screen time can be detrimental to children's sleep." },
  { w: "feasible", pos: "adj.", def: "possible to do easily or conveniently.", ex: "It is not feasible to complete the project in a single week." },
  { w: "inherent", pos: "adj.", def: "existing as a natural or permanent characteristic.", ex: "There are risks inherent in any investment." },
  { w: "scrutinise", pos: "verb", def: "to examine closely and thoroughly.", ex: "Auditors scrutinise every transaction for errors." },
  { w: "compelling", pos: "adj.", def: "evoking interest or conviction in a powerful way.", ex: "She made a compelling argument for reform." },
  { w: "diverge", pos: "verb", def: "to develop in different directions; differ.", ex: "Their opinions diverge on how to fund the scheme." },
  { w: "viable", pos: "adj.", def: "capable of working successfully.", ex: "Solar power is now a viable alternative to fossil fuels." },
  { w: "exacerbate", pos: "verb", def: "to make a problem or situation worse.", ex: "Cutting funding could exacerbate the housing crisis." },
  { w: "prevalent", pos: "adj.", def: "widespread in a particular area or time.", ex: "Smartphone use is prevalent among teenagers." },
  { w: "substantiate", pos: "verb", def: "to provide evidence to support a claim.", ex: "The researcher could not substantiate her hypothesis." },
  { w: "intricate", pos: "adj.", def: "very complicated or detailed.", ex: "The essay explores the intricate links between diet and health." },
  { w: "redundant", pos: "adj.", def: "no longer needed or useful; superfluous.", ex: "Avoid redundant phrases to keep your writing concise." },
  { w: "underpin", pos: "verb", def: "to support, justify, or form the basis for.", ex: "Strong data underpin the government's new strategy." },
  { w: "discernible", pos: "adj.", def: "able to be perceived or recognised.", ex: "There was a discernible improvement in air quality." },
  { w: "cohesive", pos: "adj.", def: "forming a united whole; well-connected.", ex: "A cohesive essay links each paragraph to a clear thesis." },
  { w: "tangible", pos: "adj.", def: "clear and definite; real.", ex: "The training produced tangible benefits for staff." },
  { w: "endeavour", pos: "noun/verb", def: "an attempt to achieve a goal; to try hard.", ex: "Learning a language is a worthwhile endeavour." },
  { w: "paramount", pos: "adj.", def: "more important than anything else; supreme.", ex: "Safety is of paramount importance on a construction site." },
  { w: "conducive", pos: "adj.", def: "making a certain situation or outcome likely.", ex: "A quiet room is conducive to studying." },
  { w: "deteriorate", pos: "verb", def: "to become progressively worse.", ex: "Without maintenance, the bridge began to deteriorate." },
  { w: "comprehensive", pos: "adj.", def: "complete and including everything necessary.", ex: "The course offers comprehensive exam preparation." },
];
// GRE high-frequency vocabulary
const GRE_WORDS = [
  { w: "aberration", pos: "noun", def: "a departure from what is normal or expected.", ex: "The spike in sales was an aberration, not a trend." },
  { w: "capricious", pos: "adj.", def: "given to sudden changes of mood or behaviour.", ex: "The capricious weather ruined our plans." },
  { w: "ephemeral", pos: "adj.", def: "lasting for a very short time.", ex: "Fame can be ephemeral in the digital age." },
  { w: "garrulous", pos: "adj.", def: "excessively talkative, especially about trivial matters.", ex: "The garrulous guide never paused for breath." },
  { w: "laconic", pos: "adj.", def: "using very few words.", ex: "His laconic reply revealed little." },
  { w: "obfuscate", pos: "verb", def: "to deliberately make something unclear.", ex: "The jargon served only to obfuscate the issue." },
  { w: "quixotic", pos: "adj.", def: "extremely idealistic and unrealistic.", ex: "Her quixotic plan ignored the budget entirely." },
  { w: "recalcitrant", pos: "adj.", def: "stubbornly resistant to authority or control.", ex: "The recalcitrant student refused to follow the rules." },
  { w: "sycophant", pos: "noun", def: "a person who flatters to gain advantage.", ex: "The manager was surrounded by sycophants." },
  { w: "taciturn", pos: "adj.", def: "reserved or uncommunicative in speech.", ex: "The taciturn clerk answered only in nods." },
  { w: "venerate", pos: "verb", def: "to regard with great respect.", ex: "Scholars venerate the ancient text." },
  { w: "anomaly", pos: "noun", def: "something that deviates from the standard.", ex: "The data point was a clear anomaly." },
  { w: "dearth", pos: "noun", def: "a scarcity or lack of something.", ex: "There was a dearth of qualified applicants." },
  { w: "equivocal", pos: "adj.", def: "open to more than one interpretation; ambiguous.", ex: "The results were equivocal and needed retesting." },
  { w: "gregarious", pos: "adj.", def: "fond of company; sociable.", ex: "A gregarious host, she knew everyone's name." },
  { w: "hackneyed", pos: "adj.", def: "overused and therefore unoriginal.", ex: "Avoid hackneyed phrases in your essay." },
  { w: "iconoclast", pos: "noun", def: "a person who attacks cherished beliefs.", ex: "The iconoclast challenged every convention." },
  { w: "mollify", pos: "verb", def: "to appease the anger or anxiety of someone.", ex: "He tried to mollify the upset customer." },
  { w: "parsimonious", pos: "adj.", def: "unwilling to spend money or resources; stingy.", ex: "Their parsimonious budget left no room for error." },
  { w: "perfunctory", pos: "adj.", def: "carried out with minimum effort or care.", ex: "She gave a perfunctory nod and walked on." },
  { w: "sanguine", pos: "adj.", def: "optimistic, especially in a difficult situation.", ex: "He remained sanguine about the project's chances." },
  { w: "vacillate", pos: "verb", def: "to waver between different opinions or actions.", ex: "The committee vacillated for weeks." },
];
// GMAT / business vocabulary
const GMAT_WORDS = [
  { w: "arbitrage", pos: "noun", def: "buying and selling to profit from price differences.", ex: "Currency arbitrage exploits tiny exchange-rate gaps." },
  { w: "leverage", pos: "noun/verb", def: "use of borrowed capital; to use to maximum advantage.", ex: "High leverage increases both risk and return." },
  { w: "liquidity", pos: "noun", def: "the ease with which an asset can be converted to cash.", ex: "Cash has the highest liquidity of any asset." },
  { w: "amortise", pos: "verb", def: "to gradually write off the cost of an asset.", ex: "The firm will amortise the software over five years." },
  { w: "diversify", pos: "verb", def: "to spread investments to reduce risk.", ex: "Investors diversify across sectors and regions." },
  { w: "equity", pos: "noun", def: "ownership interest; the value of shares.", ex: "She holds a 20% equity stake in the start-up." },
  { w: "incentive", pos: "noun", def: "something that motivates a particular action.", ex: "Tax breaks act as an incentive to invest." },
  { w: "margin", pos: "noun", def: "the difference between cost and selling price.", ex: "A thin profit margin leaves little buffer." },
  { w: "overhead", pos: "noun", def: "ongoing business expenses not tied to a product.", ex: "Remote work cut the company's office overhead." },
  { w: "procurement", pos: "noun", def: "the process of obtaining goods and services.", ex: "Procurement negotiated a lower supplier rate." },
  { w: "stakeholder", pos: "noun", def: "anyone with an interest in a project or company.", ex: "The plan was approved by every stakeholder." },
  { w: "surplus", pos: "noun", def: "an amount left over after needs are met.", ex: "The trade surplus widened last quarter." },
  { w: "threshold", pos: "noun", def: "the level at which something starts to happen.", ex: "Sales must cross a threshold to be profitable." },
  { w: "valuation", pos: "noun", def: "an estimate of the worth of something.", ex: "The start-up's valuation doubled in a year." },
  { w: "volatility", pos: "noun", def: "the tendency to change rapidly and unpredictably.", ex: "Market volatility spooked investors." },
  { w: "yield", pos: "noun", def: "the income return on an investment.", ex: "The bond offers a 4% annual yield." },
  { w: "attrition", pos: "noun", def: "a gradual reduction, e.g. of staff or customers.", ex: "The firm reduced headcount through attrition." },
  { w: "benchmark", pos: "noun", def: "a standard point of reference for comparison.", ex: "Returns are measured against an index benchmark." },
];
const DECKS = [
  { id: "academic", name: "Academic (IELTS/TOEFL/PTE)", words: WORDS },
  { id: "gre", name: "GRE High-Frequency", words: GRE_WORDS },
  { id: "gmat", name: "GMAT / Business", words: GMAT_WORDS },
];
function WordOfDay() {
  const day = Math.floor(Date.now() / 86400000); // changes daily
  const word = WORDS[day % WORDS.length];
  return (
    <div className="word-of-day">
      <div className="wod-label">📖 Word of the day</div>
      <div className="wod-word">{word.w} <span className="wod-pos">{word.pos}</span></div>
      <div className="wod-def">{word.def}</div>
      <div className="wod-ex">“{word.ex}”</div>
    </div>
  );
}

// ── Spaced-repetition flashcards (SM-2 lite, localStorage) ────────────────────
function loadFlash() { try { return JSON.parse(localStorage.getItem("lp_flash") || "{}"); } catch (e) { return {}; } }
function saveFlash(s) { try { localStorage.setItem("lp_flash", JSON.stringify(s)); } catch (e) {} }
function Flashcards() {
  const { useState } = React;
  const [open, setOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [deckId, setDeckId] = useState("academic");
  const keyOf = (w) => deckId + "::" + w.w;

  function begin() {
    const words = (DECKS.find(d => d.id === deckId) || DECKS[0]).words;
    const st = loadFlash(); const now = Date.now();
    const due = words.filter(w => st[keyOf(w)] && st[keyOf(w)].due <= now);
    const fresh = words.filter(w => !st[keyOf(w)]);
    let q = [...due, ...fresh].slice(0, 20);
    if (!q.length) q = [...words].sort(() => Math.random() - 0.5).slice(0, 10); // all learned → quick refresh
    setQueue(q); setIdx(0); setRevealed(false); setReviewed(0); setOpen(true);
  }
  function rate(grade) { // 0 Again · 1 Hard · 2 Good · 3 Easy
    const w = queue[idx]; const st = loadFlash();
    const key = keyOf(w);
    const cur = st[key] || { ease: 2.5, ivl: 0 };
    let ease = cur.ease, ivl = cur.ivl;
    if (grade === 0) { ease = Math.max(1.3, ease - 0.2); ivl = 0; }
    else if (grade === 1) { ease = Math.max(1.3, ease - 0.15); ivl = Math.max(1, Math.round((ivl || 1) * 1.2)); }
    else if (grade === 2) { ivl = ivl === 0 ? 1 : Math.round(ivl * ease); }
    else { ease = ease + 0.15; ivl = Math.round((ivl === 0 ? 2 : ivl * ease) * 1.3); }
    st[key] = { ease, ivl, due: Date.now() + Math.max(0, ivl) * 86400000 };
    saveFlash(st);
    setReviewed(r => r + 1);
    let nq = queue;
    if (grade === 0) { nq = [...queue, w]; setQueue(nq); } // re-show "Again" cards at the end
    if (idx + 1 >= nq.length) { setIdx(nq.length); } // marks session complete
    else { setIdx(idx + 1); setRevealed(false); }
  }

  if (!open) {
    return (
      <div className="flash-launch-wrap">
        <div className="flash-decks">
          {DECKS.map(d => (
            <button key={d.id} className={"flash-deck-chip" + (d.id === deckId ? " active" : "")} onClick={() => setDeckId(d.id)}>{d.name}</button>
          ))}
        </div>
        <button className="flash-launch" onClick={begin}>🃏 Practise {(DECKS.find(d => d.id === deckId) || DECKS[0]).name} flashcards</button>
      </div>
    );
  }
  const finished = idx >= queue.length;
  if (finished) {
    return (
      <div className="flashcard-shell">
        <div className="flashcard-done">
          <div style={{ fontSize: 40 }}>✅</div>
          <h3 style={{ margin: "6px 0" }}>Session complete!</h3>
          <p className="muted" style={{ margin: 0 }}>You reviewed {reviewed} card{reviewed !== 1 ? "s" : ""}. Spaced repetition schedules each word for the best time to review.</p>
          <div className="row-gap-12" style={{ marginTop: 14, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={begin}>Study again</button>
            <button className="btn" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    );
  }
  const card = queue[idx];
  return (
    <div className="flashcard-shell">
      <div className="flashcard-top">
        <span>Card {idx + 1} of {queue.length}</span>
        <button className="flash-close" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className={"flashcard" + (revealed ? " is-flipped" : "")} onClick={() => !revealed && setRevealed(true)}>
        <div className="flash-word">{card.w} <span className="flash-pos">{card.pos}</span></div>
        {revealed
          ? <div className="flash-back"><div className="flash-def">{card.def}</div><div className="flash-ex">“{card.ex}”</div></div>
          : <div className="flash-tap">Tap to reveal definition</div>}
      </div>
      {revealed && (
        <div className="flash-rate">
          <button className="fr-btn again" onClick={() => rate(0)}>Again</button>
          <button className="fr-btn hard" onClick={() => rate(1)}>Hard</button>
          <button className="fr-btn good" onClick={() => rate(2)}>Good</button>
          <button className="fr-btn easy" onClick={() => rate(3)}>Easy</button>
        </div>
      )}
    </div>
  );
}

// ── Daily challenge — one quick question per day ──────────────────────────────
const CHALLENGES = [
  { q: "Choose the word closest in meaning to 'ubiquitous':", opts: ["rare", "found everywhere", "ancient", "hidden"], a: 1, exp: "Ubiquitous means present or found everywhere." },
  { q: "Which sentence is grammatically correct?", opts: ["She don't like coffee.", "She doesn't likes coffee.", "She doesn't like coffee.", "She not like coffee."], a: 2, exp: "Third-person singular uses doesn't + the base verb (like)." },
  { q: "Complete: 'The findings ___ the hypothesis.'", opts: ["substantiate", "substantiates", "substantiating", "substantiation"], a: 0, exp: "Plural subject 'findings' takes the base verb 'substantiate'." },
  { q: "Pick the best academic synonym for 'a lot of problems':", opts: ["many problems", "numerous challenges", "lots of issues", "tons of trouble"], a: 1, exp: "'Numerous challenges' is the most formal, academic phrasing." },
  { q: "Which is the correct collocation?", opts: ["make a research", "do a research", "conduct research", "perform a research"], a: 2, exp: "We 'conduct research' (uncountable, no article)." },
  { q: "Choose the word closest in meaning to 'mitigate':", opts: ["worsen", "ignore", "reduce/lessen", "delay"], a: 2, exp: "Mitigate means to make something less severe." },
  { q: "Which linking word shows contrast?", opts: ["Furthermore", "Therefore", "Nevertheless", "Likewise"], a: 2, exp: "'Nevertheless' signals contrast; the others add or show result." },
  { q: "Complete: 'Despite ___ hard, she failed the test.'", opts: ["study", "studying", "studied", "to study"], a: 1, exp: "After 'despite' use a noun or gerund (studying)." },
  { q: "Which word means 'possible to do'?", opts: ["feasible", "fallible", "fictional", "fragile"], a: 0, exp: "Feasible = capable of being done easily." },
  { q: "Pick the correctly punctuated sentence:", opts: ["Its a great idea.", "It's a great idea.", "Its' a great idea.", "Its a great, idea."], a: 1, exp: "'It's' = it is. 'Its' is possessive." },
  { q: "Choose the closest meaning of 'detrimental':", opts: ["beneficial", "harmful", "neutral", "essential"], a: 1, exp: "Detrimental means causing harm or damage." },
  { q: "Which is more formal: 'kids' →", opts: ["youngsters", "children", "tots", "little ones"], a: 1, exp: "'Children' is the neutral, formal choice in academic writing." },
  { q: "Complete: 'The data ___ a clear trend.'", opts: ["show", "shows", "showing", "is show"], a: 0, exp: "In academic English 'data' is treated as plural: data show." },
  { q: "Which word means 'widespread'?", opts: ["prevalent", "prevailing", "preventive", "prudent"], a: 0, exp: "Prevalent = widespread in a particular area or time." },
];
function DailyChallenge() {
  const { useState } = React;
  const day = Math.floor(Date.now() / 86400000);
  const c = CHALLENGES[day % CHALLENGES.length];
  const [pick, setPick] = useState(null);
  return (
    <div className="daily-challenge">
      <div className="dc-label">🎯 Daily challenge</div>
      <div className="dc-q">{c.q}</div>
      <div className="dc-opts">
        {c.opts.map((o, i) => {
          const chosen = pick === i;
          const state = pick == null ? "" : i === c.a ? " correct" : chosen ? " wrong" : "";
          return (
            <button key={i} className={"dc-opt" + state} disabled={pick != null} onClick={() => setPick(i)}>
              <span className="dc-letter">{["A", "B", "C", "D"][i]}</span>{o}
              {pick != null && i === c.a && <span className="dc-tick">✓</span>}
            </button>
          );
        })}
      </div>
      {pick != null && (
        <div className={"dc-result" + (pick === c.a ? " ok" : " no")}>
          {pick === c.a ? "Correct! " : "Not quite. "}{c.exp} <span className="dc-back">Come back tomorrow for a new one.</span>
        </div>
      )}
    </div>
  );
}

function LearningClub({ onNav, exams, embedded }) {
  const examIds = ["ielts","toefl","pte","celpip","duolingo","gre","gmat"];
  const [activeExam, setActiveExam] = useStateLC("ielts");
  const [activeTab, setActiveTab] = useStateLC("Writing");
  const [extras, setExtras] = useStateLC({});      // { writing: [...], speaking: [...] }

  // Lazy-load JSON samples whenever the active exam changes
  React.useEffect(() => {
    if (!window.LP_HUB) return;
    let cancelled = false;
    Promise.all([
      window.LP_HUB.loadSection(activeExam, "writing").catch(() => []),
      window.LP_HUB.loadSection(activeExam, "speaking").catch(() => []),
      window.LP_HUB.loadVocabulary(activeExam).catch(() => []),
      window.LP_HUB.loadStrategies(activeExam).catch(() => []),
    ]).then(([wJson, sJson, vJson, strJson]) => {
      if (cancelled) return;
      setExtras({
        writing: (wJson || []).map(s => normaliseHubSample(s, "writing")),
        speaking: (sJson || []).map(s => normaliseHubSample(s, "speaking")),
        vocabularyTopics: vJson || [],
        strategies: strJson || [],
      });
    });
    return () => { cancelled = true; };
  }, [activeExam]);

  // Update SEO meta per exam
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    const examNames = { ielts:"IELTS", toefl:"TOEFL iBT", pte:"PTE Academic", celpip:"CELPIP", duolingo:"Duolingo English Test", gre:"GRE", gmat:"GMAT Focus" };
    const n = examNames[activeExam] || activeExam.toUpperCase();
    window.LP_SEO.set({
      title: `${n} Writing & Speaking Samples — Free Learning Hub | LandingPrep`,
      description: `Free ${n} learning hub with model answers, speaking samples, vocabulary, common mistakes and study tips. Authored from scratch — all original content.`,
    });
  }, [activeExam]);

  const inCode = LC_CONTENT[activeExam] || LC_CONTENT.ielts;
  const content = {
    ...inCode,
    writing: window.LP_HUB ? window.LP_HUB.mergeSamples(inCode.writing, extras.writing) : inCode.writing,
    speaking: window.LP_HUB ? window.LP_HUB.mergeSamples(inCode.speaking, extras.speaking) : inCode.speaking,
    vocabularyTopics: extras.vocabularyTopics || [],
    strategies: extras.strategies || [],
  };
  const tabs = ["Writing", "Speaking", "Vocabulary", "Math/Verbal", "Tips & Mistakes"].filter(t => {
    if (t === "Math/Verbal") return ["gre","gmat"].includes(activeExam);
    if (t === "Speaking") return content.speaking && content.speaking.length > 0;
    return true;
  });

  const body = (
    <>
      <section className="lc-hero">
        <div className="shell">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Learning Club · Free</div>
          <h1 className="h1">Topics, model answers &amp; vocabulary</h1>
          <p className="body-lg muted" style={{ maxWidth: 620, marginTop: 16 }}>
            Full-length model answers at real exam word counts, speaking samples at real exam timing, and curated vocabulary with usage examples — for every exam.
          </p>
          <div className="lc-widgets">
            <div className="lc-widgets-col">
              <WordOfDay />
              <Flashcards />
            </div>
            <DailyChallenge />
          </div>
        </div>
      </section>

      {/* Exam selector */}
      <div style={{ background: "var(--tint)", borderBottom: "1px solid var(--line)" }}>
        <div className="shell">
          <div className="exam-selector-row">
            {examIds.map((id) => {
              const ex = exams.find(e => e.id === id);
              if (!ex) return null;
              return (
                <button
                  key={id}
                  className={"exam-sel-btn" + (id === activeExam ? " is-active" : "")}
                  onClick={() => { setActiveExam(id); setActiveTab("Writing"); }}
                >
                  <span className="esb-dot" style={{ background: id === activeExam ? "#fff" : ex.colour }} />
                  {ex.short || ex.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="lc-tabs-outer">
        <div className="shell" style={{ display: "flex" }}>
          {tabs.map((t) => (
            <button key={t} className={"lc-tab" + (t === activeTab ? " active" : "")} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="lc-body">
        <div className="shell">
          {activeTab === "Writing" && <WritingTopics content={content} examId={activeExam} />}
          {activeTab === "Speaking" && <SpeakingTopics content={content} examId={activeExam} />}
          {activeTab === "Vocabulary" && <VocabularySection content={content} />}
          {activeTab === "Math/Verbal" && <MathSection content={content} />}
          {activeTab === "Tips & Mistakes" && <TipsMistakes content={content} examId={activeExam} />}
        </div>
      </div>
    </>
  );
  if (embedded) return body;
  return (<><window.LP_TopBar current="learning" onNav={onNav} />{body}<window.LP_Footer /></>);
}

function topicTag(prompt) {
  const p = (prompt || "").toLowerCase();
  if (/\b(chart|graph|table|diagram|process|map|figure)\b/.test(p)) return { label: "Task 1 · Data", color: "#0e7490" };
  if (/to what extent|do you agree|discuss both|advantages and disadvantages|outweigh/.test(p)) return { label: "Opinion Essay", color: "#7c3aed" };
  if (/letter|email|write to/.test(p)) return { label: "Letter", color: "#b45309" };
  return { label: "Essay", color: "#4f46e5" };
}

function WritingTopics({ content, examId }) {
  const [openId, setOpenId] = useStateLC(null);
  const [query, setQuery] = useStateLC("");
  const topics = content.writing || [];
  const q = query.trim().toLowerCase();
  const filtered = q ? topics.filter(t => (t.prompt || "").toLowerCase().includes(q)) : topics;
  return (
    <div>
      <div className="lc-topics-head">
        <div className="eyebrow">Writing Topics &amp; Model Answers — {topics.length} topics</div>
        <input
          className="lc-search"
          type="search"
          placeholder="🔍 Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="lc-topic-list">
        {filtered.map((t, i) => (
          <TopicCard key={t.id} topic={t} index={i + 1} isOpen={openId === t.id} onToggle={() => setOpenId(openId === t.id ? null : t.id)} />
        ))}
        {!filtered.length && <div className="empty-state"><div className="es-icon">🔍</div><p>No topics match “{query}”.</p></div>}
      </div>
      <div className="note" style={{ marginTop: 16 }}>
        Model answers are written at Band 7 / equivalent proficiency level for illustrative purposes. Real exam answers should reflect your own ideas under timed conditions — clear organisation, relevant content, varied vocabulary and accurate grammar, not perfection.
      </div>
    </div>
  );
}

function SpeakingTopics({ content, examId }) {
  const [openId, setOpenId] = useStateLC(null);
  const topics = content.speaking || [];
  if (!topics.length) return <div className="empty-state"><div className="es-icon">🎤</div><p>Speaking content coming soon for this exam.</p></div>;
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Speaking Topics &amp; Sample Answers</div>
      {topics.map((t) => (
        <div key={t.id} className="topic-card" style={{ marginBottom: 16 }}>
          <div className="topic-card-head" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", cursor:"pointer", background: openId === t.id ? "var(--tint)" : undefined }}
            onClick={() => setOpenId(openId === t.id ? null : t.id)}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{t.part ? `Part ${t.part}` : "Speaking"}</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:17, letterSpacing:"-0.01em" }}>{t.prompt.slice(0,80)}{t.prompt.length > 80 ? "..." : ""}</div>
            </div>
            <span style={{ fontSize:22, color:"var(--ink-3)" }}>{openId === t.id ? "−" : "+"}</span>
          </div>
          {openId === t.id && (
            <div style={{ padding:"0 22px 22px" }}>
              <div className="writing-prompt" style={{ marginBottom: 16 }}>
                <strong>Full prompt</strong>
                {t.prompt}
              </div>
              {t.approach && <div className="topic-card" style={{ padding: "10px 14px", marginBottom: 12, fontSize: 13, color:"var(--ink-3)", fontStyle:"italic" }}>Approach: {t.approach}</div>}
              <div style={{ fontSize:12, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--ink-3)", marginBottom:8 }}>Sample Answer (Band 7 / equivalent)</div>
              <div className="sample-answer">{t.band7Answer || t.sampleAnswer}</div>
              {t.keyVocab && (
                <div style={{ marginTop: 14 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Key vocabulary</div>
                  <div className="vocab-pills">
                    {t.keyVocab.map((v,i) => <span key={i} className="vocab-pill">{v}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TopicCard({ topic, index, isOpen, onToggle }) {
  const tag = topicTag(topic.prompt);
  return (
    <div className={"topic-card" + (isOpen ? " is-open" : "")}>
      <div className="tc-head" onClick={onToggle}>
        {index != null && <span className="tc-index" style={{ background: tag.color + "18", color: tag.color }}>{String(index).padStart(2, "0")}</span>}
        <div className="tc-head-main">
          <span className="tc-tag" style={{ background: tag.color + "14", color: tag.color }}>{tag.label}</span>
          <div className="tc-title">{topic.prompt.slice(0, 110)}{topic.prompt.length > 110 ? "…" : ""}</div>
        </div>
        <span className="tc-toggle" aria-hidden>{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && (
        <div className="tc-body">
          <div className="tc-prompt">
            <strong style={{ display:"block", marginBottom:8, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--ink-3)" }}>Full prompt</strong>
            {topic.prompt}
          </div>
          {topic.approach && <div className="tc-approach">💡 Approach: {topic.approach}</div>}
          <div className="eyebrow" style={{ marginBottom: 8, marginTop: 4 }}>Model answer (Band 7 / equivalent)</div>
          <div className="sample-answer">{topic.band7Answer || topic.sampleAnswer}</div>
          {topic.vocab && topic.vocab.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Key vocabulary for this topic</div>
              <div className="vocab-pills">
                {topic.vocab.map((v,i) => <span key={i} className="vocab-pill">{v}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VocabularySection({ content }) {
  const topics = content.vocabularyTopics || [];
  const flatVocab = content.vocabulary || [];
  const [openTopic, setOpenTopic] = useStateLC(topics[0]?.topic || null);
  const [search, setSearch] = useStateLC("");

  // Topic-grouped vocab (v4 JSON shape: { topic, items: [{ word, meaning, example, usageNote }] })
  if (topics.length) {
    const wordCount = topics.reduce((s, t) => s + (t.items?.length || 0), 0);
    const q = search.trim().toLowerCase();
    const filteredTopics = q
      ? topics.map(t => ({
          ...t,
          items: (t.items || []).filter(it => (it.word || "").toLowerCase().includes(q) || (it.meaning || "").toLowerCase().includes(q))
        })).filter(t => t.items.length)
      : topics;
    const activeTopic = q
      ? filteredTopics[0]
      : (filteredTopics.find(t => t.topic === openTopic) || filteredTopics[0]);
    return (
      <div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Vocabulary — {topics.length} topics · {wordCount} words
        </div>
        <input
          type="text"
          placeholder="🔍 Search by word or meaning..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 480, height: 40, padding: "0 14px", marginBottom: 18,
                   border: "1.5px solid var(--line)", borderRadius: 999, fontSize: 14, background: "var(--surface)" }}
        />
        <div className="vocab-layout" style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)" }}>
          <div className="vocab-topic-rail">
            {filteredTopics.map(t => (
              <button
                key={t.topic}
                className={"vocab-topic-pill" + (activeTopic && activeTopic.topic === t.topic ? " active" : "")}
                onClick={() => { setOpenTopic(t.topic); setSearch(""); }}
              >
                {t.topic} <span className="vocab-topic-count">{t.items.length}</span>
              </button>
            ))}
          </div>
          <div className="vocab-items">
            {activeTopic ? (
              <>
                <h3 style={{ margin: "0 0 14px", fontFamily: "var(--serif)", fontSize: 22, letterSpacing: "-0.01em", textTransform: "capitalize" }}>
                  {activeTopic.topic}
                </h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {(activeTopic.items || []).map((v, i) => (
                    <div key={i} className="q-card" style={{ padding: "16px 20px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily:"var(--serif)", fontSize:19, letterSpacing:"-0.01em" }}>{v.word}</div>
                          <div style={{ fontSize:14, color:"var(--ink-3)", marginTop:3 }}><em>{v.meaning}</em></div>
                        </div>
                        {v.usageNote && (
                          <div style={{ fontSize:11, color:"var(--ink-3)", background:"var(--tint)", padding:"4px 10px", borderRadius:999, whiteSpace:"nowrap" }}>
                            {v.usageNote}
                          </div>
                        )}
                      </div>
                      {v.example && (
                        <div style={{ marginTop:10, fontSize:14, color:"var(--ink-2)", lineHeight:1.6, borderLeft:"3px solid var(--line-2)", paddingLeft:12 }}>
                          "{v.example}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state"><p>No matches.</p></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: flat vocab list (legacy in-code shape)
  if (!flatVocab.length) return <div className="empty-state"><div className="es-icon">📚</div><p>Vocabulary section coming soon.</p></div>;
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Academic Vocabulary</div>
      <div style={{ display:"grid", gap:14 }}>
        {flatVocab.map((v, i) => (
          <div key={i} className="q-card" style={{ padding:"18px 22px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
              <div>
                <div style={{ fontFamily:"var(--serif)", fontSize:20, letterSpacing:"-0.01em" }}>{v.word}</div>
                <div style={{ fontSize:14, color:"var(--ink-3)", marginTop:4 }}><em>{v.meaning}</em></div>
              </div>
              {Array.isArray(v.synonyms) && v.synonyms.length > 0 && (
                <div className="vocab-pills">
                  {v.synonyms.map((s,j) => <span key={j} className="vocab-pill">{s}</span>)}
                </div>
              )}
            </div>
            {v.example && (
              <div style={{ marginTop:12, fontSize:14, color:"var(--ink-2)", lineHeight:1.6, borderLeft:"3px solid var(--line-2)", paddingLeft:12 }}>
                "{v.example}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MathSection({ content }) {
  const [openIdx, setOpenIdx] = useStateLC(null);
  const topics = content.math || [];
  if (!topics.length) return <div className="empty-state"><div className="es-icon">🔢</div><p>Math content available for GRE and GMAT.</p></div>;
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Quantitative / Math Concepts</div>
      {topics.map((t, i) => (
        <div key={i} className="topic-card" style={{ marginBottom: 14 }}>
          <div className="tc-head" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <div className="tc-title">{t.topic}</div>
            <span className="tc-toggle">{openIdx === i ? "−" : "+"}</span>
          </div>
          {openIdx === i && (
            <div className="tc-body">
              <div style={{ fontSize:15, color:"var(--ink-2)", lineHeight:1.7, marginBottom:16, whiteSpace:"pre-wrap" }}>{t.concept}</div>
              <div style={{ marginBottom:14 }}>
                <div className="eyebrow" style={{ marginBottom:8 }}>Key formulas</div>
                {t.formulas.map((f,j) => (
                  <div key={j} style={{ fontFamily:"var(--mono)", fontSize:13, background:"var(--tint)", padding:"8px 12px", borderRadius:"var(--r-sm)", marginBottom:6, border:"1px solid var(--line)" }}>{f}</div>
                ))}
              </div>
              <div style={{ marginBottom:12 }}>
                <div className="eyebrow" style={{ marginBottom:8 }}>Example question</div>
                <div className="writing-prompt">{t.example}</div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div className="eyebrow" style={{ marginBottom:8 }}>Step-by-step solution</div>
                <div className="sample-answer">{t.solution}</div>
              </div>
              {t.trap && (
                <div className="note">⚠ Common trap: {t.trap}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TipsMistakes({ content, examId }) {
  const tips = content.tips || [];
  const mistakes = content.mistakes || LC_CONTENT[examId]?.mistakes || [];
  return (
    <div>
      {tips.length > 0 && (
        <div className="guide-card" style={{ marginBottom: 20 }}>
          <h3 className="h2">Last-minute tips</h3>
          <ul style={{ paddingLeft:18, margin:"12px 0 0", color:"var(--ink-2)", lineHeight:1.8 }}>
            {tips.map((t,i) => <li key={i} style={{ marginBottom:8 }}>{t}</li>)}
          </ul>
        </div>
      )}
      {mistakes.length > 0 && (
        <div className="guide-card">
          <h3 className="h2">Common mistakes</h3>
          <ul className="cm-list" style={{ marginTop: 12 }}>
            {mistakes.map((m,i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
      {!tips.length && !mistakes.length && (
        <div className="empty-state"><div className="es-icon">💡</div><p>Tips and mistakes content coming soon.</p></div>
      )}
    </div>
  );
}

window.LP_LearningClub = LearningClub;
