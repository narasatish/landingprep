// expand-listening-scripts.js
// Expands short IELTS listening scripts to realistic length (400-600 words per part)
// preserving all embedded answers.
// Usage: node tools/expand-listening-scripts.js --exam ielts [--from 1] [--to 30] [--key AIza...]
"use strict";
const fs   = require("fs");
const path = require("path");
const https = require("https");

const ROOT    = path.resolve(__dirname, "..");
const TRACKER = path.join(ROOT, "content", ".expanded-listening.json");

// CLI args
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => a.startsWith("--") ? [[a.slice(2), arr[i+1] || true]] : [])
);
const EXAM    = args.exam || "ielts";
const FROM    = parseInt(args.from || "1",  10);
const TO      = parseInt(args.to   || "30", 10);
const API_KEY = args.key || process.env.GEMINI_KEY || localStorage?.getItem?.("lp_gemini_key") || "";

if (!API_KEY || API_KEY.startsWith("YOUR_")) {
  console.error("❌ No API key. Usage: node tools/expand-listening-scripts.js --exam ielts --key AIzaSy...");
  process.exit(1);
}

// Load tracker
let tracker = {};
try { tracker = JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch (_) {}

function saveTracker() { fs.writeFileSync(TRACKER, JSON.stringify(tracker, null, 2)); }

// Post to Gemini API
function geminiCall(apiKey, prompt, model = "gemini-2.5-flash") {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    });
    const url = `/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const req = https.request({ hostname: "generativelanguage.googleapis.com", path: url, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      (res) => {
        let data = "";
        res.on("data", d => (data += d));
        res.on("end", () => {
          if (res.statusCode === 404) { reject(new Error("404: model not found")); return; }
          try {
            const j = JSON.parse(data);
            const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            resolve(text.trim());
          } catch (e) { reject(new Error("Parse error: " + data.slice(0, 200))); }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function callWithFallback(key, prompt) {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
  for (const m of models) {
    try {
      console.log(`  → trying ${m}…`);
      const r = await geminiCall(key, prompt, m);
      if (r && r.length > 100) { console.log(`  ✓ ${m} (${r.split(/\s+/).length}w)`); return r; }
    } catch (e) { console.log(`  ✗ ${m}: ${e.message}`); }
  }
  return null;
}

function buildPromptForPart(partNum, context, existingScript, answers, partPattern) {
  const partDescriptions = {
    1: "a conversation between TWO speakers (e.g. receptionist and customer, or two people making arrangements). IELTS Part 1 context: a form-filling or transactional conversation in a social or service setting.",
    2: "a MONOLOGUE by ONE speaker (e.g. a guided tour, information talk, radio broadcast, announcement). IELTS Part 2 context: a non-academic monologue.",
    3: "a conversation between TWO or THREE speakers in an academic or training context (e.g. students discussing a project, tutor giving feedback). IELTS Part 3 context: an academic discussion.",
    4: "a MONOLOGUE LECTURE by ONE speaker on an academic topic. IELTS Part 4 context: an academic lecture, complex and information-dense.",
  };
  const desc = partDescriptions[partNum] || partDescriptions[1];
  const answerList = answers.map((a, i) => `  ${i+1}. ${a.prompt} → answer: "${a.correctAnswer}"`).join("\n");

  return `You are writing a realistic IELTS Listening script for Part ${partNum}.

Context/title: "${context}"
Script type: ${desc}

The script MUST naturally embed ALL of the following answer phrases in the correct order:
${answerList}

Requirements:
- Total length: 400–550 words (a real IELTS recording runs 2–4 minutes at 130 wpm)
- Write it in a realistic spoken dialogue/monologue style, NOT an essay
- Use "Speaker A:" and "Speaker B:" labels for conversations (Parts 1 and 3); use "Lecturer:" or "Guide:" for monologues (Parts 2 and 4)
- The answers must appear naturally — embedded in context, not read out bluntly
- Do NOT use placeholder text like "[answer]". Write the actual answer words inline
- Include realistic fillers: small talk, pauses ("Hmm,"), corrections ("Sorry, let me check…"), and context around each answer
- Start the recording announcement: "Now you will hear Part ${partNum}." at the beginning
- End with the examiner saying something like "That is the end of Part ${partNum}."

Existing short draft (expand this significantly, keep the same answers):
"${existingScript}"

Write the full expanded realistic script now. Output ONLY the script text, nothing else.`;
}

async function processTest(fp, testNum) {
  const content = JSON.parse(fs.readFileSync(fp, "utf8"));
  const testId  = content.id;

  let changed = false;

  for (const script of (content.listeningScripts || [])) {
    const partNum = script.sectionPart;
    const trackerKey = `${testId}-p${partNum}`;

    if (tracker[trackerKey]) {
      console.log(`  [skip] Part ${partNum} already expanded`);
      continue;
    }
    if (script.script && script.script.split(/\s+/).length >= 350) {
      console.log(`  [skip] Part ${partNum} already long enough (${script.script.split(/\s+/).length}w)`);
      tracker[trackerKey] = true;
      saveTracker();
      continue;
    }

    // Gather answers for this part
    const partAnswers = (content.questions || [])
      .filter(q => q.part === partNum)
      .map(q => ({ prompt: q.prompt, correctAnswer: q.correctAnswer }));

    const group = (content.questionGroups || []).find(g => g.part === partNum) || {};
    const context = script.title || group.title || `Part ${partNum}`;
    const pattern = group.pattern || "";

    const prompt = buildPromptForPart(partNum, context, script.script || "", partAnswers, pattern);

    console.log(`  Part ${partNum} (${context}): expanding…`);
    const expanded = await callWithFallback(API_KEY, prompt);

    if (expanded && expanded.split(/\s+/).length >= 200) {
      script.script = expanded;
      changed = true;
      tracker[trackerKey] = true;
      saveTracker();
      console.log(`  ✓ Part ${partNum}: ${expanded.split(/\s+/).length}w`);
    } else {
      console.log(`  ✗ Part ${partNum}: expansion failed or too short`);
    }

    // Brief pause to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  if (changed) {
    fs.writeFileSync(fp, JSON.stringify(content, null, 2));
    console.log(`  💾 Saved ${path.basename(fp)}`);
  }
}

async function main() {
  const dir = path.join(ROOT, "content", EXAM, "listening");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort();

  let processed = 0;
  for (const f of files) {
    const n = parseInt(f.replace(/\D/g, ""), 10);
    if (n < FROM || n > TO) continue;
    console.log(`\n[${n}/${TO}] ${f}`);
    await processTest(path.join(dir, f), n);
    processed++;
  }
  console.log(`\n✅ Done. Processed ${processed} tests.`);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
