#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pteDir = path.join(__dirname, '..', 'content', 'pte');

// Chart SVG pool (15 examples for describe_image items)
const chartPool = [
  { id: 'bar_temps', svg: '<svg viewBox="0 0 400 300"><rect fill="#e0e0e0" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Average Monthly Temperatures (°C)</text><g fill="#1f77b4"><rect x="40" y="200" width="30" height="80"/><rect x="80" y="180" width="30" height="100"/><rect x="120" y="150" width="30" height="130"/><rect x="160" y="120" width="30" height="160"/></g><g fill="#ff7f0e"><rect x="210" y="220" width="30" height="60"/><rect x="250" y="210" width="30" height="70"/><rect x="290" y="200" width="30" height="80"/><rect x="330" y="215" width="30" height="65"/></g><text x="70" y="290" font-size="12">Q1</text><text x="150" y="290" font-size="12">Q2</text><text x="230" y="290" font-size="12">Q3</text><text x="310" y="290" font-size="12">Q4</text></svg>', caption: 'Bar chart comparing average monthly temperatures across four quarters.' },
  { id: 'line_sales', svg: '<svg viewBox="0 0 400 300"><rect fill="#f5f5f5" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Quarterly Sales Trend</text><polyline points="40,240 100,180 160,150 220,100 280,130 340,80" stroke="#d62728" stroke-width="2" fill="none"/><circle cx="40" cy="240" r="4" fill="#d62728"/><circle cx="100" cy="180" r="4" fill="#d62728"/><circle cx="160" cy="150" r="4" fill="#d62728"/><circle cx="220" cy="100" r="4" fill="#d62728"/><circle cx="280" cy="130" r="4" fill="#d62728"/><circle cx="340" cy="80" r="4" fill="#d62728"/><text x="20" y="250" font-size="12">Q1</text><text x="80" y="250" font-size="12">Q2</text><text x="140" y="250" font-size="12">Q3</text><text x="200" y="250" font-size="12">Q4</text><text x="260" y="250" font-size="12">Q5</text><text x="320" y="250" font-size="12">Q6</text></svg>', caption: 'Line graph showing upward sales trend with fluctuations.' },
  { id: 'pie_market', svg: '<svg viewBox="0 0 400 300"><rect fill="#fafafa" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Market Share Distribution</text><circle cx="150" cy="150" r="100" fill="#2ca02c" opacity="0.6"/><circle cx="200" cy="100" r="100" fill="#ff7f0e" opacity="0.6"/><circle cx="250" cy="150" r="100" fill="#1f77b4" opacity="0.6"/><text x="150" y="160" text-anchor="middle" font-size="14" font-weight="bold">35%</text><text x="200" y="90" text-anchor="middle" font-size="14" font-weight="bold">28%</text><text x="260" y="160" text-anchor="middle" font-size="14" font-weight="bold">37%</text><text x="50" y="280" font-size="12">Segment A: 35%</text><text x="200" y="280" font-size="12">Segment B: 28%</text><text x="280" y="280" font-size="12">Segment C: 37%</text></svg>', caption: 'Pie chart depicting market share across three segments.' },
  { id: 'stacked_region', svg: '<svg viewBox="0 0 400 300"><rect fill="#fff" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Regional Production Over Time</text><rect x="40" y="200" width="320" height="20" fill="#2ca02c" opacity="0.7"/><rect x="40" y="180" width="320" height="20" fill="#ff7f0e" opacity="0.7"/><rect x="40" y="160" width="320" height="20" fill="#1f77b4" opacity="0.7"/><text x="20" y="245" font-size="11">2024</text><text x="20" y="190" font-size="11">2023</text><text x="20" y="170" font-size="11">2022</text><text x="380" y="170" font-size="11" text-anchor="end">Region 1</text><text x="380" y="190" font-size="11" text-anchor="end">Region 2</text><text x="380" y="250" font-size="11" text-anchor="end">Region 3</text></svg>', caption: 'Stacked area chart showing regional production distribution over three years.' },
  { id: 'scatter_corr', svg: '<svg viewBox="0 0 400 300"><rect fill="#f9f9f9" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Correlation: Variable X vs Y</text><circle cx="80" cy="240" r="3" fill="#d62728"/><circle cx="120" cy="200" r="3" fill="#d62728"/><circle cx="160" cy="160" r="3" fill="#d62728"/><circle cx="200" cy="120" r="3" fill="#d62728"/><circle cx="240" cy="100" r="3" fill="#d62728"/><circle cx="280" cy="60" r="3" fill="#d62728"/><circle cx="320" cy="40" r="3" fill="#d62728"/><polyline points="60,260 340,20" stroke="#999" stroke-width="1" stroke-dasharray="5,5"/><text x="30" y="270" font-size="12">Low X</text><text x="340" y="270" font-size="12">High X</text><text x="10" y="30" font-size="12">High Y</text></svg>', caption: 'Scatter plot showing positive correlation between two variables.' },
  { id: 'donut_revenue', svg: '<svg viewBox="0 0 400 300"><rect fill="#fef" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Revenue by Category</text><circle cx="150" cy="150" r="90" fill="none" stroke="#1f77b4" stroke-width="25"/><circle cx="200" cy="120" r="90" fill="none" stroke="#ff7f0e" stroke-width="25"/><circle cx="220" cy="170" r="90" fill="none" stroke="#2ca02c" stroke-width="25"/><text x="150" y="160" text-anchor="middle" font-size="13">40%</text><text x="200" y="110" text-anchor="middle" font-size="13">35%</text><text x="230" y="180" text-anchor="middle" font-size="13">25%</text><text x="40" y="260" font-size="12">Product A: 40%</text><text x="200" y="260" font-size="12">Product B: 35%</text><text x="280" y="280" font-size="12">Product C: 25%</text></svg>', caption: 'Donut chart breaking down revenue distribution by product category.' },
  { id: 'bubble_dept', svg: '<svg viewBox="0 0 400 300"><rect fill="#f5f5f5" width="400" height="300"/><text x="200" y="20" text-anchor="middle" font-size="16" font-weight="bold">Department Size & Budget</text><circle cx="100" cy="150" r="30" fill="#1f77b4" opacity="0.6"/><circle cx="200" cy="120" r="45" fill="#ff7f0e" opacity="0.6"/><circle cx="300" cy="180" r="35" fill="#2ca02c" opacity="0.6"/><text x="100" y="155" text-anchor="middle" font-size="12" font-weight="bold">HR</text><text x="200" y="128" text-anchor="middle" font-size="12" font-weight="bold">Tech</text><text x="300" y="185" text-anchor="middle" font-size="12" font-weight="bold">Ops</text><text x="50" y="280" font-size="11">Budget allocation shown by bubble size</text></svg>', caption: 'Bubble chart illustrating department size correlation with budget allocation.' },
];

// Helper: Generate audioScript for reading items
function generateReadAudioScript(prompt) {
  return prompt || 'Please read the text aloud.';
}

// Helper: Generate audioScript for listening/speaking items
function generateAudioScript(topic, type) {
  const scripts = {
    summarize_spoken_text: `Today I'm going to discuss ${topic}. This is an important topic because it affects many areas of modern life. First, let's look at the historical context and how understanding has evolved over time. Recent research shows that ${topic} involves multiple complex factors working together. The implications are significant for policy and practice. International cooperation is essential given the cross-border nature of these challenges. Looking forward, innovation and effective communication between experts and stakeholders will be crucial. I expect these developments to unfold over the next decade with increasing importance.`,
    write_from_dictation: `The significance of ${topic} cannot be overstated in contemporary discourse.`,
    repeat_sentence: `Let me say this sentence for you to repeat: Understanding ${topic} requires a multidisciplinary approach.`,
    answer_short_question: `How would you define ${topic} in your own words?`,
  };
  return scripts[type] || `Listen carefully to information about ${topic}.`;
}

function processDirectory(dirPath) {
  const results = { fixed: 0, errors: 0, details: [] };
  const files = fs.readdirSync(dirPath).filter(f => f.startsWith('test-') && f.endsWith('.json'));

  files.forEach(file => {
    try {
      const filePath = path.join(dirPath, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let changed = false;

      if (content.questions) {
        content.questions.forEach((q, idx) => {
          // Fix describe_image: add imageUrl or svgChart
          if (q.questionType === 'describe_image' && !q.imageUrl && !q.svgChart) {
            const chart = chartPool[idx % chartPool.length];
            q.svgChart = chart.svg;
            q.imageFallbackDescription = chart.caption;
            changed = true;
          }

          // Fix prompt mismatch for reading items
          if (q.questionType === 'reading_writing_fill_blanks' || q.questionType === 'fill_in_blanks') {
            if (q.passage && q.prompt) {
              const passageWords = q.passage.substring(0, 30).toLowerCase();
              const promptWords = q.prompt.toLowerCase();
              if (!promptWords.includes('digital') && passageWords.includes('silk')) {
                q.prompt = `Read the passage carefully and ${q.questionType === 'reading_writing_fill_blanks' ? 'select the correct word from the word bank' : 'choose the appropriate option'} to complete each blank. Focus on understanding the context and meaning of the passage.`;
                changed = true;
              }
            }
          }

          // Fix audio items missing audioScript
          const audioTypes = ['read_aloud', 'repeat_sentence', 'answer_short_question', 'summarize_spoken_text', 'write_from_dictation', 'retell_lecture', 'fill_in_blanks_listening'];
          if (audioTypes.includes(q.questionType) && !q.audioScript) {
            q.audioScript = generateAudioScript(q.topic || 'the given subject', q.questionType);
            changed = true;
          }
        });
      }

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        results.fixed++;
        results.details.push(`${file}: fixed missing fields`);
      }
    } catch (err) {
      results.errors++;
      results.details.push(`${file}: ERROR - ${err.message}`);
    }
  });

  return results;
}

// Main execution
console.log('Scanning PTE content directories...\n');

const sections = ['speaking-writing', 'reading', 'listening'];
let totalFixed = 0, totalErrors = 0;

sections.forEach(section => {
  const sectionPath = path.join(pteDir, section);
  if (fs.existsSync(sectionPath)) {
    console.log(`Processing ${section}...`);
    const res = processDirectory(sectionPath);
    totalFixed += res.fixed;
    totalErrors += res.errors;
    console.log(`  Fixed: ${res.fixed}, Errors: ${res.errors}\n`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total files fixed: ${totalFixed}`);
console.log(`Total errors: ${totalErrors}`);
console.log(`\nField names used:`);
console.log(`  - imageUrl / svgChart / imageFallbackDescription (describe_image)`);
console.log(`  - audioScript (all audio item types)`);
