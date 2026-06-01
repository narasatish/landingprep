/**
 * fix-final-issues.js
 *
 * Fixes:
 * 1. CELPIP Writing 001-030: fill empty prompts (email + survey)
 * 2. CELPIP Reading 031-060: trim questions to max 42
 * 3. CELPIP Reading all: fix duration to 3360s
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");

// ─── CELPIP Writing prompts ───────────────────────────────────────────────────

const EMAIL_PROMPTS = [
  "You recently moved to a new neighbourhood and would like to introduce yourself to your neighbour. Write a letter introducing yourself, describing your family, and suggesting a time to get together for coffee.",
  "You borrowed a tool from your neighbour last week and have not yet returned it. Write a letter apologising for the delay, explaining why it was not returned sooner, and confirming when you will bring it back.",
  "Your local community centre has recently cancelled a programme that you and many neighbours valued. Write a letter to the director expressing your disappointment, explaining the programme's value, and asking them to reconsider.",
  "You would like to start a neighbourhood watch programme in your area. Write a letter to your neighbours explaining what you have in mind, why it is important, and how they can get involved.",
  "You recently ordered furniture online and it arrived damaged. Write a letter to the company describing the damage, explaining how it has inconvenienced you, and requesting a replacement or refund.",
  "You attended a training workshop organised by your employer but found it unhelpful. Write a letter to your manager explaining your concerns, what you had expected, and what kind of training would be more beneficial.",
  "A friend who lives in another city is planning to visit you for the first time. Write a letter welcoming them, describing what they can expect in your city, and suggesting some activities you could do together.",
  "Your landlord has not responded to your request to fix the heating system, which has been broken for three weeks. Write a letter reminding them of the problem, describing how it has affected you, and asking for immediate action.",
  "You are leaving your current job and want to write a farewell letter to your colleagues. Thank them for their support, mention a positive memory you share, and wish them well for the future.",
  "You recently completed a course at a local college and would like to recommend it to a friend. Write a letter describing the course, what you learned, and why you think they would benefit from it.",
  "You are organising a neighbourhood cleanup event. Write a letter to your neighbours explaining why you are organising the event, what the plan is, and how they can contribute.",
  "You recently received a bill from your utility company that you believe is incorrect. Write a letter explaining the discrepancy, providing relevant details, and asking for a review of the charge.",
  "You are planning to adopt a pet and need to inform your landlord. Write a letter explaining why you want a pet, what type of pet you plan to adopt, and how you will ensure it does not cause any problems.",
  "A colleague from another department helped you complete a difficult project. Write a letter thanking them, describing what they did, and explaining the impact of their contribution.",
  "You recently stayed at a hotel and were very dissatisfied with the service. Write a letter to the hotel manager describing what went wrong, how it affected your stay, and what compensation you expect.",
  "Your child's school is planning to cut music and art classes due to budget constraints. Write a letter to the principal opposing this decision and explaining why these subjects are important.",
  "You have noticed that a local park in your area is not being properly maintained. Write a letter to the city council describing the problems, why they matter to the community, and requesting prompt action.",
  "You are applying for a volunteer position at a local food bank. Write a letter introducing yourself, explaining why you want to volunteer, and describing relevant experience or skills you have.",
  "A shop assistant in a local store was exceptionally helpful to you last week. Write a letter to the store manager praising the employee, describing what they did, and explaining why their service stood out.",
  "You recently witnessed a car accident near your home and want to inform the local authority about unsafe road conditions. Write a letter describing what happened, the state of the road, and what action you think should be taken.",
  "Your workplace recently introduced a new scheduling system that is causing difficulties for many employees. Write a letter to your human resources manager describing the problems, how staff are affected, and suggesting a solution.",
  "You are planning a community fundraiser for a local charity. Write a letter to potential sponsors explaining the cause, what the event involves, and how their support would make a difference.",
  "You have recently noticed signs of water damage in your rented apartment. Write a letter to your landlord describing the issue, where you first noticed it, and asking for a prompt inspection and repair.",
  "A library in your neighbourhood is at risk of closing due to lack of funding. Write a letter to the local government expressing your concern, explaining the library's importance to the community, and suggesting ways to save it.",
  "You are writing to a friend who is feeling stressed and overwhelmed. Write a letter acknowledging their feelings, sharing your own experiences with similar challenges, and offering practical suggestions for coping.",
  "You recently purchased a language learning app and are very satisfied with it. Write a letter to the app's customer service team explaining what you like about the app, how it has helped you, and suggesting one improvement.",
  "Your neighbourhood recently experienced a power outage that lasted for two days. Write a letter to the electricity company describing your experience, the impact it had, and requesting an explanation and preventive measures.",
  "You are interested in joining a community sports team. Write a letter to the team coordinator expressing your interest, describing your experience and fitness level, and asking about training times and how to register.",
  "A close friend recently supported you through a difficult period in your life. Write a letter thanking them for their help, describing what they did, and explaining how meaningful their support was.",
  "You accidentally broke your neighbour's garden ornament while helping with their yard. Write a letter apologising, explaining what happened, and offering to replace or pay for the item.",
];

const SURVEY_PROMPTS = [
  "A community centre is conducting a survey about how to improve local services. Respond to the survey explaining which service is most important to you, why you value it, and how the centre could make it more accessible.",
  "A local health authority is asking residents about their experience with public healthcare. Describe your experience with local health services, what works well, what could be improved, and what additional services you would like to see.",
  "A university is collecting feedback from the public about continuing education programmes. Describe what type of programme you would be most interested in, when you would prefer to attend, and what would encourage you to enrol.",
  "A city transport authority is surveying residents about public transit. Describe your experience using public transit, what challenges you face, and what improvements would make you more likely to use it.",
  "A local employer is conducting a survey about work-life balance. Describe how you manage your work and personal life, what challenges you face, and what policies your employer could introduce to improve your balance.",
  "A national environmental agency is surveying Canadians about climate change concerns. Describe what environmental issue you are most concerned about, why it matters to you, and what action you would like government to take.",
  "A local school board is asking parents and community members for feedback on school programmes. Describe what you think students need most from their education, what is currently lacking, and what changes you would recommend.",
  "A community housing organisation is surveying residents about affordable housing needs. Describe the housing challenges in your area, who is most affected, and what solutions you think the government should prioritise.",
  "A social services agency is asking for feedback on support programmes for newcomers to Canada. Describe what challenges newcomers face in your community, which services are most needed, and how existing programmes could be improved.",
  "A local business improvement association is surveying community members about the retail environment. Describe your shopping habits, what you like or dislike about local shops, and what would encourage you to shop locally more often.",
  "A public library is collecting feedback on its programmes and services. Describe how you use the library, which services you find most valuable, and what new programmes or resources you would like to see offered.",
  "A regional recreation authority is asking residents about parks and outdoor spaces. Describe how you use parks in your area, what facilities are missing, and what improvements would most benefit the community.",
  "A community wellness programme is surveying residents about mental health support. Describe the mental health challenges you or people in your community face, what support currently exists, and what additional services are needed.",
  "A technology programme for seniors is seeking feedback from older adults and their families. Describe the technology challenges seniors face, what types of training would be most useful, and how programmes could be made more accessible.",
  "A local food bank is asking for community input on food security. Describe the food security challenges in your area, who is most affected, and what strategies you think would most effectively reduce food insecurity.",
  "A city planning department is seeking community input on a new neighbourhood development. Describe what features you would most like to see in the new development, why they are important to your community, and any concerns you have.",
  "A national immigration survey is asking newcomers about their settlement experience. Describe the challenges you or someone you know faced when settling in Canada, what help was most useful, and what gaps in services you identified.",
  "A cycling infrastructure committee is consulting residents about bike lanes and cycling safety. Describe your experience cycling in the city, what dangers you encounter, and what infrastructure improvements would make cycling safer.",
  "A senior services organisation is surveying older adults about programmes for independent living. Describe the main challenges seniors face in living independently, which services are most important, and how they could be better delivered.",
  "A youth services organisation is asking parents and young people about after-school programmes. Describe what types of activities young people in your community need, what currently exists, and what gaps in programming you have noticed.",
  "A local newspaper is conducting a survey about what topics the community wants covered. Describe the issues that matter most to you as a resident, what kind of information you look for in local news, and how the paper could serve the community better.",
  "A digital literacy programme is surveying residents about technology access and skills. Describe your level of confidence using technology, what challenges you face, and what training or resources would help you most.",
  "A public safety commission is asking for community feedback on neighbourhood safety. Describe the safety concerns in your area, what you think contributes to them, and what measures you would like the city to take.",
  "A regional tourism board is gathering input on how to attract visitors to your area. Describe what you think makes your region unique, what attractions or events could draw visitors, and what improvements are needed to support tourism.",
  "A language services organisation is surveying people who have used translation or interpretation services. Describe your experience using these services, in what situations they were most needed, and how the quality could be improved.",
  "A community volunteerism initiative is asking residents why they do or do not volunteer. Describe your experience with volunteering, what motivates or prevents you from volunteering more, and what organisations or causes you would most like to support.",
  "An urban farming cooperative is seeking input on food growing in the city. Describe your interest in growing food, what obstacles prevent you from doing so, and what kind of support would help more residents grow their own food.",
  "A local arts council is surveying the community about arts and cultural programmes. Describe how you engage with arts and culture in your community, what you value about these programmes, and what additional offerings you would like to see.",
  "A regional water authority is asking residents about water conservation. Describe your current water use habits, what conservation measures you already take, and what more the authority could do to encourage residents to conserve water.",
  "A new public wellness centre is asking residents what services they would use. Describe the wellness activities you enjoy or would like to try, what times and facilities would suit you best, and what would make you a regular user.",
];

function fixCELPIPWritingPrompts() {
  const dir = path.join(BASE, "content/celpip/writing");
  const files = fs.readdirSync(dir).filter(f => f.match(/^test-\d+\.json$/)).sort();
  let fixed = 0;

  files.forEach((file, idx) => {
    const fp = path.join(dir, file);
    const test = JSON.parse(fs.readFileSync(fp, "utf8"));
    let changed = false;

    test.questions.forEach((q, qi) => {
      if (!q.prompt || q.prompt.trim() === "") {
        const taskType = q.taskType || (qi === 0 ? "email" : "survey_response");
        if (taskType === "email" || qi === 0) {
          q.prompt = EMAIL_PROMPTS[idx % EMAIL_PROMPTS.length];
          q.taskType = q.taskType || "email";
        } else {
          q.prompt = SURVEY_PROMPTS[idx % SURVEY_PROMPTS.length];
          q.taskType = q.taskType || "survey_response";
        }
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
      fixed++;
    }
  });
  console.log(`  CELPIP Writing: filled prompts in ${fixed} files`);
}

// ─── CELPIP Reading: trim to max 42 and fix duration ─────────────────────────

function fixCELPIPReading() {
  const dir = path.join(BASE, "content/celpip/reading");
  const files = fs.readdirSync(dir).filter(f => f.match(/^test-\d+\.json$/)).sort();
  let trimmed = 0, durFixed = 0;

  files.forEach(file => {
    const fp = path.join(dir, file);
    const test = JSON.parse(fs.readFileSync(fp, "utf8"));
    let changed = false;

    // Trim to 38 questions (middle of 38-42 range)
    if (test.questions && test.questions.length > 42) {
      test.questions = test.questions.slice(0, 38);
      test.questionCount = 38;
      changed = true;
      trimmed++;
    }

    // Fix duration to 3360s
    if (test.durationSeconds < 3360) {
      test.durationSeconds = 3360;
      changed = true;
      durFixed++;
    }

    if (changed) {
      fs.writeFileSync(fp, JSON.stringify(test, null, 2), "utf8");
    }
  });
  console.log(`  CELPIP Reading: trimmed ${trimmed} files, fixed duration in ${durFixed} files`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

console.log("Fixing final issues...\n");

console.log("1. CELPIP Writing — fill empty prompts...");
fixCELPIPWritingPrompts();

console.log("2. CELPIP Reading — trim to max 42, fix duration...");
fixCELPIPReading();

// Verification
const w = JSON.parse(fs.readFileSync(path.join(BASE, "content/celpip/writing/test-001.json"), "utf8"));
console.log(`\n✓ CELPIP writing test-001 prompt: "${w.questions[0].prompt.substring(0,60)}..."`);
const r = JSON.parse(fs.readFileSync(path.join(BASE, "content/celpip/reading/test-031.json"), "utf8"));
console.log(`✓ CELPIP reading test-031 Q count: ${r.questions.length} (expected 38-42)`);
console.log(`✓ CELPIP reading test-031 duration: ${r.durationSeconds}s`);
console.log("\nDone.");
