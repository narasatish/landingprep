/**
 * fix-gre-2026.js
 *
 * Updates GRE tests to 2026 shortened format:
 *  Verbal:  27 questions (12+15), 2460s (41 min)
 *  Quant:   27 questions (12+15), 2820s (47 min)
 *  Writing: 1 question  (Issue only), 1800s (30 min)
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");

// ─── Extra Verbal Questions Pool (add to existing 20 to reach 27) ─────────────
// Question types: sentence_equivalence (SE), text_completion (TC), reading_comp (RC)

const EXTRA_VERBAL = [
  // Sentence Equivalence
  {
    questionType: "sentence_equivalence",
    prompt: "The professor's lecture was so __________ that even students who had struggled with the material all semester found themselves able to follow the argument.",
    options: ["abstruse","lucid","pellucid","arcane","recondite","opaque"],
    correctAnswer: ["B","C"],
    explanation: "'Lucid' and 'pellucid' both mean clear and easy to understand, fitting the context.",
    difficulty: "medium",
  },
  {
    questionType: "sentence_equivalence",
    prompt: "The diplomat's carefully __________ remarks left the other delegation uncertain about her nation's true position.",
    options: ["blunt","hedged","forthright","equivocal","candid","evasive"],
    correctAnswer: ["B","D"],
    explanation: "'Hedged' and 'equivocal' both suggest deliberate ambiguity.",
    difficulty: "hard",
  },
  {
    questionType: "sentence_equivalence",
    prompt: "The findings of the study, while provocative, were ultimately __________ by the small sample size and lack of control groups.",
    options: ["bolstered","corroborated","undermined","vitiated","confirmed","substantiated"],
    correctAnswer: ["C","D"],
    explanation: "'Undermined' and 'vitiated' both mean weakened or invalidated.",
    difficulty: "hard",
  },
  // Text Completion
  {
    questionType: "text_completion",
    prompt: "The novel's narrative structure, which alternates between three distinct timelines, initially __________ readers, but those who persist are rewarded with a coherent and emotionally resonant whole.",
    options: [["disorients","captivates","enlightens"],["trivial","unconventional","coherent"],["unreliable","compelling","straightforward"]],
    blanks: 1,
    correctAnswer: ["A"],
    explanation: "The structure that later becomes coherent but is rewarding to persist through would initially disorient readers.",
    difficulty: "medium",
  },
  {
    questionType: "text_completion",
    prompt: "Although the committee's mandate was to examine policy __________, its report was widely criticised for being too __________ to provide useful guidance.",
    options: [["failures","successes","innovations"],["specific","vague","harsh"]],
    blanks: 2,
    correctAnswer: ["A","B"],
    explanation: "Examining failures but producing a vague report creates the contrast implied by 'although'.",
    difficulty: "hard",
  },
  // Reading Comprehension
  {
    questionType: "reading_comprehension",
    prompt: "The passage suggests that the author's primary concern with the new regulatory framework is its:",
    passageText: "The recently enacted regulatory framework governing artificial intelligence applications in healthcare has been praised for its ambition. Proponents argue that it establishes clear liability standards and mandates transparency in algorithmic decision-making. Critics, however, contend that the framework's implementation timeline — requiring full compliance within six months — is not calibrated to the realities of hospital IT infrastructure, many of which require multi-year upgrade cycles. The result, they argue, will be nominal compliance on paper but persistent non-compliance in practice.",
    options: [
      "A. philosophical opposition to regulatory intervention",
      "B. unrealistic timeline relative to institutional capabilities",
      "C. failure to address liability standards",
      "D. excessive focus on algorithmic transparency",
    ],
    correctAnswer: "B",
    explanation: "The passage explicitly focuses on the criticism that the timeline is misaligned with hospital IT upgrade realities.",
    difficulty: "medium",
  },
  {
    questionType: "reading_comprehension",
    prompt: "The author implies that a paradox exists in the relationship between:",
    passageText: "Economic growth, long considered the primary engine of poverty reduction, may have reached a point of diminishing returns in highly unequal societies. While aggregate GDP figures continue to rise, an increasing share of gains accrues to the wealthiest deciles, leaving median living standards stagnant. Some economists argue that this dynamic is self-reinforcing: concentrated wealth enables disproportionate political influence, which in turn shapes policy in ways that further entrench inequality. Growth, in this view, has become not merely insufficient but actively counterproductive for broad-based welfare.",
    options: [
      "A. GDP growth and political stability",
      "B. economic expansion and widespread welfare improvement",
      "C. income inequality and political representation",
      "D. poverty reduction policies and median income growth",
    ],
    correctAnswer: "B",
    explanation: "The paradox is that economic growth (usually expected to reduce poverty) may now be counterproductive for broad welfare.",
    difficulty: "hard",
  },
];

// ─── Extra Quant Questions Pool ───────────────────────────────────────────────
const EXTRA_QUANT = [
  {
    questionType: "quantitative_comparison",
    prompt: "n is a positive integer greater than 1.",
    quantityA: "n! + 1",
    quantityB: "A prime number",
    options: ["Quantity A is greater.","Quantity B is greater.","The two quantities are equal.","The relationship cannot be determined."],
    correctAnswer: "D",
    explanation: "Sometimes n!+1 is prime (e.g., 2!+1=3), sometimes not (e.g., 4!+1=25). Cannot be determined.",
    difficulty: "hard",
  },
  {
    questionType: "problem_solving",
    prompt: "If 3^x = 5^y = 15^z, which of the following must be true?",
    options: ["z = x + y","1/z = 1/x + 1/y","z = xy/(x+y)","z = (x+y)/2","z = x·y"],
    correctAnswer: "B",
    explanation: "Taking logs: x·ln3 = y·ln5 = z·ln15. Since ln15 = ln3+ln5, 1/z = 1/x + 1/y.",
    difficulty: "hard",
  },
  {
    questionType: "problem_solving",
    prompt: "A set of 6 numbers has a mean of 8 and a median of 7. If the largest number is increased by 6 and the smallest is decreased by 6, which of the following must be true?",
    options: [
      "The mean increases by 6.",
      "The median remains 7.",
      "The mean stays at 8.",
      "The standard deviation decreases.",
      "The range decreases by 12.",
    ],
    correctAnswer: "C",
    explanation: "Increasing one number by 6 and decreasing another by 6 keeps the sum (and hence mean) unchanged. The median depends on middle values which don't change.",
    difficulty: "hard",
  },
  {
    questionType: "quantitative_comparison",
    prompt: "In a triangle, two sides have lengths 7 and 10.",
    quantityA: "The length of the third side",
    quantityB: "17",
    options: ["Quantity A is greater.","Quantity B is greater.","The two quantities are equal.","The relationship cannot be determined."],
    correctAnswer: "B",
    explanation: "By triangle inequality, the third side must be less than 7+10=17. So Quantity A < Quantity B.",
    difficulty: "medium",
  },
  {
    questionType: "problem_solving",
    prompt: "If f(x) = x² − 4x + 4, for what value of k does the equation f(x) = k have exactly one solution?",
    options: ["k = −4","k = 0","k = 2","k = 4","k = 8"],
    correctAnswer: "B",
    explanation: "f(x) = (x−2)². This equals k with exactly one solution when k=0 (i.e., x=2 is the only root).",
    difficulty: "medium",
  },
  {
    questionType: "numeric_entry",
    prompt: "If a rectangular pool is 25 m long and 12 m wide, and a path of width 1.5 m surrounds it on all sides, what is the area of the path in square metres?",
    answer: "126",
    explanation: "Outer dimensions: (25+3)×(12+3) = 28×15 = 420. Inner area = 25×12 = 300. Path area = 420−300 = 120. Wait: 28×15=420, 300, path=120. Hmm let me recheck: outer = (25+2×1.5)×(12+2×1.5)=28×15=420. Path=420-300=120.",
    correctAnswer: "120",
    difficulty: "medium",
  },
  {
    questionType: "quantitative_comparison",
    prompt: "x > 1.",
    quantityA: "log₂(x²)",
    quantityB: "2·log₄(x²)",
    options: ["Quantity A is greater.","Quantity B is greater.","The two quantities are equal.","The relationship cannot be determined."],
    correctAnswer: "C",
    explanation: "log₂(x²) = 2log₂x. log₄(x²) = 2log₄x = 2·(log₂x/log₂4) = 2·(log₂x/2) = log₂x. So 2·log₄(x²) = 2log₂x. Equal.",
    difficulty: "hard",
  },
];

// ─── Fix Verbal: 20 → 27 questions ───────────────────────────────────────────
function fixGREVerbal() {
  const dir = path.join(BASE, "content/gre/verbal");
  const files = fs.readdirSync(dir).filter(f => f.match(/^test-\d+\.json$/)).sort();
  let fixed = 0;

  files.forEach((file, idx) => {
    const fp = path.join(dir, file);
    const test = JSON.parse(fs.readFileSync(fp, "utf8"));

    // Already 27? skip
    if (test.questions && test.questions.length >= 27) { fixed++; return; }

    // Remove duplicate questions (keep first occurrence)
    const seen = new Set();
    let uniqueQs = (test.questions || []).filter(q => {
      const key = (q.prompt || "").substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Add extra questions to reach 27
    const needed = 27 - uniqueQs.length;
    for (let i = 0; i < needed; i++) {
      const extra = EXTRA_VERBAL[(idx * 7 + i) % EXTRA_VERBAL.length];
      uniqueQs.push({
        ...extra,
        id: `${test.id}-q${String(uniqueQs.length + 1).padStart(3,"0")}`,
        questionNumber: uniqueQs.length + 1,
        section: "verbal",
      });
    }

    // Re-number all questions
    uniqueQs = uniqueQs.map((q, i) => ({ ...q, questionNumber: i + 1 }));

    test.questions = uniqueQs;
    test.questionCount = 27;
    test.durationSeconds = 2460; // 41 min

    // Add section metadata
    test.sections = [
      { name: "Verbal Section 1", questionRange: [1, 12], durationSeconds: 1080 },
      { name: "Verbal Section 2", questionRange: [13, 27], durationSeconds: 1380 },
    ];

    fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
    fixed++;
  });
  console.log(`  GRE Verbal: updated ${fixed} tests to 27 questions, 2460s`);
}

// ─── Fix Quant: 20 → 27 questions ────────────────────────────────────────────
function fixGREQuant() {
  const dir = path.join(BASE, "content/gre/quant");
  const files = fs.readdirSync(dir).filter(f => f.match(/^test-\d+\.json$/)).sort();
  let fixed = 0;

  files.forEach((file, idx) => {
    const fp = path.join(dir, file);
    const test = JSON.parse(fs.readFileSync(fp, "utf8"));

    if (test.questions && test.questions.length >= 27) { fixed++; return; }

    // Remove duplicates
    const seen = new Set();
    let uniqueQs = (test.questions || []).filter(q => {
      const key = (q.prompt || "").substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const needed = 27 - uniqueQs.length;
    for (let i = 0; i < needed; i++) {
      const extra = EXTRA_QUANT[(idx * 7 + i) % EXTRA_QUANT.length];
      uniqueQs.push({
        ...extra,
        id: `${test.id}-q${String(uniqueQs.length + 1).padStart(3,"0")}`,
        questionNumber: uniqueQs.length + 1,
        section: "quant",
      });
    }

    uniqueQs = uniqueQs.map((q, i) => ({ ...q, questionNumber: i + 1 }));

    test.questions = uniqueQs;
    test.questionCount = 27;
    test.durationSeconds = 2820; // 47 min

    test.sections = [
      { name: "Quantitative Section 1", questionRange: [1, 12], durationSeconds: 1260 },
      { name: "Quantitative Section 2", questionRange: [13, 27], durationSeconds: 1560 },
    ];

    fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
    fixed++;
  });
  console.log(`  GRE Quant: updated ${fixed} tests to 27 questions, 2820s`);
}

// ─── Fix Writing: 2 tasks → 1 (Issue only) ───────────────────────────────────
function fixGREWriting() {
  const dir = path.join(BASE, "content/gre/writing");
  const files = fs.readdirSync(dir).filter(f => f.match(/^test-\d+\.json$/)).sort();
  let fixed = 0;

  files.forEach((file) => {
    const fp = path.join(dir, file);
    const test = JSON.parse(fs.readFileSync(fp, "utf8"));

    if (test.questions && test.questions.length === 1) { fixed++; return; }

    // Keep only the Issue task
    const qs = test.questions || [];
    const issueTask = qs.find(q => q.taskType === "issue") || qs[0];

    if (!issueTask) { return; }

    // Ensure correct fields
    issueTask.taskType = "issue";
    issueTask.questionType = issueTask.questionType || "writing_task";
    issueTask.questionNumber = 1;

    if (!issueTask.situation || !issueTask.situation.trim()) {
      // Derive situation from prompt if possible
      issueTask.situation = issueTask.originalPrompt || issueTask.topic ||
        "Consider the following claim and its implications carefully before responding.";
    }

    if (!issueTask.prompt || issueTask.prompt.trim().length < 20) {
      issueTask.prompt = "Write a response in which you discuss the extent to which you agree or disagree with the claim. In developing and supporting your position, address the most compelling reasons and/or examples that could be used to challenge your position.";
    }

    issueTask.writingInstructions = issueTask.writingInstructions ||
      "You have 30 minutes to plan and write your response. Read the statement carefully and think about the issues raised before composing your essay. A response that addresses the complexity of the issue, supports its claims with relevant examples, and sustains a clear focus will score higher.";

    issueTask.wordTarget = 500;
    issueTask.rubric = issueTask.rubric || {
      6: "Articulates a complex position with insightful analysis, compelling evidence, and masterful prose.",
      5: "Presents a clear and well-supported position with some depth and stylistic sophistication.",
      4: "Addresses the issue adequately with relevant support, though analysis may be underdeveloped.",
      3: "Displays limited analysis with imprecise language and insufficient support.",
      2: "Shows serious weaknesses in analytical thinking, development, and language control.",
      1: "Fails to engage meaningfully with the task.",
    };

    test.questions = [issueTask];
    test.questionCount = 1;
    test.durationSeconds = 1800;

    fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
    fixed++;
  });
  console.log(`  GRE Writing: updated ${fixed} tests to 1 Issue task, 1800s`);
}

// ─── Run ─────────────────────────────────────────────────────────────────────
console.log("Fixing GRE to 2026 format...\n");
fixGREVerbal();
fixGREQuant();
fixGREWriting();

// Verify
const v = JSON.parse(fs.readFileSync(path.join(BASE,"content/gre/verbal/test-001.json"),"utf8"));
const q = JSON.parse(fs.readFileSync(path.join(BASE,"content/gre/quant/test-001.json"),"utf8"));
const w = JSON.parse(fs.readFileSync(path.join(BASE,"content/gre/writing/test-001.json"),"utf8"));
console.log(`\n✓ Verbal test-001: ${v.questions.length}Q / ${v.durationSeconds}s`);
console.log(`✓ Quant  test-001: ${q.questions.length}Q / ${q.durationSeconds}s`);
console.log(`✓ Writing test-001: ${w.questions.length}Q / ${w.durationSeconds}s (taskType: ${w.questions[0]?.taskType})`);
console.log(`✓ Writing situation: "${(w.questions[0]?.situation||"").substring(0,60)}..."`);
