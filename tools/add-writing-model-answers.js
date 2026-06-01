#!/usr/bin/env node
/**
 * Add modelAnswer field to IELTS, CELPIP, and TOEFL writing tasks
 * Each modelAnswer is a tailored, high-quality response specific to that prompt
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// IELTS ANSWERS (tailored to test-001.json prompts)
// ============================================================================
const IELTS_ANSWERS = {
  // Task 1: Bar Chart about self-study vs formal courses
  'ielts-writing-001-q01': `The bar chart illustrates the distribution of students choosing between independent study and formal course attendance across five countries in 2023.

Overall, there is considerable variation in learning preferences across the surveyed nations. India and Brazil show the highest rates of independent study, exceeding 65%, while Japan and Canada demonstrate a strong preference for formal courses, with over 70% participation.

India leads in self-study adoption at approximately 72%, followed closely by Brazil at 68%. In contrast, Germany exhibits a more balanced split, with roughly 50% of students selecting each option. This equilibrium suggests that both learning modes have equal appeal in the German education system.

Japan and Canada represent the opposite end of the spectrum, with formal course attendance dominating at 76% and 74% respectively. This preference may reflect these countries' emphasis on structured education and institutional credentialing.

The data suggest that cultural attitudes towards education and employment credentialing significantly influence learning mode selection. In summary, while self-study is increasingly popular, formal education remains the primary preference in most developed nations, with the exception of India and Brazil where independent learning has gained substantial ground.`,

  // Task 2: Self-study vs Teacher Assistance
  'ielts-writing-001-q02': `While independent study offers valuable opportunities for self-directed learning, I agree that without proper support structures, students often encounter significant obstacles that require guidance from qualified instructors.

The advantages of self-study are evident. Students develop autonomy and time management skills that prove invaluable throughout their academic and professional careers. Furthermore, independent learners can tailor their pace and focus to suit their individual needs, potentially achieving deeper comprehension than classroom-bound students forced to follow standardised curricula.

However, the challenges of unsupported self-study are substantial. Many students lack the discipline and motivation required to maintain consistent study habits without external accountability. Additionally, self-taught learners frequently develop misconceptions without an experienced educator to correct them—a problem particularly acute in subjects like mathematics and sciences where cumulative errors compound. The absence of guidance also deprives students of mentoring relationships that extend learning beyond content delivery.

The most effective approach integrates both models. Students benefit from a foundation of guided instruction in complex topics, supplemented by structured independent work that reinforces concepts and develops self-reliance. This hybrid model, successfully implemented in many progressive institutions, captures the benefits of both approaches.

In conclusion, while independent study should be encouraged, students require at least baseline teacher support to establish correct foundations and maintain motivation. Completely unguided self-study, though valuable for some exceptional learners, remains unsuitable as a primary learning pathway for most students.`
};

// ============================================================================
// CELPIP ANSWERS (tailored to test-001.json prompts)
// ============================================================================
const CELPIP_ANSWERS = {
  // Task 1: Email about recycling bins
  'celpip-writing-001-q1': `Subject: Recycling Bin Overflow Issue in Building

Dear [Building Manager's Name],

I am writing to bring an important matter to your attention. Since moving in last month, I have observed that the recycling bins in our building are consistently overflowing, with recyclable items accumulating on the floor beside them. This situation occurs almost daily, creating an unsightly appearance in our common areas.

This problem concerns all residents for several reasons. Beyond aesthetics, overflowing bins attract pests and create health hazards. Additionally, items left on the floor obstruct pathways and pose safety risks, particularly for elderly residents and those with mobility challenges.

I would like to suggest two possible solutions. First, we could increase bin collection frequency from weekly to twice weekly during peak seasons. Alternatively, the building could install larger bins or additional containers. I would appreciate your guidance on which option is most feasible given our building's budget and logistics.

Thank you for your prompt attention to this matter. I am confident that together we can maintain our building as a clean and safe environment for all residents.

Best regards,
[Your Name]`,

  // Task 2: Transit survey response
  'celpip-writing-001-q2': `I believe Option B—adding 20 new electric buses to extend service to underserved areas—represents the better investment for our city.

While reducing fares by 50% would benefit current transit users, this approach fails to address a critical problem: many residents in underserved neighbourhoods cannot access public transit at all, regardless of price. These communities are already disadvantaged, and a fare reduction helps only those who can already reach bus stops. Option B directly addresses this inequality by providing service where it is needed most.

Furthermore, expanding electric bus service generates long-term environmental and economic benefits. Electric buses reduce emissions, improving air quality for residents in underserved areas who often experience higher pollution exposure. New routes also stimulate local economic development by improving job accessibility for lower-income residents who depend on public transit.

While a fare reduction might boost ridership in already-served areas, Option B creates sustainable, equitable growth. It addresses both immediate transportation gaps and long-term community development goals.

In conclusion, Option B represents a more strategic and equitable use of city resources, creating lasting benefits for the residents who need public transit most.`
};

// ============================================================================
// TOEFL ANSWER for Task 2 (Task 1 already has modelAnswer)
// ============================================================================
const TOEFL_ANSWER_Q02 = `I largely agree with Priya's position, though I would add nuance to how we understand motivation in practice.

Marcus makes a valid point that financial security is fundamental—without adequate income, people understandably prioritize earning over fulfillment. However, once this baseline is met, research from self-determination theory demonstrates that autonomy, competence, and relatedness become primary motivators. A salary increase that fails to provide meaningful work often produces short-term compliance rather than sustained engagement.

I have observed this dynamic in my own work experience. Colleagues who received raises without any change to their tasks showed temporary enthusiasm that quickly faded. Conversely, colleagues given autonomy and responsibility in their roles showed remarkable persistence despite modest compensation. This suggests that financial rewards are necessary but insufficient motivators.

Moreover, high-performing organisations increasingly recognise this reality. Companies like Google and 3M have built competitive advantages by providing meaningful work and autonomy alongside competitive salaries, not instead of them. They understand that the most talented employees are seldom motivated by money alone.

In summary, while financial rewards are essential for meeting basic needs and demonstrating valuation of work, non-financial rewards drive the sustained motivation and engagement that create exceptional organisational performance. The most effective approach combines adequate compensation with opportunities for autonomy, growth, and meaningful contribution.`;

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function updateTestFile(filePath, answers) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.questions && Array.isArray(data.questions)) {
      let addedCount = 0;

      data.questions.forEach(q => {
        if (answers[q.id] && !q.modelAnswer) {
          q.modelAnswer = answers[q.id];
          addedCount++;
        }
      });

      if (addedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        return { success: true, count: addedCount };
      }
      return { success: true, count: 0 };
    }
    return { success: false, error: 'Invalid JSON structure' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function main() {
  const baseDir = path.join(__dirname, '..', 'content');
  const exams = [
    { dir: 'ielts/writing', answers: IELTS_ANSWERS },
    { dir: 'celpip/writing', answers: CELPIP_ANSWERS },
    { dir: 'toefl/writing', answers: TOEFL_ANSWER_Q02 ? { 'toefl-writing-001-q02': TOEFL_ANSWER_Q02 } : {} }
  ];

  let totalAdded = 0;
  const results = {};

  exams.forEach(exam => {
    const examDir = path.join(baseDir, exam.dir);

    // Find all test-*.json files
    const files = fs.readdirSync(examDir)
      .filter(f => f.startsWith('test-') && f.endsWith('.json'));

    results[exam.dir] = {};

    files.forEach(file => {
      const filePath = path.join(examDir, file);
      const result = updateTestFile(filePath, exam.answers);

      if (result.success) {
        results[exam.dir][file] = result.count;
        totalAdded += result.count;
        console.log(`✓ ${exam.dir}/${file} — added ${result.count} modelAnswer(s)`);
      } else {
        console.log(`✗ ${exam.dir}/${file} — ${result.error}`);
      }
    });
  });

  console.log(`\n========== SUMMARY ==========`);
  console.log(`Total modelAnswers added: ${totalAdded}`);
  Object.entries(results).forEach(([exam, files]) => {
    const examTotal = Object.values(files).reduce((a, b) => a + b, 0);
    console.log(`${exam}: ${examTotal}`);
  });
}

main();
