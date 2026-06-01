/**
 * rebuild-gmat-quant-ps.js
 * GMAT Focus Edition Quant = Problem Solving ONLY (21 questions, 45 min).
 * Fixes two confirmed bugs:
 *   1. Old files mixed in data_sufficiency / quantitative_comparison / numeric_entry
 *      (the last two are GRE types that don't belong in GMAT at all).
 *   2. Old files stored the key in `answer` but the engine grades on `correctAnswer`,
 *      so every Quant question was effectively ungraded. We now write `correctAnswer`
 *      (exact option text) AND a consistent top-level answerKey.
 *
 * Run: node tools/rebuild-gmat-quant-ps.js
 */
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..", "content", "gmat", "quant");

// Verified Problem-Solving bank. correct = exact option string.
const BANK = [
  { p: "A store sells notebooks for $3.50 each and pens for $1.25 each. Maria buys 4 notebooks and 6 pens. What is the total cost?",
    o: ["$14.00","$18.50","$21.50","$19.25","$20.00"], a: "$21.50",
    e: "Notebooks: 4 × $3.50 = $14.00. Pens: 6 × $1.25 = $7.50. Total = $14.00 + $7.50 = $21.50." },
  { p: "A car travels 240 miles in 4 hours, then 180 miles in 3 hours. What is its average speed for the entire trip?",
    o: ["55 mph","58 mph","60 mph","65 mph","70 mph"], a: "60 mph",
    e: "Total distance = 240 + 180 = 420 miles. Total time = 4 + 3 = 7 hours. Average = 420 ÷ 7 = 60 mph." },
  { p: "If 40% of a number is 64, what is 75% of that number?",
    o: ["96","100","108","120","128"], a: "120",
    e: "0.40x = 64 → x = 160. 75% of 160 = 0.75 × 160 = 120." },
  { p: "One pipe fills a tank in 6 hours; another drains it in 9 hours. If both run on an empty tank, how long to fill it?",
    o: ["3 hours","12 hours","15 hours","18 hours","21 hours"], a: "18 hours",
    e: "Net rate = 1/6 − 1/9 = 3/18 − 2/18 = 1/18 tank per hour. Time = 18 hours." },
  { p: "A price is increased by 20% and then decreased by 25%. If the original price was $200, what is the final price?",
    o: ["$170","$180","$190","$200","$210"], a: "$180",
    e: "200 × 1.20 = 240; 240 × 0.75 = 180. (Net factor 1.2 × 0.75 = 0.9, a 10% drop.)" },
  { p: "$1,000 is invested at 10% annual interest compounded yearly. How much interest is earned after 2 years?",
    o: ["$200","$210","$220","$240","$260"], a: "$210",
    e: "Amount = 1000 × 1.10² = 1000 × 1.21 = 1210. Interest = 1210 − 1000 = 210." },
  { p: "The average of 5 numbers is 20. If the number 40 is removed, what is the average of the remaining 4 numbers?",
    o: ["12","15","16","18","20"], a: "15",
    e: "Sum of 5 = 5 × 20 = 100. Remove 40 → 60 left over 4 numbers. Average = 60 ÷ 4 = 15." },
  { p: "Two amounts are in the ratio 3 : 5 and total 64. What is the difference between them?",
    o: ["8","12","16","20","24"], a: "16",
    e: "Parts = 3 + 5 = 8 → each part = 64 ÷ 8 = 8. Amounts: 24 and 40. Difference = 40 − 24 = 16." },
  { p: "A rectangle has length 12 and width 8. What is the sum of its area and perimeter?",
    o: ["96","120","136","140","152"], a: "136",
    e: "Area = 12 × 8 = 96. Perimeter = 2(12 + 8) = 40. Sum = 96 + 40 = 136." },
  { p: "What is the value of 2^5 × 2^3?",
    o: ["64","128","256","512","1024"], a: "256",
    e: "2^5 × 2^3 = 2^(5+3) = 2^8 = 256." },
  { p: "If x + y = 10 and x − y = 4, what is the value of xy?",
    o: ["18","21","24","27","30"], a: "21",
    e: "Adding: 2x = 14 → x = 7. Then y = 3. xy = 7 × 3 = 21." },
  { p: "What is 15% of 15% of 400?",
    o: ["6","9","12","15","18"], a: "9",
    e: "15% of 400 = 60. 15% of 60 = 9." },
  { p: "A shirt is marked $80. It is discounted 25%, then 5% sales tax is added. What is the final price?",
    o: ["$57","$60","$63","$66","$70"], a: "$63",
    e: "Discount: 80 × 0.75 = 60. Tax: 60 × 1.05 = 63." },
  { p: "A car travels at a constant 60 mph for 2.5 hours. How far does it travel?",
    o: ["120 miles","135 miles","150 miles","165 miles","180 miles"], a: "150 miles",
    e: "Distance = speed × time = 60 × 2.5 = 150 miles." },
  { p: "A 40-litre solution is 25% acid. How many litres of pure acid does it contain?",
    o: ["8","10","12","15","16"], a: "10",
    e: "Acid = 25% of 40 = 0.25 × 40 = 10 litres." },
  { p: "A bag holds 3 red and 2 blue marbles. If one marble is drawn at random, what is the probability it is red?",
    o: ["1/5","2/5","1/2","3/5","2/3"], a: "3/5",
    e: "P(red) = favourable ÷ total = 3 ÷ (3 + 2) = 3/5." },
  { p: "In an arithmetic sequence the first term is 5 and the common difference is 3. What is the 10th term?",
    o: ["29","30","32","35","38"], a: "32",
    e: "aₙ = a₁ + (n−1)d = 5 + 9 × 3 = 5 + 27 = 32." },
  { p: "What is the sum of the integers from 1 to 50 inclusive?",
    o: ["1175","1225","1250","1275","1300"], a: "1275",
    e: "Sum = n(n+1)/2 = 50 × 51 ÷ 2 = 1275." },
  { p: "If x = 5, what is the value of x² − 9?",
    o: ["12","14","16","18","20"], a: "16",
    e: "x² − 9 = 25 − 9 = 16." },
  { p: "30 is what percent of 120?",
    o: ["20%","25%","30%","35%","40%"], a: "25%",
    e: "30 ÷ 120 = 0.25 = 25%." },
  { p: "If 3 workers can build a wall in 12 days, how many days would 4 workers take, working at the same rate?",
    o: ["8 days","9 days","10 days","11 days","16 days"], a: "9 days",
    e: "Work = 3 × 12 = 36 worker-days. With 4 workers: 36 ÷ 4 = 9 days." },
  { p: "If 12 men finish a job in 10 days, how many men are needed to finish it in 8 days?",
    o: ["13","14","15","16","18"], a: "15",
    e: "Work = 12 × 10 = 120 man-days. For 8 days: 120 ÷ 8 = 15 men." },
  { p: "An item costing $50 is sold for $65. What is the profit percentage?",
    o: ["15%","20%","25%","30%","35%"], a: "30%",
    e: "Profit = 65 − 50 = 15. Profit % = 15 ÷ 50 = 30%." },
  { p: "What is the median of the set {3, 7, 9, 12, 15}?",
    o: ["7","9","10","11","12"], a: "9",
    e: "With 5 ordered values, the median is the 3rd value, which is 9." },
  { p: "If 3x = 18, what is the value of x² + x?",
    o: ["36","40","42","48","54"], a: "42",
    e: "x = 6. x² + x = 36 + 6 = 42." },
  { p: "A triangle has a base of 10 and a height of 6. What is its area?",
    o: ["24","28","30","36","60"], a: "30",
    e: "Area = ½ × base × height = ½ × 10 × 6 = 30." },
  { p: "A circle has radius 7. Using π = 22/7, what is its area?",
    o: ["132","144","154","168","176"], a: "154",
    e: "Area = πr² = (22/7) × 49 = 22 × 7 = 154." },
  { p: "A car consumes 8 litres of fuel per 100 km. How much fuel is needed for a 250 km trip?",
    o: ["16 litres","18 litres","20 litres","22 litres","24 litres"], a: "20 litres",
    e: "Fuel = 8 × (250 ÷ 100) = 8 × 2.5 = 20 litres." },
  { p: "What is the value of 5! (5 factorial)?",
    o: ["60","100","120","150","720"], a: "120",
    e: "5! = 5 × 4 × 3 × 2 × 1 = 120." },
  { p: "What is the least common multiple (LCM) of 4, 6, and 8?",
    o: ["12","16","20","24","48"], a: "24",
    e: "Multiples of 8: 8, 16, 24 … 24 is divisible by 4 and 6, so LCM = 24." },
  { p: "What is the greatest common divisor (GCD) of 24 and 36?",
    o: ["6","8","12","18","24"], a: "12",
    e: "24 = 12 × 2, 36 = 12 × 3. The largest common factor is 12." },
  { p: "Three-quarters of a number is 60. What is the number?",
    o: ["70","75","80","85","90"], a: "80",
    e: "(3/4)x = 60 → x = 60 × 4 ÷ 3 = 80." },
  { p: "If a : b = 2 : 3 and b : c = 4 : 5, what is a : c?",
    o: ["2 : 5","8 : 15","6 : 5","3 : 5","8 : 5"], a: "8 : 15",
    e: "Make b common: a:b = 8:12, b:c = 12:15. So a:c = 8:15." },
  { p: "A rectangular box measures 2 × 3 × 4. What is its volume?",
    o: ["9","12","18","24","36"], a: "24",
    e: "Volume = length × width × height = 2 × 3 × 4 = 24." },
  { p: "If 20% of the students in a school is 120, how many students are there in total?",
    o: ["480","540","600","640","720"], a: "600",
    e: "0.20 × total = 120 → total = 120 ÷ 0.20 = 600." },
  { p: "A traveller drives to a town at 60 mph and returns along the same road at 40 mph. What is the average speed for the round trip?",
    o: ["45 mph","48 mph","50 mph","52 mph","55 mph"], a: "48 mph",
    e: "Round-trip average = 2·v₁·v₂ ÷ (v₁+v₂) = 2 × 60 × 40 ÷ 100 = 4800 ÷ 100 = 48 mph." },
  { p: "What is the simple interest on $2,000 at 5% per year for 3 years?",
    o: ["$200","$250","$300","$350","$400"], a: "$300",
    e: "SI = P × r × t = 2000 × 0.05 × 3 = 300." },
  { p: "If 5 identical pens cost $20, how much do 8 of the same pens cost?",
    o: ["$28","$30","$32","$36","$40"], a: "$32",
    e: "Unit price = 20 ÷ 5 = $4. 8 pens = 8 × 4 = $32." },
  { p: "A tank is 3/5 full. Adding 20 litres makes it 4/5 full. What is the tank's total capacity?",
    o: ["80 litres","90 litres","100 litres","110 litres","120 litres"], a: "100 litres",
    e: "4/5 − 3/5 = 1/5 of capacity = 20 litres → capacity = 20 × 5 = 100 litres." },
  { p: "What is the value of √144 + √81?",
    o: ["15","18","20","21","25"], a: "21",
    e: "√144 = 12 and √81 = 9. 12 + 9 = 21." },
];

const PAD = n => String(n).padStart(3, "0");
let made = 0;

for (let i = 0; i < 30; i++) {
  const testNum = i + 1;
  const id = `gmat-quant-${PAD(testNum)}`;
  const start = (i * 21) % BANK.length;
  const questions = [];
  const answerKey = {};
  for (let k = 0; k < 21; k++) {
    const item = BANK[(start + k) % BANK.length];
    const qid = `${id}-q${PAD(k + 1)}`;
    questions.push({
      id: qid,
      questionNumber: k + 1,
      questionType: "problem_solving",
      section: "quant",
      prompt: item.p,
      options: item.o.slice(),
      correctAnswer: item.a,
      answer: ["A","B","C","D","E"][item.o.indexOf(item.a)],
      explanation: item.e,
      difficulty: "medium",
    });
    answerKey[qid] = item.a;
  }
  const out = {
    id,
    exam: "gmat",
    section: "quant",
    type: "section",
    title: `GMAT Focus Quant Practice Test ${testNum}`,
    durationSeconds: 2700,
    questionCount: 21,
    instructions: "GMAT Focus Edition Quantitative Reasoning: 21 Problem Solving questions, 45 minutes. An on-screen calculator is permitted.",
    questions,
    answerKey,
  };
  fs.writeFileSync(path.join(DIR, `test-${PAD(testNum)}.json`), JSON.stringify(out, null, 2), "utf8");
  made++;
}
console.log(`✓ Rebuilt ${made} GMAT Quant tests (Problem Solving only, correctAnswer set).`);
