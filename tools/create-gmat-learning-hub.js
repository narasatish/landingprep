/**
 * create-gmat-learning-hub.js
 * Creates vocabulary.json and strategies.json for the GMAT Focus Edition
 * learning hub.
 *
 * Run: node tools/create-gmat-learning-hub.js
 */

const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../content/learning-hub/gmat");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── vocabulary.json ──────────────────────────────────────────────────────────
// 10 topics × 10 words, matching the standard LP format:
// { topics: [{ topic, items: [{ word, meaning, example, synonyms, difficulty }] }] }

const vocabulary = {
  topics: [
    {
      topic: "Critical Reasoning",
      items: [
        { word: "premise", meaning: "A statement offered as evidence or reason in support of a conclusion.", example: "The argument's premise — that sales fell — was not disputed by either side.", synonyms: ["assumption","basis","supposition"], difficulty: "medium" },
        { word: "conclusion", meaning: "The claim that an argument is trying to establish.", example: "The author's conclusion is that the new policy will reduce costs.", synonyms: ["inference","deduction","finding"], difficulty: "medium" },
        { word: "assumption", meaning: "An unstated premise that the argument depends on being true.", example: "The argument assumes that no alternative suppliers exist.", synonyms: ["presupposition","axiom","given"], difficulty: "medium" },
        { word: "inference", meaning: "A conclusion reached on the basis of evidence and reasoning.", example: "From the data, we can draw the inference that demand is rising.", synonyms: ["deduction","conclusion","implication"], difficulty: "medium" },
        { word: "weaken", meaning: "To reduce the strength or validity of an argument.", example: "Evidence that the control group was biased would weaken the study's conclusion.", synonyms: ["undermine","refute","contradict"], difficulty: "medium" },
        { word: "strengthen", meaning: "To add support or validity to an argument.", example: "The new survey data would strengthen the author's claim.", synonyms: ["reinforce","support","bolster"], difficulty: "medium" },
        { word: "flaw", meaning: "A logical error that undermines the validity of an argument.", example: "The flaw in the argument is that it assumes correlation implies causation.", synonyms: ["fallacy","error","defect"], difficulty: "hard" },
        { word: "paradox", meaning: "A statement that seems contradictory but may be true.", example: "The paradox is that spending more on prevention actually lowers total costs.", synonyms: ["contradiction","anomaly","puzzle"], difficulty: "hard" },
        { word: "analogy", meaning: "A comparison between two situations to explain or justify a conclusion.", example: "The argument draws an analogy between the two markets to predict outcomes.", synonyms: ["comparison","parallel","likeness"], difficulty: "medium" },
        { word: "scope", meaning: "The range of subjects or issues that an argument applies to.", example: "The conclusion goes beyond the scope of the evidence presented.", synonyms: ["range","extent","breadth"], difficulty: "medium" },
      ],
    },
    {
      topic: "Reading Comprehension",
      items: [
        { word: "main idea", meaning: "The central point or thesis that a passage seeks to convey.", example: "The main idea of the passage is that climate policy requires international cooperation.", synonyms: ["thesis","central argument","core claim"], difficulty: "easy" },
        { word: "tone", meaning: "The attitude of the author toward the subject or audience.", example: "The author's tone is skeptical toward the proposed reforms.", synonyms: ["attitude","voice","register"], difficulty: "medium" },
        { word: "imply", meaning: "To suggest something without stating it directly.", example: "The passage implies that the current system is inefficient.", synonyms: ["suggest","infer","indicate"], difficulty: "medium" },
        { word: "explicit", meaning: "Stated clearly and in detail, leaving nothing implied.", example: "The author's opposition to the policy is explicit in the second paragraph.", synonyms: ["direct","clear","stated"], difficulty: "easy" },
        { word: "nuance", meaning: "A subtle distinction or variation in meaning or expression.", example: "The writer's nuance makes it clear that the reform is partial, not total.", synonyms: ["subtlety","distinction","shade"], difficulty: "hard" },
        { word: "rhetoric", meaning: "Language designed to persuade or impress.", example: "The passage relies on emotional rhetoric rather than factual evidence.", synonyms: ["oratory","persuasion","eloquence"], difficulty: "hard" },
        { word: "counterargument", meaning: "An argument made in opposition to another argument.", example: "The author anticipates the counterargument and refutes it in paragraph three.", synonyms: ["objection","rebuttal","opposition"], difficulty: "medium" },
        { word: "context", meaning: "The circumstances surrounding a statement that help explain its meaning.", example: "Read the sentence in context before selecting an answer.", synonyms: ["setting","background","framework"], difficulty: "easy" },
        { word: "paraphrase", meaning: "Restating information using different words.", example: "Paraphrase the author's point before answering an inference question.", synonyms: ["restate","rephrase","reword"], difficulty: "easy" },
        { word: "synthesis", meaning: "Combining information from multiple parts of a passage to form a new understanding.", example: "The question requires synthesis of data from both the first and third paragraphs.", synonyms: ["integration","combination","amalgamation"], difficulty: "hard" },
      ],
    },
    {
      topic: "Quantitative Reasoning — Algebra",
      items: [
        { word: "variable", meaning: "A symbol (usually a letter) representing an unknown quantity.", example: "In the equation 3x + 5 = 14, x is the variable.", synonyms: ["unknown","symbol","placeholder"], difficulty: "easy" },
        { word: "coefficient", meaning: "The numerical factor multiplied by a variable in an algebraic expression.", example: "In 7y, the coefficient is 7.", synonyms: ["multiplier","factor","constant"], difficulty: "easy" },
        { word: "quadratic", meaning: "Involving the square of a variable; a polynomial of degree two.", example: "The quadratic equation x² − 5x + 6 = 0 has roots x = 2 and x = 3.", synonyms: ["second-degree","parabolic"], difficulty: "medium" },
        { word: "inequality", meaning: "A mathematical statement showing that two expressions are not equal.", example: "The inequality 2x > 8 means x > 4.", synonyms: ["comparison","relation"], difficulty: "medium" },
        { word: "absolute value", meaning: "The distance of a number from zero on a number line, always non-negative.", example: "|−7| = 7 because absolute value ignores sign.", synonyms: ["magnitude","modulus"], difficulty: "medium" },
        { word: "exponent", meaning: "A number indicating how many times a base is multiplied by itself.", example: "In 2⁴, the exponent is 4, so 2⁴ = 16.", synonyms: ["power","index"], difficulty: "easy" },
        { word: "factor", meaning: "An integer that divides another integer without a remainder.", example: "The factors of 12 are 1, 2, 3, 4, 6, and 12.", synonyms: ["divisor","component"], difficulty: "easy" },
        { word: "linear equation", meaning: "An equation whose graph is a straight line; variables are to the first power.", example: "y = 3x − 2 is a linear equation with slope 3 and y-intercept −2.", synonyms: ["first-degree equation"], difficulty: "easy" },
        { word: "system of equations", meaning: "A set of two or more equations with the same variables.", example: "Solving the system gives unique values of x and y satisfying both equations simultaneously.", synonyms: ["simultaneous equations","equation set"], difficulty: "medium" },
        { word: "function", meaning: "A relation where each input has exactly one output.", example: "If f(x) = x² + 1, then f(3) = 10.", synonyms: ["mapping","relation","rule"], difficulty: "medium" },
      ],
    },
    {
      topic: "Quantitative Reasoning — Number Properties",
      items: [
        { word: "integer", meaning: "A whole number (positive, negative, or zero) with no fractional part.", example: "…−3, −2, −1, 0, 1, 2, 3… are all integers.", synonyms: ["whole number"], difficulty: "easy" },
        { word: "prime number", meaning: "A positive integer greater than 1 with no positive divisors other than 1 and itself.", example: "2, 3, 5, 7, 11, 13 are the first six prime numbers.", synonyms: ["prime"], difficulty: "easy" },
        { word: "divisibility", meaning: "The property of being evenly divisible by a number without a remainder.", example: "72 has divisibility by 2, 3, 4, 6, 8, 9, and 12.", synonyms: ["divisibility rule"], difficulty: "medium" },
        { word: "remainder", meaning: "The amount left over when one integer is divided by another.", example: "17 ÷ 5 = 3 with a remainder of 2.", synonyms: ["modulus","residue"], difficulty: "easy" },
        { word: "even / odd", meaning: "Even integers are divisible by 2; odd integers are not.", example: "The sum of two odd integers is always even.", synonyms: ["parity"], difficulty: "easy" },
        { word: "consecutive integers", meaning: "Integers that follow one another in order without gaps.", example: "If n is an integer, then n, n+1, n+2 are three consecutive integers.", synonyms: ["successive integers"], difficulty: "easy" },
        { word: "GCF (Greatest Common Factor)", meaning: "The largest factor shared by two or more integers.", example: "GCF(18, 24) = 6.", synonyms: ["HCF","GCD"], difficulty: "medium" },
        { word: "LCM (Least Common Multiple)", meaning: "The smallest positive integer divisible by two or more given integers.", example: "LCM(4, 6) = 12.", synonyms: ["lowest common multiple"], difficulty: "medium" },
        { word: "digit", meaning: "Any of the symbols 0–9 used to represent numbers.", example: "The number 473 has three digits.", synonyms: ["numeral","figure"], difficulty: "easy" },
        { word: "absolute value", meaning: "The non-negative value of a number without regard to its sign.", example: "|−15| = 15 and |15| = 15.", synonyms: ["magnitude"], difficulty: "easy" },
      ],
    },
    {
      topic: "Quantitative Reasoning — Word Problems",
      items: [
        { word: "rate", meaning: "A ratio comparing two quantities with different units, often over time.", example: "If a car travels 300 km in 3 hours, its rate is 100 km/h.", synonyms: ["speed","ratio","proportion"], difficulty: "easy" },
        { word: "ratio", meaning: "A comparison of two quantities by division.", example: "A ratio of 3:5 means for every 3 of one quantity, there are 5 of another.", synonyms: ["proportion","fraction"], difficulty: "easy" },
        { word: "percentage", meaning: "A rate, number, or amount expressed as a fraction of 100.", example: "A 20% increase on 50 gives 60.", synonyms: ["percent","proportion"], difficulty: "easy" },
        { word: "profit / loss", meaning: "Profit is revenue minus cost; loss is the reverse.", example: "Buying at $40 and selling at $55 gives a profit of $15.", synonyms: ["gain","deficit"], difficulty: "medium" },
        { word: "work rate", meaning: "The amount of work completed per unit of time.", example: "If machine A finishes a job in 6 hours and B in 3 hours, together they take 2 hours.", synonyms: ["productivity","output rate"], difficulty: "medium" },
        { word: "mixture problem", meaning: "A problem involving combining substances of different concentrations.", example: "Mixing 20 litres of 30% acid with 10 litres of 60% acid gives 30 litres at 40%.", synonyms: ["blending problem"], difficulty: "hard" },
        { word: "average (mean)", meaning: "The sum of values divided by the number of values.", example: "Average of 4, 8, 12 = (4+8+12)/3 = 8.", synonyms: ["mean","arithmetic mean"], difficulty: "easy" },
        { word: "probability", meaning: "The likelihood of an event occurring, expressed as a fraction between 0 and 1.", example: "Rolling a 4 on a fair die has probability 1/6.", synonyms: ["likelihood","chance"], difficulty: "medium" },
        { word: "permutation", meaning: "An arrangement of items where order matters.", example: "The number of ways to arrange 3 books in 3 spots is 3! = 6.", synonyms: ["arrangement"], difficulty: "hard" },
        { word: "combination", meaning: "A selection of items where order does NOT matter.", example: "Choosing 2 out of 5 items: C(5,2) = 10 ways.", synonyms: ["selection","choose"], difficulty: "hard" },
      ],
    },
    {
      topic: "Data Insights — Statistics",
      items: [
        { word: "mean", meaning: "The arithmetic average of a data set.", example: "Mean of {2, 4, 6, 8} = 20/4 = 5.", synonyms: ["average","arithmetic mean"], difficulty: "easy" },
        { word: "median", meaning: "The middle value in an ordered data set.", example: "Median of {1, 3, 7, 9, 11} = 7.", synonyms: ["midpoint","middle value"], difficulty: "easy" },
        { word: "mode", meaning: "The value that appears most frequently in a data set.", example: "Mode of {2, 4, 4, 5, 6} = 4.", synonyms: ["modal value","most frequent"], difficulty: "easy" },
        { word: "range", meaning: "The difference between the maximum and minimum values in a data set.", example: "Range of {3, 8, 15, 2} = 15 − 2 = 13.", synonyms: ["spread","variation"], difficulty: "easy" },
        { word: "standard deviation", meaning: "A measure of how spread out values are around the mean.", example: "A high standard deviation indicates values are widely spread from the mean.", synonyms: ["SD","variability"], difficulty: "hard" },
        { word: "percentile", meaning: "A value below which a given percentage of data falls.", example: "Scoring in the 90th percentile means you scored higher than 90% of test-takers.", synonyms: ["centile","rank"], difficulty: "medium" },
        { word: "correlation", meaning: "A statistical relationship between two variables.", example: "A positive correlation means both variables tend to rise together.", synonyms: ["association","relationship"], difficulty: "medium" },
        { word: "distribution", meaning: "The way values in a data set are spread across a range.", example: "A normal distribution forms a bell-shaped curve.", synonyms: ["spread","frequency distribution"], difficulty: "medium" },
        { word: "outlier", meaning: "A data point significantly different from other values in a set.", example: "In {10, 12, 11, 13, 100}, the value 100 is an outlier.", synonyms: ["anomaly","extreme value"], difficulty: "medium" },
        { word: "sampling", meaning: "The process of selecting a subset of a population to represent the whole.", example: "Random sampling reduces bias in survey results.", synonyms: ["sample selection","data collection"], difficulty: "medium" },
      ],
    },
    {
      topic: "Data Insights — Interpretation",
      items: [
        { word: "table", meaning: "A structured arrangement of data in rows and columns.", example: "The table shows quarterly revenue for each product line.", synonyms: ["grid","matrix"], difficulty: "easy" },
        { word: "bar chart", meaning: "A graph using rectangular bars to compare quantities.", example: "The bar chart compares sales across five regions.", synonyms: ["bar graph","column chart"], difficulty: "easy" },
        { word: "line graph", meaning: "A chart showing data points connected by lines, used to show trends.", example: "The line graph illustrates profit growth over six years.", synonyms: ["line chart","trend graph"], difficulty: "easy" },
        { word: "pie chart", meaning: "A circular chart divided into sectors representing proportions.", example: "The pie chart shows each department's share of the budget.", synonyms: ["circle graph","sector chart"], difficulty: "easy" },
        { word: "scatter plot", meaning: "A graph plotting pairs of values to show relationships.", example: "The scatter plot suggests a positive correlation between hours studied and scores.", synonyms: ["scatter diagram","XY graph"], difficulty: "medium" },
        { word: "trend", meaning: "A general direction in which data values are moving over time.", example: "The upward trend in sales began in Q2.", synonyms: ["pattern","trajectory"], difficulty: "easy" },
        { word: "inference", meaning: "A conclusion drawn from data without it being explicitly stated.", example: "From the graph, the inference is that demand peaks in December.", synonyms: ["deduction","conclusion"], difficulty: "medium" },
        { word: "Two-Part Analysis", meaning: "A GMAT Data Insights format requiring two interdependent answers.", example: "A Two-Part Analysis question may ask for the value of x and y simultaneously.", synonyms: ["integrated reasoning","paired response"], difficulty: "hard" },
        { word: "Multi-Source Reasoning", meaning: "A GMAT format requiring synthesis of information from multiple tabs.", example: "Multi-Source Reasoning items test whether you can reconcile conflicting data tables.", synonyms: ["integrated reasoning"], difficulty: "hard" },
        { word: "Data Sufficiency", meaning: "A GMAT format testing whether given information is enough to solve a problem.", example: "In Data Sufficiency, you determine if Statement 1 alone, Statement 2 alone, both, or neither is sufficient.", synonyms: ["DS"], difficulty: "hard" },
      ],
    },
    {
      topic: "Business & Management Vocabulary",
      items: [
        { word: "revenue", meaning: "Total income generated by a business before costs are deducted.", example: "Revenue increased by 12% in the third quarter.", synonyms: ["income","turnover","sales"], difficulty: "easy" },
        { word: "profit margin", meaning: "Net profit expressed as a percentage of revenue.", example: "A 15% profit margin means $0.15 is retained per $1.00 of revenue.", synonyms: ["net margin","return on sales"], difficulty: "medium" },
        { word: "market share", meaning: "The percentage of total market sales accounted for by one company.", example: "The new product launch increased the firm's market share by 5 points.", synonyms: ["market proportion"], difficulty: "medium" },
        { word: "capital", meaning: "Financial assets or resources used to fund operations or investments.", example: "The startup raised $2 million in capital from venture investors.", synonyms: ["funds","assets","investment"], difficulty: "medium" },
        { word: "equity", meaning: "Ownership interest in a company; assets minus liabilities.", example: "Shareholder equity rose after retained earnings were added.", synonyms: ["ownership","net assets","stake"], difficulty: "medium" },
        { word: "liability", meaning: "A financial obligation or debt owed by a company.", example: "Long-term liabilities include bonds and mortgage obligations.", synonyms: ["debt","obligation"], difficulty: "medium" },
        { word: "depreciation", meaning: "The reduction in value of an asset over time.", example: "Machinery is depreciated over ten years on a straight-line basis.", synonyms: ["amortisation","write-down"], difficulty: "hard" },
        { word: "economies of scale", meaning: "Cost advantages gained when production volume increases.", example: "Large manufacturers benefit from economies of scale that lower per-unit costs.", synonyms: ["scale advantage","bulk efficiency"], difficulty: "hard" },
        { word: "fixed cost", meaning: "A cost that does not change with the level of output.", example: "Rent is a fixed cost regardless of how many units are produced.", synonyms: ["overhead","standing cost"], difficulty: "easy" },
        { word: "variable cost", meaning: "A cost that changes in proportion to the volume of output.", example: "Raw materials represent a variable cost for a manufacturer.", synonyms: ["marginal cost","direct cost"], difficulty: "easy" },
      ],
    },
    {
      topic: "Logic & Analytical Reasoning",
      items: [
        { word: "deductive reasoning", meaning: "Reasoning from general principles to a specific conclusion.", example: "All mammals breathe air; whales are mammals; therefore whales breathe air — this is deductive reasoning.", synonyms: ["deduction","top-down reasoning"], difficulty: "medium" },
        { word: "inductive reasoning", meaning: "Reasoning from specific observations to a general conclusion.", example: "Observing that the sun has risen every morning leads to the inductive conclusion it will rise tomorrow.", synonyms: ["induction","bottom-up reasoning"], difficulty: "medium" },
        { word: "syllogism", meaning: "A form of deductive reasoning with two premises and a conclusion.", example: "'All A are B; all B are C; therefore all A are C' is a classic syllogism.", synonyms: ["logical argument","three-part argument"], difficulty: "hard" },
        { word: "logical fallacy", meaning: "An error in reasoning that undermines the logic of an argument.", example: "Ad hominem attacks are a logical fallacy because they attack the person, not the argument.", synonyms: ["reasoning error","non sequitur","flaw"], difficulty: "hard" },
        { word: "sufficient condition", meaning: "A condition whose presence guarantees a result.", example: "Being over 18 is a sufficient condition to vote (in most countries).", synonyms: ["guarantee","prerequisite"], difficulty: "hard" },
        { word: "necessary condition", meaning: "A condition that must be present for a result to occur.", example: "Having oxygen is necessary for combustion but not sufficient alone.", synonyms: ["requirement","prerequisite"], difficulty: "hard" },
        { word: "causal relationship", meaning: "A relationship where one event directly causes another.", example: "The study tried to establish a causal relationship between diet and disease.", synonyms: ["causation","cause-effect"], difficulty: "medium" },
        { word: "correlation vs causation", meaning: "The distinction between two variables occurring together vs one causing the other.", example: "Ice cream sales and drowning rates both peak in summer, but one does not cause the other.", synonyms: ["spurious correlation"], difficulty: "hard" },
        { word: "counterexample", meaning: "An example that disproves a general statement.", example: "One counterexample is enough to refute a universal claim.", synonyms: ["exception","refutation"], difficulty: "medium" },
        { word: "valid argument", meaning: "An argument in which the conclusion logically follows from the premises.", example: "An argument can be valid even if its premises are false.", synonyms: ["sound argument","logical conclusion"], difficulty: "medium" },
      ],
    },
    {
      topic: "GMAT Exam Strategy & Test Terms",
      items: [
        { word: "GMAT Focus Edition", meaning: "The current version of the GMAT exam introduced in 2023, consisting of three sections.", example: "The GMAT Focus Edition replaced the classic GMAT with a shorter, adaptive format.", synonyms: ["GMAT Focus","Focus Edition"], difficulty: "easy" },
        { word: "adaptive testing", meaning: "A testing format where question difficulty adjusts based on previous answers.", example: "In adaptive testing, a correct answer leads to a harder question.", synonyms: ["computer-adaptive test","CAT"], difficulty: "medium" },
        { word: "scaled score", meaning: "A score converted from a raw score using a statistical formula for comparability.", example: "Each GMAT section reports a scaled score from 60–90.", synonyms: ["converted score","normalised score"], difficulty: "medium" },
        { word: "total score", meaning: "The combined score from all GMAT Focus sections, ranging from 205–805.", example: "A total score of 705+ is competitive for top MBA programmes.", synonyms: ["composite score","overall score"], difficulty: "easy" },
        { word: "percentile rank", meaning: "The percentage of test-takers who scored at or below a given score.", example: "A score at the 85th percentile means you outperformed 85% of test-takers.", synonyms: ["relative standing","rank"], difficulty: "easy" },
        { word: "bookmark", meaning: "A GMAT Focus feature allowing you to flag a question for review.", example: "Use the bookmark feature on questions you want to revisit before submitting.", synonyms: ["flag","mark"], difficulty: "easy" },
        { word: "section selection", meaning: "The ability in GMAT Focus to choose the order of sections.", example: "Section selection lets you start with Quantitative if that is your strength.", synonyms: ["order choice","section order"], difficulty: "easy" },
        { word: "IR (Integrated Reasoning)", meaning: "Now called Data Insights in GMAT Focus; tests interpretation of complex data.", example: "The Data Insights section replaced the original IR section.", synonyms: ["Data Insights","DI"], difficulty: "medium" },
        { word: "pacing strategy", meaning: "A planned approach to managing time across test questions.", example: "A good pacing strategy ensures you don't spend more than 2.5 minutes per QR question.", synonyms: ["time management","test pace"], difficulty: "medium" },
        { word: "process of elimination", meaning: "Removing obviously wrong answer choices to increase the chance of selecting correctly.", example: "Process of elimination is especially useful in CR when two answers are close.", synonyms: ["elimination method","POE"], difficulty: "easy" },
      ],
    },
  ],
};

// ─── strategies.json ──────────────────────────────────────────────────────────

const strategies = [
  {
    section: "Critical Reasoning — Core Strategy",
    tips: [
      "Always identify the conclusion BEFORE reading the answer choices — most errors occur when students evaluate options without clarity on what the argument is claiming.",
      "Find the assumption: ask yourself 'What must be true for the conclusion to follow from the premises?' This is the bridge the argument needs.",
      "For Weaken questions, look for an answer that attacks the assumption or introduces new information that makes the conclusion less likely.",
      "For Strengthen questions, look for an answer that supports the assumption or adds evidence that makes the conclusion more probable.",
      "Eliminate answers that are 'out of scope' — GMAT CR wrong answers frequently introduce topics not discussed in the argument.",
      "Beware of extreme answer choices using words like 'always', 'never', 'all', 'none' — these are usually wrong in CR.",
      "The correct answer in an Inference question must be 100% supported by the passage — it cannot go beyond what is stated.",
      "For Paradox questions, the correct answer must explain BOTH sides of the contradiction simultaneously, not just one.",
      "In Bold-face questions, identify the role of each bolded statement before evaluating the options.",
      "Practice timing: aim for no more than 2 minutes per CR question on the real exam.",
    ],
  },
  {
    section: "Reading Comprehension — Strategy",
    tips: [
      "Read actively: note the main idea of each paragraph as you read, and track how the structure supports the author's central argument.",
      "Identify the author's tone early — is the writer neutral, critical, enthusiastic, or skeptical? Tone questions test this directly.",
      "For detail questions, always return to the relevant paragraph — memory alone leads to errors on GMAT RC.",
      "Inference questions ask what MUST be true based on the passage — avoid answers that only COULD be true.",
      "Primary purpose questions require a broad view of the entire passage, not a single detail.",
      "Wrong answer patterns in RC: too broad, too narrow, contradicts the passage, or introduces information not in the passage.",
      "Do not bring outside knowledge — the GMAT tests your ability to reason from the text provided, not your general knowledge.",
      "Read the first and last sentence of each paragraph carefully — they usually carry the main idea.",
      "For long passages (4+ paragraphs), consider reading the first paragraph fully and skimming subsequent ones before answering questions.",
      "Practice identifying 'function' of sentences — why did the author include this sentence? This is tested directly on RC.",
    ],
  },
  {
    section: "Quantitative Reasoning — Problem-Solving Strategy",
    tips: [
      "GMAT Focus QR has 21 Problem Solving questions only — Data Sufficiency has been moved to the Data Insights section.",
      "Backsolving is powerful: plug answer choices back into the problem when the algebra is complex.",
      "Number substitution: replace variables with smart numbers (e.g., 2, 3, 10, 100) to test abstract algebraic relationships.",
      "Memorise squares up to 20² and cubes up to 10³ — these appear frequently and save critical time.",
      "Learn divisibility rules: a number is divisible by 3 if its digits sum to a multiple of 3; divisible by 9 if digits sum to 9.",
      "For percentage problems, translate carefully: '20% of 50' = 0.20 × 50 = 10.",
      "For rate × time = work problems, find a combined rate when two workers or machines operate together.",
      "On mixture problems, use weighted average: (C₁ × V₁ + C₂ × V₂) / (V₁ + V₂).",
      "Geometry formulas to memorise: circle area = πr², circumference = 2πr, triangle area = ½bh, Pythagoras: a² + b² = c².",
      "Manage time: if a problem requires more than 3 minutes, eliminate, guess, and move on — accuracy on the rest matters more.",
    ],
  },
  {
    section: "Data Sufficiency — The GMAT Unique Section",
    tips: [
      "Memorise the five DS answer choices before test day — they are the same on every Data Sufficiency question.",
      "Choice A: Statement 1 alone sufficient. Choice B: Statement 2 alone. Choice C: Both together. Choice D: Either alone. Choice E: Neither sufficient.",
      "You are NOT solving the problem — you are deciding whether there is ENOUGH information to solve it.",
      "Test each statement independently first — never combine them before evaluating individually.",
      "For 'Yes/No' DS questions, a definitive 'No' is sufficient — it is only insufficient if the answer could be either yes or no.",
      "Beware of statements that seem to give information but actually do not constrain the answer further.",
      "Special values to test: 0, 1, −1, fractions, very large numbers — these often break assumptions.",
      "If a statement gives a variable's value exactly, it is almost always sufficient for a unique numerical answer.",
      "Common trap: assuming you need a specific value when the question asks only whether something is possible.",
      "Practice the DS format extensively — it requires a different mindset from standard problem-solving.",
    ],
  },
  {
    section: "Data Insights — Two-Part Analysis",
    tips: [
      "Two-Part Analysis presents a scenario and asks you to fill in TWO answers that are interdependent.",
      "Read the question stem carefully to understand the relationship between the two required values.",
      "Set up algebraic equations when possible — the two unknowns usually satisfy a system of constraints.",
      "Eliminate column by column: fix one answer and check if a consistent second answer exists in the table.",
      "Both selected values must work simultaneously — partial correctness earns no credit.",
      "Common scenarios: simultaneous constraints on two variables, selection from two criteria, cause-effect allocation.",
      "For argument-based Two-Part items, treat each column as a separate claim and evaluate independently.",
      "Time yourself: Two-Part Analysis should take approximately 3 minutes per item.",
      "If stuck, use process of elimination — cross out combinations you can prove are impossible.",
      "Practice with official GMAT Focus prep materials — OG two-part items closely reflect the real exam format.",
    ],
  },
  {
    section: "Data Insights — Multi-Source Reasoning",
    tips: [
      "Multi-Source Reasoning presents 2–3 tabs of information (text, tables, emails) and asks several questions.",
      "Read all tabs before answering questions — information may be scattered and questions require synthesis.",
      "For True/False/Cannot determine items, a statement is only 'True' if directly supported by the data.",
      "'Cannot be determined' is correct when the data does not provide enough information — not when you simply don't know.",
      "Pay attention to dates and units in tables — contradictions between tabs are deliberate and tested.",
      "Identify the source of each piece of information to avoid confusing data from different tabs.",
      "For email-based MSR, consider the perspective and role of each author — bias and reliability are tested.",
      "Avoid outside knowledge — only information in the tabs should inform your answers.",
      "Manage your time across the tab set: don't spend more than 5–6 minutes on the full MSR question block.",
      "Practice annotation — note which tab each key fact came from as you read.",
    ],
  },
  {
    section: "Test-Day Strategy & Pacing",
    tips: [
      "GMAT Focus Edition total time: 2 hours 15 minutes for 64 questions across three sections (21 QR + 23 VR + 20 DI).",
      "You may choose the order of sections — start with your strongest section to build confidence and maximise adaptive scoring.",
      "Quantitative: budget approximately 2 minutes 8 seconds per question (45 minutes / 21 questions).",
      "Verbal: budget approximately 1 minute 57 seconds per question (45 minutes / 23 questions).",
      "Data Insights: budget approximately 2 minutes 15 seconds per question (45 minutes / 20 questions).",
      "Use the bookmark feature for questions you are unsure about and revisit them within the section if time allows.",
      "Do not leave any question unanswered — there is no penalty for guessing on GMAT Focus.",
      "Early questions in each adaptive section carry more weight — invest time in the first five questions of each section.",
      "If you are stuck after 2 minutes, make your best guess and move on — don't let one question derail your pacing.",
      "Take the optional 8-minute breaks between sections — hydrate and refocus before each new section.",
    ],
  },
  {
    section: "Score Interpretation & MBA Applications",
    tips: [
      "GMAT Focus total score ranges from 205 to 805 in 10-point increments — the mean score is approximately 565.",
      "A total score of 700+ places you roughly in the 88th percentile — competitive for most top MBA programmes.",
      "Section scores each range from 60 to 90 — balanced sections are viewed more favourably than lopsided scores.",
      "Schools consider your highest score from multiple attempts — most accept scores from the last 5 years.",
      "Retaking is common: a score improvement of 30+ points is meaningful and worth communicating in applications.",
      "Percentile rank matters as much as the raw score — always check the current percentile table (GMAC updates it annually).",
      "Quant percentile has historically been more compressed at the top — a 90 in Quant may be around the 60th percentile.",
      "Many programmes publish average GMAT scores for accepted students — aim for the 80th percentile of the stated average.",
      "A strong GMAT score can offset a lower undergraduate GPA and vice versa — admissions is holistic.",
      "Official GMAT score reports include section scores, percentile ranks, and IR scores — all are shared with schools.",
    ],
  },
  {
    section: "Verbal Reasoning — Integrated Tips",
    tips: [
      "GMAT Focus Verbal includes only Critical Reasoning and Reading Comprehension — Sentence Correction has been removed.",
      "Allocate roughly 50% of verbal prep time to CR and 50% to RC — both are equally weighted.",
      "Build a process: for every verbal question, read → identify question type → predict the answer → evaluate options.",
      "Wrong answers in both CR and RC share common patterns: out of scope, too extreme, opposite direction, irrelevant.",
      "Improve RC speed by practising with dense academic texts daily — the Economist and scientific abstracts are ideal.",
      "For CR, drilling by question type (Weaken, Strengthen, Assumption, Inference) builds pattern recognition faster than mixed practice.",
      "Vocabulary matters less in GMAT verbal than in GRE — logic and structure are prioritised over word knowledge.",
      "For long RC passages, map the passage structure (paragraph purpose) before answering detail questions.",
      "Time yourself consistently during practice — verbal pacing is where most candidates lose points.",
      "Review every incorrect practice question in detail — understand WHY each wrong answer is wrong and why the correct one works.",
    ],
  },
  {
    section: "Common Mistakes to Avoid",
    tips: [
      "Confusing 'sufficient' with 'necessary' in Data Sufficiency — always test both statements independently first.",
      "Selecting an RC answer that is true based on outside knowledge but not supported by the passage.",
      "Ignoring the scope of a CR argument — an answer that is about a different population or context is always wrong.",
      "Running out of time because of over-investment in difficult questions — use the bookmark and move on.",
      "Failing to memorise the DS answer choices — not knowing them cold costs 15–20 seconds per DS question.",
      "Making arithmetic errors under pressure — write down intermediate steps, even on simple calculations.",
      "Misreading question stems — 'weakens' and 'strengthens' require opposite reasoning; confusing them is a common trap.",
      "Skipping the passage map on long RC passages — this seems to save time but causes more re-reading and errors.",
      "Not practising with official GMAT materials — third-party tests often have different difficulty calibration.",
      "Neglecting the Data Insights section during prep — many candidates focus only on QR and VR and are surprised by DI difficulty.",
    ],
  },
];

// ─── Write files ──────────────────────────────────────────────────────────────

fs.writeFileSync(
  path.join(OUT_DIR, "vocabulary.json"),
  JSON.stringify(vocabulary, null, 2),
  "utf8"
);
console.log("✓ content/learning-hub/gmat/vocabulary.json written");
console.log(`  ${vocabulary.topics.length} topics, ${vocabulary.topics.reduce((s,t)=>s+t.items.length,0)} words`);

fs.writeFileSync(
  path.join(OUT_DIR, "strategies.json"),
  JSON.stringify(strategies, null, 2),
  "utf8"
);
console.log("✓ content/learning-hub/gmat/strategies.json written");
console.log(`  ${strategies.length} sections, ${strategies.reduce((s,t)=>s+t.tips.length,0)} tips`);
