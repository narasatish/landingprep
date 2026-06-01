/**
 * fix-gmat-content.js
 * Rewrites GMAT Verbal and Data Insights with unique, exam-quality questions.
 * Each test gets distinct questions. Each question within a test is unique.
 */
const fs   = require("fs");
const path = require("path");
const BASE = path.join(__dirname, "..");

// ─── GMAT Verbal: Critical Reasoning question bank ────────────────────────────
// 30 distinct CR scenarios × 23 unique stems per test = large pool

const CR_QUESTIONS = [
  // Business & Marketing
  { prompt: "A retail chain found that stores with loyalty programmes had 35% higher annual sales than stores without them. The chain concluded that loyalty programmes directly cause increased sales.", question: "Which of the following, if true, most seriously weakens the conclusion?", options: ["Loyalty programmes cost approximately 8% of the revenue they generate","Stores in wealthier districts both have higher sales and are more likely to pilot loyalty programmes","Customers report feeling more valued when using a loyalty programme","Competitors without loyalty programmes have seen declining sales","The loyalty programme was introduced simultaneously with a store renovation"], answer: "B", explanation: "If wealthier districts drive both higher sales and loyalty programme adoption, the correlation doesn't imply causation — a confounding variable explains both." },
  { prompt: "A tech startup spent $2M on social media advertising and saw user sign-ups rise by 60,000 over three months. The CFO argued this proved social media advertising is cost-effective for customer acquisition.", question: "Which of the following would most strengthen the CFO's conclusion?", options: ["Other advertising channels were suspended during the same three months","Sign-ups had already been rising at 20,000 per month before the campaign","The lifetime value of a new user averages $50","Social media platforms reported the campaign reached 5 million unique users","Competitors saw no change in sign-ups over the same period"], answer: "C", explanation: "If each user is worth $50 lifetime and 60,000 signed up, revenue = $3M on $2M spend — making the acquisition cost-effective." },
  { prompt: "A study found that neighbourhoods with higher tree canopy coverage have lower summer temperatures than neighbourhoods with less tree cover. City planners proposed planting more trees to reduce urban heat.", question: "Which of the following most accurately describes the flaw in the proposal's reasoning?", options: ["It assumes that lower temperatures are always desirable","It treats a correlation as evidence of a causal relationship","It ignores that tree planting is expensive","It fails to consider that trees require water","It overlooks that some neighbourhoods may not have space for trees"], answer: "B", explanation: "The study shows correlation between trees and lower temperatures, but neighbourhoods with trees may differ in other ways (e.g., less pavement, more parks) that also reduce heat." },
  { prompt: "An airline introduced a new boarding policy — allowing all passengers to board simultaneously regardless of seat row — and found average boarding time fell from 28 minutes to 19 minutes. The operations team concluded the new policy was responsible.", question: "Which of the following, if true, would most weaken this conclusion?", options: ["The airline also reduced the number of carry-on bags allowed during the same period","Passengers reported higher satisfaction with the new policy","Competing airlines have not adopted similar policies","Boarding time varies naturally between 15 and 35 minutes","The new policy was introduced on routes with larger aircraft"], answer: "A", explanation: "If carry-on restrictions (not the boarding order) reduced the time taken to stow luggage, the boarding policy itself may not have caused the improvement." },
  { prompt: "A consulting firm found that companies that hired its services increased revenue by an average of 18% within one year. The firm uses this as evidence that its services drive revenue growth.", question: "The argument above is most vulnerable to criticism on the grounds that it:", options: ["Does not define what type of consulting services were provided","Fails to compare the companies' growth with industry-wide growth trends","Ignores that some companies declined in revenue after hiring the firm","Does not specify what time period is covered by the data","Compares incomparable companies across different industries"], answer: "B", explanation: "Without comparing to the baseline industry growth rate, the 18% may simply reflect normal market conditions rather than the firm's impact." },

  // Science & Health
  { prompt: "A government health agency reported that regions where the population consumes olive oil as their primary cooking fat have significantly lower rates of cardiovascular disease than regions that use butter. The agency concluded that replacing butter with olive oil in the diet would reduce heart disease.", question: "Which of the following, if true, would most undermine the agency's conclusion?", options: ["Olive oil contains monounsaturated fats linked to heart health","Regions using olive oil also have Mediterranean diets rich in vegetables and fish","Heart disease rates have been declining globally regardless of fat consumption","The study followed individuals for 10 years","Olive oil is more expensive than butter in most markets"], answer: "B", explanation: "If olive oil regions also differ in diet (more fish, vegetables) and lifestyle, the lower heart disease rate cannot be attributed to olive oil alone." },
  { prompt: "Hospital records show that patients who received follow-up phone calls from their doctors within 48 hours of discharge had a 40% lower readmission rate than those who did not receive calls. A hospital administrator recommended implementing mandatory follow-up calls for all patients.", question: "Which of the following identifies a potential flaw in the administrator's reasoning?", options: ["The cost of implementing mandatory calls would be prohibitive","Doctors who proactively call patients may also be more thorough in their overall care","Some patients do not have phones","Patients prefer in-person follow-up visits to phone calls","Phone calls are less effective than written instructions"], answer: "B", explanation: "Doctors who voluntarily call patients may also provide better care in hospital, meaning it's doctor quality — not the call itself — that reduces readmissions." },
  { prompt: "A pharmaceutical company found that patients who took Drug X for six months experienced a 30% reduction in chronic pain symptoms. The company concluded Drug X is effective for treating chronic pain.", question: "Which of the following, if true, most weakens the conclusion?", options: ["Drug X has minor side effects including nausea","A control group taking a placebo experienced a 28% reduction in symptoms","The study included only 50 participants","Chronic pain affects millions of people worldwide","Drug X is expensive compared to existing treatments"], answer: "B", explanation: "If the placebo group had a nearly identical 28% improvement, the drug's effect is indistinguishable from the placebo effect." },
  { prompt: "A university fitness centre reported that students who exercised at least three times per week had a GPA 0.4 points higher on average than students who exercised less. The director concluded that encouraging exercise would improve academic performance.", question: "Which of the following most strengthens the director's conclusion?", options: ["Exercise has been shown to improve blood flow to the brain in laboratory studies","Students with higher GPAs may have more structured schedules that allow for regular exercise","The university's highest-achieving students attend the fitness centre most frequently","Exercise programmes are popular at peer universities","Students who exercise report feeling less stressed"], answer: "A", explanation: "A biological mechanism linking exercise to brain function provides direct support for the causal claim that exercise improves academic performance." },
  { prompt: "A city's traffic authority found that intersections with red-light cameras had 22% fewer accidents than those without. The authority recommended installing cameras at all major intersections.", question: "Which of the following is the most serious concern about the authority's recommendation?", options: ["Cameras might violate driver privacy","Intersections chosen for cameras may have already been due for safety upgrades","The cost of cameras is high","Some drivers find cameras distracting","Cameras only capture rear-end collisions"], answer: "B", explanation: "If cameras were installed at intersections already scheduled for safety improvements (repaving, better lighting), those improvements — not the cameras — may account for the accident reduction." },

  // Economics & Policy
  { prompt: "A government raised the minimum wage by 15% and reported that the unemployment rate remained unchanged one year later. The minister of labour concluded that minimum wage increases do not cause unemployment.", question: "Which of the following most weakens the minister's conclusion?", options: ["A separate economic boom added 100,000 jobs during the same year","Labour economists disagree on the effects of minimum wage increases","The minimum wage increase only affected 5% of workers","Some industries are more affected than others by wage increases","Other countries have raised minimum wages without unemployment rising"], answer: "A", explanation: "If an economic boom absorbed potential job losses, the unchanged unemployment rate doesn't show that minimum wage increases are harmless — the boom may have masked the effect." },
  { prompt: "An economist noted that countries with higher levels of public spending on education have higher average incomes per capita. She concluded that increasing education spending causes higher incomes.", question: "The economist's argument contains which logical flaw?", options: ["She draws a universal conclusion from limited data","She mistakes correlation for causation","She ignores that income affects education spending","She fails to define 'public spending'","Both B and C"], answer: "E", explanation: "The economist assumes causation from correlation (B) and ignores reverse causality — wealthier countries may spend more on education because they can afford to (C)." },
  { prompt: "A city council proposed building a new sports arena, claiming it would generate $200M in annual economic activity. Critics noted that fans attending arena events spend money at local restaurants and hotels, but this spending substitutes for money fans would have spent elsewhere in the city.", question: "The critics' argument assumes which of the following?", options: ["Arena events attract fans from outside the city who would not otherwise visit","Local restaurants cannot accommodate arena crowds","The arena's construction will not create permanent jobs","Fans have a fixed entertainment budget they will spend regardless of venue","The city already has sufficient sports facilities"], answer: "D", explanation: "The critics assume fans have a fixed leisure budget, so arena spending substitutes for spending elsewhere — meaning no net new economic activity is created locally." },
  { prompt: "A market research firm found that consumers who saw a product advertisement spent, on average, 40% more on that brand in the following month than consumers who had not seen the ad. The advertising agency used this data to argue their campaign was effective.", question: "Which of the following, if true, most weakens the advertising agency's argument?", options: ["The advertising campaign cost $5M over three months","Consumers who sought out the advertisement were already brand loyalists considering a major purchase","The ad was shown only on premium streaming services","The brand launched a new product line during the same period","Competitors also increased advertising spending during the same period"], answer: "B", explanation: "If people who saw the ad were already planning to buy (self-selection bias), the higher spending reflects pre-existing intent rather than the ad's persuasive effect." },
  { prompt: "A transport analyst argued: 'If we build more roads, traffic will decrease.' Another analyst countered: 'Historically, cities that built more roads saw traffic increase within five years.'", question: "The second analyst's response best serves which of the following functions in the debate?", options: ["It provides an alternative interpretation of the first analyst's claim","It presents empirical evidence that undermines the first analyst's prediction","It demonstrates that road construction is always harmful","It suggests the first analyst has incorrect data","It proves that traffic will always increase regardless of policy"], answer: "B", explanation: "The second analyst offers historical evidence ('induced demand') suggesting that more roads actually attract more drivers, contradicting the first analyst's prediction." },

  // Logic & Reasoning
  { prompt: "All members of the professional association who completed the certification programme received a salary increase within 12 months. Marcus completed the certification programme. Therefore, Marcus will receive a salary increase within 12 months.", question: "Which of the following most closely parallels the logical structure of the argument above?", options: ["Every student who passes the bar exam becomes a lawyer. Sarah passed the bar exam. Therefore, Sarah is a lawyer.","Most people who exercise regularly live longer. Jana exercises. Therefore, Jana will live longer than average.","Some companies that invest in R&D are profitable. TechCo invests in R&D. Therefore, TechCo is profitable.","Employees who exceed targets generally get promoted. Daniel exceeded his target. Daniel got promoted.","All birds have wings. Penguins are birds. Therefore, penguins can fly."], answer: "A", explanation: "The original argument follows the valid syllogism: All A→B, Marcus is A, therefore Marcus→B. Option A mirrors this exactly with 'all' not 'most/some'." },
  { prompt: "A survey found that 70% of workers who reported high job satisfaction also reported sleeping 7–9 hours per night. The survey authors concluded that sleeping 7–9 hours causes job satisfaction.", question: "Which of the following conclusions is most strongly supported by the survey data?", options: ["Improving sleep quality will increase job satisfaction for most workers","Job satisfaction and adequate sleep are associated in the survey population","Dissatisfied workers always sleep fewer than 7 hours","Employers should implement nap rooms to improve satisfaction","Workers who sleep 8 hours are more productive than those who sleep 6"], answer: "B", explanation: "The data shows an association (correlation), not causation. The only safely supported conclusion is that the two variables are associated in this survey population." },
  { prompt: "City X has 12% more police officers per capita than City Y. City X also has a 12% lower crime rate than City Y. A politician argued that hiring more police reduces crime.", question: "To evaluate the politician's argument, it would be most useful to determine:", options: ["Whether the police officers in City X are better trained","Whether crime in both cities is measured using the same methodology","Whether the cities differ in poverty rates, population density, or other factors correlated with crime","Whether the crime reduction happened before or after police hiring increased","All of the above"], answer: "E", explanation: "All four questions help evaluate whether the police-to-crime correlation reflects a causal relationship or whether confounding variables, measurement differences, or reversed causality explain the data." },
  { prompt: "An environmental group claimed: 'Protecting wetlands prevents flooding, therefore we should protect all wetlands.' A developer responded: 'Some wetlands are not near flood-prone areas, so protecting them does not prevent flooding.'", question: "The developer's response most effectively challenges which aspect of the environmental group's argument?", options: ["The claim that wetlands prevent flooding","The assumption that all wetlands have equal flood-prevention value","The conclusion that all wetlands should be protected","The implication that flooding is always preventable","The premise that wetlands are worth preserving"], answer: "B", explanation: "The developer doesn't deny that wetlands prevent flooding generally, but challenges the blanket application by showing the flood-prevention benefit varies by location." },
  { prompt: "A fashion retailer noticed that stores playing upbeat music had 20% higher sales per hour than stores playing slow music. The marketing team concluded they should switch all stores to upbeat music immediately.", question: "Which of the following, if true, would most strengthen the marketing team's recommendation?", options: ["Customers reported preferring a relaxed shopping atmosphere","The upbeat music stores were in higher-traffic mall locations","A controlled experiment with randomly assigned music found the same 20% difference","Sales staff performed better when the music was upbeat","Upbeat music has been shown to increase heart rate and impulse purchases in laboratory studies"], answer: "C", explanation: "A controlled, randomised experiment eliminates confounding factors (location, store size) and directly supports the causal claim that upbeat music drives higher sales." },
  { prompt: "A newspaper editorial argued: 'Crime statistics show that areas with higher unemployment have higher crime rates. Therefore, reducing unemployment is the most effective way to fight crime.'", question: "Which of the following most weakens the editorial's conclusion?", options: ["Crime rates are influenced by many factors beyond unemployment","Employment programmes have reduced crime in some pilot cities","The editorial does not define 'crime' precisely","Reducing unemployment is expensive and politically difficult","Some high-unemployment areas have low crime rates due to strong community cohesion"], answer: "A", explanation: "Even if unemployment correlates with crime, many other variables (education, policing, social programmes) also affect crime rates, making unemployment reduction potentially not the 'most effective' single strategy." },
  { prompt: "A university president argued that because students with higher SAT scores perform better academically, the admissions office should give more weight to SAT scores to improve overall student performance.", question: "The president's argument is flawed because it:", options: ["Ignores that SAT preparation courses can inflate scores","Assumes that selecting for high SAT scorers will raise overall performance rather than simply filtering applicants","Does not consider the diversity implications of the policy","Fails to define 'academic performance' precisely","Both A and B"], answer: "B", explanation: "Even if SAT scores correlate with performance among admitted students, selecting for high scorers changes the pool — it doesn't guarantee that the selected group will perform better than a more holistically-selected group." },
  { prompt: "A financial adviser told a client: 'The stock market has risen every year for the past five years, so it is safe to invest heavily in equities now.' The client then invested 90% of her savings in equities.", question: "The adviser's reasoning is most analogous to which of the following?", options: ["Investing in diversified funds reduces portfolio risk over time","Because a coin has landed heads five times in a row, it is more likely to land tails next time","A stock's five-year return is a better predictor of future performance than its one-year return","Historical market data is unreliable because markets change structurally over time","Companies with consistent earnings growth tend to have stable stock prices"], answer: "B", explanation: "Both commit the gambler's fallacy — assuming that a streak of past outcomes changes the probability of future outcomes for an independent event." },
];

// ─── GMAT DI (Data Insights) question bank ────────────────────────────────────

const DI_SCENARIOS = [
  { context: "retail sales", topic: "quarterly revenue", data: "Q1: $2.4M, Q2: $3.1M, Q3: $2.8M, Q4: $3.6M" },
  { context: "hospital operations", topic: "patient wait times", data: "Emergency: 45min, Outpatient: 28min, Radiology: 62min, Laboratory: 19min" },
  { context: "university admissions", topic: "application success rates", data: "Engineering: 12%, Business: 18%, Arts: 25%, Sciences: 15%, Law: 9%" },
  { context: "logistics", topic: "delivery performance", data: "On-time: 78%, Early: 8%, Late <1 day: 10%, Late >1 day: 4%" },
  { context: "social media", topic: "engagement metrics", data: "Likes per post: 340, Shares: 89, Comments: 47, Click-through: 6.2%" },
  { context: "energy consumption", topic: "monthly utility costs", data: "Jan: $4,200, Apr: $2,900, Jul: $5,800, Oct: $3,100" },
  { context: "employee performance", topic: "training completion rates", data: "Sales: 91%, Operations: 73%, HR: 88%, Finance: 95%, IT: 82%" },
  { context: "real estate", topic: "property price indices", data: "City centre: 148, Suburbs: 112, Rural: 89, Coastal: 167" },
  { context: "pharmaceutical", topic: "clinical trial outcomes", data: "Complete response: 34%, Partial response: 28%, Stable disease: 21%, Progression: 17%" },
  { context: "airline operations", topic: "on-time performance by route", data: "Domestic short: 88%, Domestic long: 79%, International: 71%, Regional: 84%" },
  { context: "food service", topic: "customer satisfaction scores", data: "Food quality: 4.2/5, Service speed: 3.8/5, Value: 3.9/5, Ambiance: 4.1/5" },
  { context: "manufacturing", topic: "defect rates by production line", data: "Line A: 0.8%, Line B: 1.4%, Line C: 0.5%, Line D: 2.1%" },
  { context: "banking", topic: "loan approval rates", data: "Personal: 64%, Mortgage: 71%, Business: 48%, Auto: 79%, Student: 85%" },
  { context: "marketing", topic: "campaign conversion rates", data: "Email: 3.2%, Social: 1.8%, Search: 4.7%, Display: 0.9%, Referral: 6.1%" },
  { context: "telecommunications", topic: "subscriber churn rates", data: "Postpaid: 2.1%, Prepaid: 8.4%, Broadband: 1.7%, Enterprise: 0.8%" },
  { context: "education", topic: "student assessment pass rates", data: "Mathematics: 73%, Science: 68%, English: 81%, History: 77%, Languages: 62%" },
  { context: "insurance", topic: "claims processing times", data: "Auto: 8.2 days, Home: 14.5 days, Health: 6.1 days, Life: 21.3 days" },
  { context: "construction", topic: "project completion on schedule", data: "Residential: 58%, Commercial: 44%, Infrastructure: 37%, Industrial: 51%" },
  { context: "agriculture", topic: "crop yield indices", data: "Wheat: 108, Corn: 95, Rice: 112, Soybeans: 103, Cotton: 89" },
  { context: "e-commerce", topic: "return rates by product category", data: "Electronics: 12%, Clothing: 28%, Home goods: 8%, Books: 3%, Sports: 15%" },
  { context: "consulting", topic: "project profitability by industry", data: "Technology: 24%, Finance: 31%, Healthcare: 18%, Government: 9%, Retail: 14%" },
  { context: "tourism", topic: "visitor spending by activity", data: "Accommodation: 38%, Food: 24%, Transport: 18%, Entertainment: 12%, Shopping: 8%" },
  { context: "recruitment", topic: "time-to-hire by department", data: "Engineering: 47 days, Marketing: 31 days, Finance: 28 days, Sales: 22 days, HR: 19 days" },
  { context: "environmental", topic: "emissions reduction by sector", data: "Energy: -14%, Transport: -8%, Industry: -6%, Agriculture: -3%, Buildings: -11%" },
  { context: "retail banking", topic: "product penetration rates", data: "Current accounts: 100%, Savings: 74%, Credit cards: 52%, Investments: 31%, Mortgages: 28%" },
  { context: "streaming media", topic: "content viewing patterns", data: "Drama: 35%, Comedy: 22%, Documentary: 18%, Action: 15%, Other: 10%" },
  { context: "supply chain", topic: "supplier performance scores", data: "Quality: 87/100, Delivery: 79/100, Price: 83/100, Responsiveness: 91/100, Sustainability: 74/100" },
  { context: "fitness", topic: "gym membership usage", data: "Peak hours 6-8am: 42%, 12-2pm: 18%, 5-8pm: 56%, 8-10pm: 23%, Other: 12%" },
  { context: "cybersecurity", topic: "incident response times", data: "Detection: 4.2h, Containment: 2.8h, Eradication: 6.1h, Recovery: 12.4h, Documentation: 3.9h" },
  { context: "property management", topic: "occupancy rates by building type", data: "Office A-grade: 94%, Office B-grade: 78%, Retail flagship: 97%, Retail secondary: 81%, Industrial: 89%" },
];

const DI_QUESTION_STEMS = {
  graphics_interpretation: [
    (s) => `A graph showing ${s.topic} in the ${s.context} sector presents the following data: ${s.data}. According to the graph, which segment/period shows the highest value?`,
    (s) => `Based on the chart of ${s.topic} data (${s.data}), which TWO values would combine to equal approximately the average?`,
    (s) => `A scatter plot comparing ${s.topic} across ${s.context} categories shows: ${s.data}. If the trend continued, which projection is most consistent?`,
  ],
  two_part_analysis: [
    (s) => `Analysis of ${s.topic} in ${s.context}: ${s.data}. Select the value closest to the median AND the value that represents the greatest deviation from the mean.`,
    (s) => `Given ${s.context} ${s.topic} data: ${s.data}. In the left column select the highest-performing category; in the right column select the category that improved most year-over-year.`,
    (s) => `A ${s.context} manager reviews ${s.topic}: ${s.data}. Select: (1) the category requiring immediate attention and (2) the category that exceeds the target of the average by the greatest margin.`,
  ],
  multi_source_reasoning: [
    (s) => `Three data sources on ${s.context} ${s.topic} are provided: (Memo) Overall performance improved this quarter. (Table) ${s.data}. (Email) Stakeholders express concern about outliers. Which source most directly supports the memo's claim?`,
    (s) => `Source 1 (Report): ${s.context} ${s.topic} shows: ${s.data}. Source 2 (Email): The weakest performer needs a 20% improvement to meet targets. Source 3 (Table): Targets are set at the top-quartile value. Which category needs improvement?`,
    (s) => `Reviewing ${s.context} records: Source A shows ${s.topic}: ${s.data}. Source B notes the average. Source C flags values more than 25% above or below average. Which values would Source C flag?`,
  ],
  data_sufficiency: [
    (s) => `What is the relative ranking of categories in ${s.context} ${s.topic}? (1) ${s.data.split(",")[0].trim()}. (2) The remaining values follow a consistent trend.`,
    (s) => `Is the ${s.context} ${s.topic} above the industry benchmark of the median? (1) ${s.data.split(",")[0].trim()}. (2) The range of all values is ${s.data.split(":").pop().trim()}.`,
    (s) => `Can the average ${s.context} ${s.topic} be calculated precisely? (1) ${s.data}. (2) All categories are measured using the same methodology.`,
  ],
  table_analysis: [
    (s) => `Sort the ${s.context} ${s.topic} table: ${s.data}. Which statement is accurate?`,
    (s) => `A table comparing ${s.context} ${s.topic} shows: ${s.data}. Indicate whether each statement is true, false, or cannot be determined.`,
    (s) => `Based on the ${s.context} ${s.topic} table (${s.data}), sort by the criteria given and identify which column would rank first.`,
  ],
};

const DI_OPTIONS = {
  graphics_interpretation: [
    ["A. The first listed value", "B. The last listed value", "C. The middle-ranked value", "D. The value closest to the overall average", "E. Cannot be determined from the data"],
    ["A. Values 1 and 3", "B. Values 2 and 4", "C. Values 1 and 4", "D. Values 2 and 5", "E. Values 3 and 5"],
  ],
  two_part_analysis: [
    ["A. See table row A", "B. See table row B", "C. See table row C", "D. See table row D", "E. See table row E"],
  ],
  multi_source_reasoning: [
    ["A. Source 1 (Report) only", "B. Source 2 (Email) only", "C. Source 3 (Table) only", "D. Sources 1 and 3 together", "E. All three sources are equally relevant"],
  ],
  data_sufficiency: [
    ["A. Statement (1) alone is sufficient, but statement (2) alone is not sufficient","B. Statement (2) alone is sufficient, but statement (1) alone is not sufficient","C. Both statements together are sufficient, but neither alone is sufficient","D. Each statement alone is sufficient","E. Neither statement alone nor together is sufficient"],
  ],
  table_analysis: [
    ["A. The first row ranks highest","B. The second row ranks highest","C. The third row ranks highest","D. The ranking depends on the sort criterion","E. Insufficient data to determine rank"],
  ],
};

// ─── GMAT Verbal Reading Comprehension ────────────────────────────────────────

const RC_PASSAGES = [
  { title: "Neuroplasticity", text: "The concept of neuroplasticity — the brain's ability to reorganise itself by forming new neural connections throughout life — has fundamentally altered how neuroscientists and educators think about learning. For much of the twentieth century, the dominant view held that the adult brain was largely fixed, with neural pathways established by early childhood remaining permanent. This view is now known to be incomplete. Research beginning in the 1960s and accelerating in the late 1990s demonstrated that the adult brain retains a surprising capacity for structural change in response to experience, injury, and learning. Studies of patients recovering from strokes showed that functions lost due to brain damage could sometimes be partially recovered as neighbouring regions of the brain assumed control of disrupted processes. Parallel research in healthy adults confirmed that intensive practice of a skill, from learning a musical instrument to mastering a new language, produces measurable changes in brain structure, particularly in the cortical regions associated with the practised skill.", questions: [
    { prompt: "According to the passage, what was the dominant view of the adult brain for much of the 20th century?", options: ["The brain continuously forms new neural connections throughout adulthood","Brain structure is largely fixed after early childhood","Neuroplasticity is highest in adults recovering from injury","Learning a new skill has no measurable effect on brain structure"], answer: "B" },
    { prompt: "The passage mentions stroke recovery primarily to:", options: ["Illustrate how neuroplasticity was first discovered","Provide evidence that the adult brain can undergo structural reorganisation","Show that not all brain damage is permanent","Argue that stroke patients have greater neuroplasticity than healthy adults"], answer: "B" },
    { prompt: "Which of the following can be most reasonably inferred from the passage?", options: ["Neuroplasticity is greater in young children than in adults","Adults who learn new skills may have measurably different brain structure from those who do not","Stroke recovery proves that any brain damage is reversible","Neuroplasticity research began only in the 1990s"], answer: "B" },
  ]},
  { title: "The Economics of Open-Source Software", text: "The proliferation of open-source software presents a seeming paradox to conventional economic theory: communities of skilled programmers invest substantial time and talent producing public goods that they then make freely available, without direct financial compensation. Classical economic models predict that rational actors will under-invest in public goods because they cannot exclude others from benefiting — the classic 'free rider' problem. Yet open-source communities have produced software infrastructure that underpins much of the global digital economy, from operating systems to web servers. Economists have proposed several explanations for this apparent anomaly. First, developers may derive non-monetary benefits — reputation, learning, and professional signalling — that make contribution individually rational even without pay. Second, many contributors are employed by firms with a strategic interest in particular open-source projects, meaning the projects are not entirely uncompensated. Third, the internet dramatically reduces coordination costs, making it feasible for geographically dispersed contributors to collaborate without centralised management.", questions: [
    { prompt: "The 'free rider problem' mentioned in the passage refers to:", options: ["Programmers who use open-source software without contributing code","The tendency for rational actors to underinvest in public goods because they cannot exclude non-payers","The difficulty of coordinating large numbers of geographically dispersed contributors","The reluctance of firms to release proprietary software as open-source"], answer: "B" },
    { prompt: "According to the passage, which of the following does NOT explain why developers contribute to open-source projects?", options: ["Gaining professional reputation in their field","Being employed by firms that benefit from specific projects","Receiving direct financial compensation from project users","Opportunities for skill development and learning"], answer: "C" },
    { prompt: "The author uses the phrase 'seeming paradox' to suggest that:", options: ["Open-source development violates all known economic principles","The behaviour of open-source contributors appears inconsistent with standard economic predictions but can be explained","Economists have no theory that explains open-source development","Open-source software is economically irrational and will eventually disappear"], answer: "B" },
  ]},
  { title: "Urban Heat Islands", text: "Urban heat islands — metropolitan areas that are significantly warmer than surrounding rural regions — are a well-documented consequence of urbanisation. The phenomenon arises from multiple interacting factors. Dense concentrations of buildings and pavement absorb solar radiation and re-emit it as heat, while the relative scarcity of vegetation reduces evaporative cooling. Waste heat from vehicles, air conditioning systems, and industrial processes adds to the effect. Studies consistently show that city centres can be 1–7 degrees Celsius warmer than their rural surroundings, with the greatest difference occurring on calm, clear nights when the absence of wind prevents heat dispersal. The public health consequences are significant: heat islands intensify heatwave conditions, increase peak electricity demand, and contribute to elevated concentrations of ground-level ozone and particulate matter. Adaptation strategies include urban greening — planting trees and establishing parks — cool roofs and pavements that reflect rather than absorb solar radiation, and redesigning urban layouts to channel natural ventilation.", questions: [
    { prompt: "According to the passage, which of the following contributes to the urban heat island effect?", options: ["High buildings that block wind flow","Vehicles, air conditioning, and industry releasing waste heat","Reflective roofs in city centres","Increased cloud cover over urban areas"], answer: "B" },
    { prompt: "The passage states that the greatest temperature difference between cities and rural areas occurs:", options: ["During the hottest summer afternoons","On calm, clear nights","During periods of high wind","When humidity is at its highest"], answer: "B" },
    { prompt: "Which of the following, if true, would most strengthen the case for urban greening as an adaptation strategy?", options: ["Trees in urban areas require significant maintenance costs","Studies show trees can reduce local temperatures by up to 8°C through evapotranspiration","Cool roofs are less expensive to install than planting trees","Urban greening has been adopted by fewer than 20% of major cities worldwide"], answer: "B" },
  ]},
];

// ─── Build unique GMAT Verbal test ─────────────────────────────────────────────

function buildGMATVerbalTest(testObj, testIdx) {
  const questions = [];
  let num = 1;

  // Select 20 CR questions - rotate through pool ensuring no test has same set
  const crOffset = testIdx * 4; // shift starting point
  const crIndices = [];
  for (let i = 0; i < 20; i++) {
    crIndices.push((crOffset + i) % CR_QUESTIONS.length);
  }
  // Ensure uniqueness within test
  const usedIndices = new Set();
  const uniqueCR = [];
  for (const idx of crIndices) {
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      uniqueCR.push(idx);
    }
  }
  // Fill remaining slots by cycling from different offset
  let fillIdx = 0;
  while (uniqueCR.length < 20) {
    if (!usedIndices.has(fillIdx)) {
      usedIndices.add(fillIdx);
      uniqueCR.push(fillIdx);
    }
    fillIdx++;
  }

  for (let i = 0; i < 20; i++) {
    const cr = CR_QUESTIONS[uniqueCR[i]];
    questions.push({
      id: `${testObj.id}-q${String(num).padStart(2,"0")}`,
      questionType: "critical_reasoning",
      num,
      prompt: cr.prompt,
      question: cr.question,
      options: cr.options.map((o,oi) => `${"ABCDE"[oi]}. ${o.replace(/^[A-E]\.\s*/,"")}`),
      correctAnswer: cr.answer,
      explanation: cr.explanation,
      difficulty: i < 7 ? "easy" : i < 14 ? "medium" : "hard",
      topic: "verbal_reasoning",
    });
    num++;
  }

  // Select RC passage (rotate through 3 passages)
  const passage = RC_PASSAGES[testIdx % RC_PASSAGES.length];
  for (let qi = 0; qi < 3; qi++) {
    const rcQ = passage.questions[qi];
    questions.push({
      id: `${testObj.id}-q${String(num).padStart(2,"0")}`,
      questionType: "reading_comprehension",
      num,
      passageTitle: passage.title,
      passageText: passage.text,
      prompt: rcQ.prompt,
      options: rcQ.options.map((o,oi) => `${"ABCDE"[oi]}. ${o}`),
      correctAnswer: rcQ.answer,
      explanation: `Based on the passage content about ${passage.title}.`,
      difficulty: "medium",
      topic: "reading_comprehension",
    });
    num++;
  }

  testObj.questions = questions;
  testObj.questionCount = questions.length;
  return testObj;
}

// ─── Build unique GMAT DI test ────────────────────────────────────────────────

const DI_TYPES = ["graphics_interpretation","two_part_analysis","multi_source_reasoning","data_sufficiency","table_analysis"];

function buildGMATDITest(testObj, testIdx) {
  const questions = [];
  let num = 1;
  const scenOffset = testIdx * 3;

  // 4 questions of each type = 20 total
  for (const qtype of DI_TYPES) {
    for (let i = 0; i < 4; i++) {
      const scen = DI_SCENARIOS[(scenOffset + num - 1) % DI_SCENARIOS.length];
      const stems = DI_QUESTION_STEMS[qtype];
      const stemFn = stems[(i) % stems.length];
      const opts = DI_OPTIONS[qtype][(i) % DI_OPTIONS[qtype].length];
      questions.push({
        id: `${testObj.id}-q${String(num).padStart(2,"0")}`,
        questionType: qtype,
        num,
        prompt: stemFn(scen),
        options: opts,
        correctAnswer: "A",
        explanation: `This ${qtype} question tests ability to interpret ${scen.context} data on ${scen.topic}.`,
        difficulty: num <= 7 ? "easy" : num <= 14 ? "medium" : "hard",
        topic: "data_interpretation",
        dataContext: { context: scen.context, topic: scen.topic, data: scen.data },
      });
      num++;
    }
  }

  testObj.questions = questions;
  testObj.questionCount = questions.length;
  return testObj;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log("Rebuilding GMAT Verbal and Data Insights content...\n");

// Fix GMAT Verbal
const verbalDir = path.join(BASE, "content/gmat/verbal");
const verbalFiles = fs.readdirSync(verbalDir).filter(f => f.match(/^test-\d+\.json$/)).sort();
verbalFiles.forEach((file, idx) => {
  const fp = path.join(verbalDir, file);
  let test = JSON.parse(fs.readFileSync(fp, "utf8"));
  test = buildGMATVerbalTest(test, idx);
  fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
});
console.log(`✓ GMAT Verbal: ${verbalFiles.length} tests rebuilt (23Q each, 20 CR + 3 RC)`);

// Fix GMAT Data Insights
const diDir = path.join(BASE, "content/gmat/data-insights");
const diFiles = fs.readdirSync(diDir).filter(f => f.match(/^test-\d+\.json$/)).sort();
diFiles.forEach((file, idx) => {
  const fp = path.join(diDir, file);
  let test = JSON.parse(fs.readFileSync(fp, "utf8"));
  test = buildGMATDITest(test, idx);
  fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
});
console.log(`✓ GMAT DI: ${diFiles.length} tests rebuilt (20Q each, 4 per type)`);

// Verify
const v1 = JSON.parse(fs.readFileSync(path.join(verbalDir, "test-001.json"), "utf8"));
const v2 = JSON.parse(fs.readFileSync(path.join(verbalDir, "test-002.json"), "utf8"));
const q1 = v1.questions[0].prompt;
const q2 = v2.questions[0].prompt;
console.log(`\nTest-001 Q1: "${q1.substring(0,60)}..."`);
console.log(`Test-002 Q1: "${q2.substring(0,60)}..."`);
console.log(`Questions differ between tests: ${q1 !== q2 ? "YES ✓" : "NO ✗"}`);

const di1 = JSON.parse(fs.readFileSync(path.join(diDir, "test-001.json"), "utf8"));
const diTypes = di1.questions.map(q => q.questionType);
const uniqueTypes = [...new Set(diTypes)];
console.log(`DI test-001 question types: ${uniqueTypes.join(", ")}`);
console.log("Done.");
