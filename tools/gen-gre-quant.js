// gen-gre-quant.js — regenerate GRE Quant BASE questions (problem_solving,
// quantitative_comparison, numeric_entry) with answers COMPUTED IN CODE, so every
// answer is correct by construction. Replaces AI-authored questions that had wrong
// answers. Seeded RNG → reproducible. Each test gets 24 base Qs; gen-gre-di.js then
// swaps the last 3 for a Data-Interpretation set (→ 27 total, the real GRE Quant count).
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "content", "gre", "quant");
const NUM_TESTS = 30;
const BASE_PER_TEST = 24;

// ── seeded RNG (mulberry32) ─────────────────────────────────────────────────
function rng(seed) {
  let s = seed >>> 0;
  return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const primesBetween = (lo, hi) => { let c = 0; for (let i = lo; i <= hi; i++) if (isPrime(i)) c++; return c; };

// Build a unique, shuffled option list that ALWAYS contains the correct answer.
function opts(R, correct, distractors, fmt = (x) => String(x)) {
  const set = new Map();
  set.set(fmt(correct), true);
  for (const d of distractors) { const k = fmt(d); if (!set.has(k)) set.set(k, false); if (set.size >= 5) break; }
  // pad if not enough distinct distractors
  let pad = (typeof correct === "number") ? correct : 0; let guard = 0;
  while (set.size < 5 && guard++ < 50) { pad += 1 + Math.floor(R() * 4); const k = fmt(pad); if (!set.has(k)) set.set(k, false); }
  const arr = [...set.keys()];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return { options: arr, correctAnswer: fmt(correct) };
}
const ri = (R, lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
const money = (x) => "$" + (Number.isInteger(x) ? x : x.toFixed(2));

// ── Templates: each returns {questionType, prompt, options, correctAnswer, explanation} ──
const T = {
  work_rate(R) {
    const k = ri(R, 2, 3), T = [12, 16, 18, 20, 24][ri(R, 0, 4)];
    const ans = T * (k + 1) / k; // faster worker alone
    const o = opts(R, ans, [T, T * 2, T * (k + 1), Math.round(T * k / (k + 1)), ans + k]);
    return { questionType: "problem_solving", prompt: `Sofia can assemble a bookcase ${k === 2 ? "twice" : k + " times"} as fast as Marcus. Working together they finish one in ${T} hours. How many hours would Sofia take alone?`, ...o, explanation: `Let Marcus's rate be r. Sofia's is ${k}r, so together (${k + 1})r = 1/${T}, giving r = 1/${T * (k + 1)}. Sofia's rate ${k}r = ${k}/${T * (k + 1)} = 1/${ans}, so Sofia alone takes ${ans} hours.` };
  },
  ratio_add(R) {
    // pick a coprime ratio a:b with a < b (already in lowest terms, never degenerate)
    const pairs = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 7], [4, 7], [5, 7], [2, 7], [5, 8]];
    const [a, b] = pairs[ri(R, 0, pairs.length - 1)];
    const m = ri(R, 4, 12), x = ri(R, 5, 25);
    const first = a * m, second = b * m, nf = first + x;
    const g = gcd(nf, second), c = nf / g, d = second / g;
    const o = opts(R, second, [first, nf, second + x, second - x, b * (m + 1)]);
    return { questionType: "problem_solving", prompt: `The ratio of blue to red marbles is ${a} to ${b}. If ${x} blue marbles are added, the ratio becomes ${c} to ${d}. How many red marbles are there?`, ...o, explanation: `Let blue = ${a}k and red = ${b}k. After adding ${x}: (${a}k+${x})/(${b}k) = ${c}/${d}, which gives k = ${m}. Red = ${b}×${m} = ${second}.` };
  },
  mod_crt(R) {
    const d1 = 7, d2 = 8, lo = 30, hi = 70;
    let n = ri(R, lo + 1, hi - 1);
    const r1 = n % d1, r2 = n % d2, d3 = 9, ans = n % d3;
    const o = opts(R, ans, [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(v => v !== ans));
    return { questionType: "problem_solving", prompt: `Nina has n marbles where ${lo} < n < ${hi}. Divided among ${d1} children, ${r1} remain; divided among ${d2} children, ${r2} remain. How many remain if divided among ${d3} children?`, ...o, explanation: `The only n in range with n≡${r1} (mod ${d1}) and n≡${r2} (mod ${d2}) is ${n}. Then ${n} ÷ ${d3} leaves remainder ${ans}.` };
  },
  percent_of(R) {
    const p = [10, 12, 15, 20, 24, 25, 40][ri(R, 0, 6)], N = ri(R, 5, 40) * 10;
    const ans = p * N / 100;
    const o = opts(R, ans, [p * N / 10, p + N, N - p, ans * 2, ans / 2]);
    return { questionType: "problem_solving", prompt: `What is ${p}% of ${N}?`, ...o, explanation: `${p}% of ${N} = ${p}/100 × ${N} = ${ans}.` };
  },
  average_remove(R) {
    const n = ri(R, 4, 6), A = ri(R, 6, 14);
    const X = A + (ri(R, 0, 1) ? 1 : -1) * ri(R, 2, 5) * (n - 1); // keep new avg integer
    const ans = (n * A - X) / (n - 1);
    const o = opts(R, ans, [A, X, ans + 1, ans - 1, n * A - X]);
    return { questionType: "problem_solving", prompt: `The average of ${n} numbers is ${A}. If one number equal to ${X} is removed, what is the average of the remaining ${n - 1} numbers?`, ...o, explanation: `Total = ${n}×${A} = ${n * A}. Remove ${X}: remaining total ${n * A - X} over ${n - 1} numbers = ${ans}.` };
  },
  consecutive_sum(R) {
    const lo = -(ri(R, 20, 45)), hi = ri(R, 20, 40);
    let sum = 0; for (let x = lo + 1; x <= hi; x++) sum += x;
    const o = opts(R, sum, [sum + (lo), -(sum), sum - hi, sum + hi, sum - 1]);
    return { questionType: "problem_solving", prompt: `What is the sum of all integers x such that ${lo} < x ≤ ${hi}?`, ...o, explanation: `The integers run from ${lo + 1} to ${hi}. Pairing/series sum = ${sum}.` };
  },
  discount_tax(R) {
    const P = ri(R, 8, 30) * 10, d = [10, 20, 25, 30, 40][ri(R, 0, 4)], t = [5, 8, 10][ri(R, 0, 2)];
    const ans = Math.round(P * (1 - d / 100) * (1 + t / 100) * 100) / 100;
    const o = opts(R, ans, [P, P * (1 - d / 100), P * (1 + t / 100), ans + 10, ans - 5], money);
    return { questionType: "problem_solving", prompt: `A jacket priced at ${money(P)} is discounted by ${d}% and then taxed at ${t}%. What is the final price?`, ...o, explanation: `After ${d}% off: ${money(P * (1 - d / 100))}. After ${t}% tax: ${money(P * (1 - d / 100))} × ${1 + t / 100} = ${money(ans)}.` };
  },
  painters(R) {
    const p = [6, 7, 8, 9, 10, 12][ri(R, 0, 5)];
    const ans = p; // p painters, p walls, p days => 1 painter paints 1 wall in p days => p painters paint p walls in p days
    const o = opts(R, ans, [1, p - 1, p + 1, Math.round(p * p / (p - 1)) || p + 2, p * 2]);
    return { questionType: "problem_solving", prompt: `If ${p} painters can paint ${p} walls in ${p} days, how many days would it take ${p} painters to paint ${p} walls?`, ...o, explanation: `Each painter paints 1 wall in ${p} days. ${p} painters painting ${p} walls (one each) still take ${p} days.` };
  },
  fraction_of(R) {
    const b = ri(R, 3, 7), d = ri(R, 4, 8);
    const N = b * d * ri(R, 1, 4); // multiple of b and d
    const a = ri(R, 1, b - 1), c = ri(R, 1, d - 1);
    const V = a * N / b, ans = c * N / d;
    const o = opts(R, ans, [V, N, N - ans, ans + V, Math.round(ans / 2)]);
    return { questionType: "problem_solving", prompt: `If ${a}/${b} of a number is ${V}, what is ${c}/${d} of that number?`, ...o, explanation: `The number is ${V} ÷ ${a}/${b} = ${N}. Then ${c}/${d} × ${N} = ${ans}.` };
  },
  rect_sides(R) {
    const s = ri(R, 6, 18), extra = ri(R, 6, 22), l = s + extra;
    const P = 2 * (s + l), Ar = s * l;
    const o = opts(R, s, [l, P / 2, l - s, s + 2, l + 2]);
    return { questionType: "problem_solving", prompt: `The perimeter of a rectangle is ${P} and its area is ${Ar}. What is the length of its shorter side?`, ...o, explanation: `Sides sum to ${P / 2} and multiply to ${Ar}. They are ${s} and ${l}; the shorter side is ${s}.` };
  },
  avg_abc(R) {
    const m1 = ri(R, 30, 60), m2 = ri(R, 20, 50);
    const ans = 2 * (m1 - m2);
    const o = opts(R, ans, [m1 - m2, m1 + m2, 2 * (m2 - m1), ans + 2, ans - 2]);
    return { questionType: "problem_solving", prompt: `The average of a and b is ${m1}, and the average of b and c is ${m2}. What is a − c?`, ...o, explanation: `a+b = ${2 * m1} and b+c = ${2 * m2}. Subtracting: a − c = ${2 * m1} − ${2 * m2} = ${ans}.` };
  },
  workers_home(R) {
    const total = ri(R, 30, 60) * 10, car = ri(R, 8, 20) * 10, transit = ri(R, 5, 12) * 10, bike = ri(R, 2, 6) * 10;
    const home = total - car - transit - bike;
    if (home <= 0) return T.workers_home(R);
    const ans = Math.round(home / total * 1000) / 10;
    const o = opts(R, ans, [Math.round(car / total * 1000) / 10, Math.round(transit / total * 1000) / 10, ans + 5, ans - 5, 100 - ans], x => x + "%");
    return { questionType: "problem_solving", prompt: `A survey of ${total} workers found ${car} commute by car, ${transit} by public transit, and ${bike} by bicycle. The rest work from home. What percentage work from home?`, ...o, explanation: `Work from home = ${total} − ${car} − ${transit} − ${bike} = ${home}. As a percentage: ${home}/${total} = ${ans}%.` };
  },
  exp_sum(R) {
    const base = [3, 4, 5, 6][ri(R, 0, 3)];
    const ans = `${base}^(x+1)`;
    const o = opts(R, ans, [`${base}^x`, `${base * base}^x`, `${base}^(${base}x)`, `${base * 4}^x`, `${base}^(2x)`]);
    return { questionType: "problem_solving", prompt: `${Array(base).fill(`${base}^x`).join(" + ")} = ?`, ...o, explanation: `Adding ${base} copies of ${base}^x gives ${base} × ${base}^x = ${base}^1 × ${base}^x = ${base}^(x+1).` };
  },
  passed_ratio(R) {
    const p = ri(R, 3, 7), f = ri(R, 2, 6), unit = ri(R, 3, 8);
    const total = (p + f) * unit, ans = p * unit;
    const o = opts(R, ans, [f * unit, total, total - ans, ans + unit, ans - unit]);
    return { questionType: "numeric_entry", prompt: `In a class of ${total} students, the ratio of those who passed to those who failed is ${p}:${f}. How many students passed?`, ...o, explanation: `Total parts = ${p + f}, each part = ${total}/${p + f} = ${unit}. Passed = ${p} × ${unit} = ${ans}.` };
  },
  linear_sq(R) {
    const x = ri(R, 2, 9), a = ri(R, 2, 6), b = ri(R, 1, 9);
    // a*x + c1 = b2*x + c2 ; build so solution is x
    const lc = a, rc = ri(R, 1, a - 1) || 1; // left coeff > right coeff
    const c1 = ri(R, 1, 9), c2 = c1 + (lc - rc) * x;
    const ans = x * x;
    const o = opts(R, ans, [x, 2 * x, x * x + x, x * x - 1, (x + 1) * (x + 1)]);
    return { questionType: "numeric_entry", prompt: `If ${lc}x + ${c1} = ${rc}x + ${c2}, what is the value of x²?`, ...o, explanation: `${lc}x − ${rc}x = ${c2} − ${c1} → ${lc - rc}x = ${c2 - c1} → x = ${x}. So x² = ${ans}.` };
  },
  hypotenuse(R) {
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]];
    const [a, b, c] = triples[ri(R, 0, triples.length - 1)];
    const o = opts(R, c, [a + b, c + 1, c - 1, Math.round(Math.sqrt(a * a + b * b)) + 2, a + b - 1]);
    return { questionType: "numeric_entry", prompt: `A right triangle has legs of length ${a} and ${b}. What is the length of the hypotenuse?`, ...o, explanation: `Hypotenuse = √(${a}² + ${b}²) = √${a * a + b * b} = ${c}.` };
  },
  qc_squares(R) {
    const ans = "Quantity A is greater";
    const o = { options: ["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "The relationship cannot be determined"], correctAnswer: ans };
    return { questionType: "quantitative_comparison", prompt: `x is a positive integer.\nQuantity A: (x + 3)²\nQuantity B: x² + 9`, ...o, explanation: `(x+3)² = x² + 6x + 9. Since x ≥ 1, 6x > 0, so Quantity A exceeds x² + 9. Quantity A is greater.` };
  },
  qc_primes(R) {
    const lo1 = 20, hi1 = 40, lo2 = 10, hi2 = 20;
    const cA = primesBetween(lo1, hi1), cB = primesBetween(lo2, hi2);
    const ans = cA > cB ? "Quantity A is greater" : cA < cB ? "Quantity B is greater" : "The two quantities are equal";
    const o = { options: ["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "The relationship cannot be determined"], correctAnswer: ans };
    return { questionType: "quantitative_comparison", prompt: `Quantity A: the number of prime numbers between ${lo1} and ${hi1}.\nQuantity B: the number of prime numbers between ${lo2} and ${hi2}.`, ...o, explanation: `Primes 20–40: 23, 29, 31, 37 (${cA}). Primes 10–20: 11, 13, 17, 19 (${cB}). They are equal.` };
  },
  qc_distance(R) {
    const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13]];
    const [a, b, c] = triples[ri(R, 0, triples.length - 1)];
    const ans = "The two quantities are equal";
    const o = { options: ["Quantity A is greater", "Quantity B is greater", "The two quantities are equal", "The relationship cannot be determined"], correctAnswer: ans };
    return { questionType: "quantitative_comparison", prompt: `Point P = (${a}, −${b}).\nQuantity A: the distance from P to the origin.\nQuantity B: ${c}`, ...o, explanation: `Distance = √(${a}² + ${b}²) = √${a * a + b * b} = ${c}, which equals Quantity B. The two quantities are equal.` };
  },
};

// Per-test template plan (24 base questions; mix of types, drawn with variety).
const PS = ["work_rate", "ratio_add", "mod_crt", "percent_of", "average_remove", "consecutive_sum", "discount_tax", "painters", "fraction_of", "rect_sides", "avg_abc", "workers_home", "exp_sum"];
const QC = ["qc_squares", "qc_primes", "qc_distance"];
const NE = ["passed_ratio", "linear_sq", "hypotenuse"];

const errors = [];
let written = 0;
for (let t = 0; t < NUM_TESTS; t++) {
  const num = String(t + 1).padStart(3, "0");
  const R = rng(1000 + t * 97);
  const plan = [];
  // 16 problem_solving + 3 QC (one of each distinct, no repeats) + 5 numeric_entry = 24
  for (let i = 0; i < 16; i++) plan.push(PS[(t + i) % PS.length]);
  for (const qc of QC) plan.push(qc);                 // each QC template exactly once
  for (let i = 0; i < 5; i++) plan.push(NE[(t + i) % NE.length]);

  const questions = [], seenPrompt = new Set();
  const pkey = (p) => p.trim().toLowerCase().slice(0, 100); // match the validator's dedup rule
  for (let i = 0; i < plan.length; i++) {
    let q, tries = 0;
    do { q = T[plan[i]](R); tries++; } while (seenPrompt.has(pkey(q.prompt)) && tries < 25);
    seenPrompt.add(pkey(q.prompt));
    // validate: answer in options, options unique, 4-5 options
    if (!q.options.includes(q.correctAnswer)) errors.push(`test-${num} q${i + 1} (${plan[i]}): answer not in options`);
    if (new Set(q.options).size !== q.options.length) errors.push(`test-${num} q${i + 1} (${plan[i]}): duplicate options`);
    if (q.options.length < 4) errors.push(`test-${num} q${i + 1} (${plan[i]}): <4 options`);
    questions.push({
      id: `gre-quant-${num}-q${String(i + 1).padStart(2, "0")}`,
      questionType: q.questionType, topic: q.questionType === "quantitative_comparison" ? "Quantitative Comparison" : q.questionType === "numeric_entry" ? "Numeric Entry" : "Problem Solving",
      prompt: q.prompt, difficulty: "medium", options: q.options, correctAnswer: q.correctAnswer,
      explanation: q.explanation, questionNumber: i + 1,
    });
  }

  const file = path.join(DIR, `test-${num}.json`);
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const out = {
    id: `gre-quant-${num}`, exam: "gre", section: "quant", type: "section",
    title: `GRE Quantitative Practice Test ${t + 1}`,
    durationSeconds: existing.durationSeconds || 2820, questionCount: questions.length,
    instructions: existing.instructions || "Read each question carefully. Some questions include their own data.",
    questions,
  };
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  written++;
}

if (errors.length) { console.error(`✗ ${errors.length} errors:`); errors.slice(0, 25).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Regenerated ${written} GRE Quant tests with ${BASE_PER_TEST} computed-answer base questions each (run gen-gre-di.js next to add the DI set).`);
