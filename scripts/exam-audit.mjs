import fs from "node:fs";
const ROOT="C:/Users/naras/OneDrive/Desktop/LandingPrep";
const noop=()=>{}; const React=new Proxy({createElement:noop,Fragment:"f"},{get:(t,k)=>k in t?t[k]:((...a)=>a)});
global.React=React; global.window={React,addEventListener:noop,location:{href:""},matchMedia:()=>({matches:false,addEventListener:noop})};
global.document={createElement:()=>({}),getElementById:()=>null,addEventListener:noop};
try{Object.defineProperty(globalThis,"navigator",{value:{userAgent:"",language:"en"},configurable:true});}catch(e){}
global.localStorage={getItem:()=>null,setItem:noop};
const run=f=>{try{eval(fs.readFileSync(ROOT+"/"+f,"utf8"));}catch(e){console.log("EVAL ERR",f,e.message);}};
run("data-questions.js");run("exam-extra.js");run("screens/mock-test.js");
const build=window.LP_buildTest;
// answer present if ANY type-appropriate field exists
const hasAns=q=> q.answer!==undefined||q.correctAnswer!==undefined||Array.isArray(q.answers)||Array.isArray(q.sentences)||Array.isArray(q.incorrectWords)||q.modelAnswer!==undefined||Array.isArray(q.fields)||q.type==="form_completion"||q.type==="table_completion";
// full-content fingerprint (so same-prompt-different-content is NOT a dup)
const fp=q=>JSON.stringify([q.text||q.prompt||"",q.options||q.sentences||q.rows||"",q.answer??q.answers??q.correctAnswer??""]);
const allQ=sec=>{const o=[];(sec.parts||[]).forEach(p=>(p.questions||[]).forEach(q=>o.push(q)));(sec.passages||[]).forEach(p=>(p.questions||[]).forEach(q=>o.push(q)));(sec.questions||[]).forEach(q=>o.push(q));return o;};
const unknownTypes={};
for(const ex of ["ielts","toefl","pte","gre","gmat","celpip","duolingo"]){
  const cfg=build(ex,"full"); console.log("\n══ "+ex.toUpperCase()+" ══");
  for(const sec of cfg.sections){
    const isWS=/writing|speaking/.test(sec.type||"");
    if(isWS){ console.log("  ✅ "+(sec.name)+" — "+((sec.tasks||sec.cards||[]).length)+" tasks"); continue; }
    const qs=allQ(sec);
    const fps=qs.map(fp); const realdup=fps.filter((x,i)=>fps.indexOf(x)!==i).length;
    const noans=qs.filter(q=>!hasAns(q)).length;
    qs.forEach(q=>{ if(!q.options&&!q.sentences&&!q.statements&&!q.rows&&q.type!=="fill"&&q.type!=="sent_fill"&&q.type!=="form_field"&&!Array.isArray(q.incorrectWords)&&!q.answers){ /*track*/ } });
    // collect distinct types
    qs.forEach(q=>{ unknownTypes[ex]=unknownTypes[ex]||{}; unknownTypes[ex][q.type]=(unknownTypes[ex][q.type]||0)+1; });
    const iss=[]; if(realdup)iss.push(realdup+" TRUE-DUP"); if(noans)iss.push(noans+" no-answer");
    console.log("  "+(iss.length?"⚠️":"✅")+" "+(sec.name)+" — "+qs.length+" Qs"+(iss.length?" → "+iss.join(", "):""));
  }
}
console.log("\n══ question types per exam ══");
for(const ex in unknownTypes) console.log("  "+ex+": "+Object.entries(unknownTypes[ex]).map(([t,n])=>t+"×"+n).join(", "));
