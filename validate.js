const fs = require('fs');
let bad = 0, tot = 0;
for(let n = 1; n <= 3; n++) {
  const t = JSON.parse(fs.readFileSync('C:/Users/naras/OneDrive/Desktop/LandingPrep/content/act/reading/test-00' + n + '.json', 'utf8'));
  const pids = new Set(t.passages.map(p => p.id));
  if(t.questions.length !== 40) console.log('COUNT', n, t.questions.length);
  if(t.passages.length !== 4) console.log('PCOUNT', n, t.passages.length);
  for(const q of t.questions) {
    tot++;
    if(!Array.isArray(q.options) || q.options.length !== 4) {
      bad++;
      console.log('OPTS', q.id);
    }
    if(!q.options.includes(q.correctAnswer)) {
      bad++;
      console.log('ANS', q.id);
    }
    if(!pids.has(q.passageId)) {
      bad++;
      console.log('PID', q.id);
    }
  }
}
console.log('total', tot, 'bad', bad);
