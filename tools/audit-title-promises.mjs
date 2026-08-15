#!/usr/bin/env node
/**
 * Title-promise audit.
 *
 * Found by hand: 25 pages titled "<Field> in <Country> — Top Universities, Fees &
 * Requirements" that listed no universities at all. Short pages get caught by a word count;
 * a page that PROMISES something in its title and does not deliver it in the body does not,
 * because it is well-formed, well-linked, correctly sized and simply dishonest.
 *
 * That is the worst kind of page for a searcher: it wins the click and wastes the visit.
 *
 * Each rule is (promise in title) -> (evidence that must appear in <main>). Rules are
 * deliberately conservative — the evidence patterns are broad, so a hit means the page really
 * has nothing, not merely that it phrased things differently.
 */
import fs from "fs";
import path from "path";

const RULES = [
  { name: "promises universities", title: /\btop universities\b|\buniversities\b(?!\s*(?:in general|worldwide)\b)/i,
    evidence: /<a[^>]+href="\/university\/|QS\s*#|\bacceptance\b|<table/i },
  { name: "promises scholarships", title: /\bscholarships?\b/i,
    evidence: /\baward\b|\bdeadline\b|\bfunding\b|\beligibility\b|<table|<li/i },
  // "comparison" alone is unusable as a promise: GRE Quantitative COMPARISON is a question
  // type, not a comparison page. Only "X vs Y" is an actual promise to compare two things.
  { name: "promises a comparison", title: /\s\bvs\.?\b\s/i,
    evidence: /<table|\bwhereas\b|\bagainst\b|\bcompared\b/i },
  { name: "promises fees or cost", title: /\bfees?\b|\bcost\b|\btuition\b/i,
    evidence: /[$£€₹]|\bUSD\b|\bCAD\b|\bEUR\b|\bper year\b|\/yr\b|\btuition\b/i },
  { name: "promises a checklist or steps", title: /\bchecklist\b|\bstep[- ]by[- ]step\b|\bhow to\b/i,
    evidence: /<ol|<ul|\bstep\b/i },
  { name: "promises requirements", title: /\brequirements?\b/i,
    evidence: /\bIELTS\b|\bTOEFL\b|\bGPA\b|\bminimum\b|\brequire/i },
  { name: "promises a word list", title: /\bvocabulary\b|\bword list\b/i,
    evidence: /<div class="vrow"|<li|—/i },
  { name: "promises deadlines or intakes", title: /\bdeadlines?\b|\bintakes?\b/i,
    evidence: /\bJanuary\b|\bSeptember\b|\bFall\b|\bSpring\b|\bdeadline\b|<table/i },
];

const inSitemap = new Set(
  [...fs.readFileSync("sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
);

const findings = [];
for (const p of inSitemap) {
  const f = p.replace(/^\//, "") + "index.html";
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, "utf8");
  const tm = /<title>([\s\S]*?)<\/title>/i.exec(h);
  if (!tm) continue;
  const title = tm[1].replace(/&amp;/g, "&");
  const main = (h.match(/<main[\s\S]*?<\/main>/i) || [h])[0];
  // A hub page delivers its promise through LINKS rather than prose — /compare-universities/
  // lists 48 comparisons, /ielts-scores-for-universities/ links 164 university pages. Both
  // fully deliver their title; flagging them was the audit being wrong, not the pages.
  const internalLinks = (main.match(/href="\/[^"]*"/g) || []).length;
  if (internalLinks >= 20) continue;
  for (const r of RULES) {
    if (!r.title.test(title)) continue;
    if (r.evidence.test(main)) continue;
    findings.push({ p, rule: r.name, title: title.slice(0, 80) });
  }
}

console.log("\n──────── TITLE-PROMISE AUDIT ────────");
console.log(`indexed pages checked: ${inSitemap.size}`);
console.log(`promise rules: ${RULES.length}\n`);

if (!findings.length) {
  console.log("✓ every indexed page delivers what its title promises");
  process.exit(0);
}
const byRule = {};
for (const f of findings) (byRule[f.rule] = byRule[f.rule] || []).push(f);
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`  ${rule} — ${list.length} page(s)`);
  list.slice(0, 6).forEach((f) => console.log(`     ${f.p}\n        "${f.title}"`));
  if (list.length > 6) console.log(`     … and ${list.length - 6} more`);
  console.log("");
}
console.log(`${findings.length} page(s) whose title promises something the body does not contain.`);
console.log("Fix by adding the missing content, or by noindexing the page until it exists —");
console.log("never by weakening the rule to make the audit pass.");
process.exit(1);
