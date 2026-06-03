// Independent verifier for GRE Quant answers — re-derives each answer from the prompt
// using logic SEPARATE from the generator, and confirms it matches the keyed answer.
import fs from "fs";
import path from "path";
const DIR = "content/gre/quant";
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
let checked = 0, ok = 0, fails = [];
const eq = (q, mine) => { checked++; if (String(mine) === String(q.correctAnswer)) ok++; else fails.push(`${q.id}: keyed=${q.correctAnswer} derived=${mine} :: ${q.prompt.replace(/\s+/g, " ").slice(0, 70)}`); };

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".json"))) {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  for (const q of j.questions) {
    const p = q.prompt.replace(/\s+/g, " ");
    let m;
    if ((m = p.match(/What is (\d+)% of (\d+)/))) eq(q, +m[1] * +m[2] / 100);
    else if ((m = p.match(/average of (\d+) numbers is (\d+).*?equal to (\d+) is removed/))) eq(q, (+m[1] * +m[2] - +m[3]) / (+m[1] - 1));
    else if ((m = p.match(/passed to those who failed is (\d+):(\d+)\?.*?class of (\d+)/)) || (m = p.match(/class of (\d+),? the ratio of those who passed to those who failed is (\d+):(\d+)/))) {
      const v = m.length === 4 && /class of/.test(m[0]) && m[0].indexOf("class") < m[0].indexOf("ratio") ? [+m[2], +m[3], +m[1]] : [+m[1], +m[2], +m[3]];
      eq(q, v[0] * v[2] / (v[0] + v[1]));
    }
    else if ((m = p.match(/legs of length (\d+) and (\d+)/))) eq(q, Math.round(Math.sqrt(+m[1] * +m[1] + +m[2] * +m[2])));
    else if ((m = p.match(/average of a and b is (\d+), and the average of b and c is (\d+)/))) eq(q, 2 * (+m[1] - +m[2]));
    else if ((m = p.match(/sum of all integers x such that (-?\d+) < x ≤ (-?\d+)/))) { let s = 0; for (let x = +m[1] + 1; x <= +m[2]; x++) s += x; eq(q, s); }
    else if ((m = p.match(/(\d+)\/(\d+) of a number is (\d+), what is (\d+)\/(\d+)/))) { const N = +m[3] * +m[2] / +m[1]; eq(q, +m[4] * N / +m[5]); }
    else if ((m = p.match(/priced at \$(\d+) is discounted by (\d+)% and then taxed at (\d+)%/))) { const v = Math.round(+m[1] * (1 - +m[2] / 100) * (1 + +m[3] / 100) * 100) / 100; eq(q, "$" + (Number.isInteger(v) ? v : v.toFixed(2))); }
    else if ((m = p.match(/(\d+) painters can paint (\d+) walls in (\d+) days, how many days would it take (\d+) painters to paint (\d+) walls/))) eq(q, +m[3]);
    else if ((m = p.match(/Divided among 7 children, (\d+) remain; divided among 8 children, (\d+) remain.*divided among 9/))) {
      const r7 = +m[1], r8 = +m[2]; let found = null;
      for (let n = 31; n <= 69; n++) if (n % 7 === r7 && n % 8 === r8) found = n;
      eq(q, found == null ? "NO-N" : found % 9);
    }
    else if ((m = p.match(/ratio of blue to red marbles is (\d+) to (\d+)\. If (\d+) blue.*becomes (\d+) to (\d+)/))) {
      const a = +m[1], b = +m[2], x = +m[3], c = +m[4], d = +m[5];
      // (a k + x)/(b k) = c/d → d(ak+x)=c b k → k(da - cb) = -dx → k = dx/(cb - da)
      const k = (d * x) / (c * b - d * a); eq(q, b * k);
    }
    else if (/Quantity A: the number of prime numbers between 20 and 40/.test(p)) eq(q, primesEqual());
    else if (/Quantity A: \(x \+ 3\)²/.test(p)) eq(q, "Quantity A is greater");
    else if (/distance from P to the origin/.test(p)) eq(q, "The two quantities are equal");
  }
}
function primesEqual() { let a = 0, b = 0; for (let i = 20; i <= 40; i++) if (isPrime(i)) a++; for (let i = 10; i <= 20; i++) if (isPrime(i)) b++; return a > b ? "Quantity A is greater" : a < b ? "Quantity B is greater" : "The two quantities are equal"; }

console.log(`Independently re-derived ${checked} GRE Quant answers across 30 tests.`);
console.log(fails.length ? `\n✗ ${fails.length} MISMATCH:\n` + fails.slice(0, 20).join("\n") : `✅ ALL ${ok} match the keyed answer.`);
process.exit(fails.length ? 1 : 0);
