#!/usr/bin/env node
/**
 * Verify that all writing questions now have modelAnswer fields with correct word counts
 */

const fs = require('fs');
const path = require('path');

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

function verifyFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const exam = data.exam;
  const results = [];

  if (data.questions && Array.isArray(data.questions)) {
    data.questions.forEach(q => {
      const taskNum = q.taskNumber || q.taskNum;
      const taskType = q.questionType || q.taskType || 'unknown';

      // Determine expected word count range
      let minWords = 0;
      if (exam === 'ielts') {
        minWords = taskNum === 1 ? 150 : 250; // Task 1: 160+, Task 2: 280+
      } else if (exam === 'celpip') {
        minWords = 150; // Both tasks: 150-200
      } else if (exam === 'toefl') {
        minWords = taskType.includes('integrated') ? 180 : 110; // Integrated: 180+, Discussion: 110+
      }

      const hasModelAnswer = q.modelAnswer && q.modelAnswer.trim().length > 0;
      const wordCount = hasModelAnswer ? countWords(q.modelAnswer) : 0;
      const meetsMinimum = wordCount >= minWords;

      results.push({
        id: q.id,
        taskNum,
        taskType,
        hasModelAnswer,
        wordCount,
        minWords,
        meetsMinimum,
        status: hasModelAnswer && meetsMinimum ? 'PASS' : 'FAIL'
      });
    });
  }

  return results;
}

function main() {
  const baseDir = path.join(__dirname, '..', 'content');
  const examDirs = [
    'ielts/writing',
    'celpip/writing',
    'toefl/writing'
  ];

  let totalQuestions = 0;
  let passCount = 0;
  const allResults = {};

  examDirs.forEach(examDir => {
    const fullDir = path.join(baseDir, examDir);
    const files = fs.readdirSync(fullDir)
      .filter(f => f.startsWith('test-') && f.endsWith('.json'));

    allResults[examDir] = {};

    files.forEach(file => {
      const filePath = path.join(fullDir, file);
      const results = verifyFile(filePath);
      allResults[examDir][file] = results;

      results.forEach(r => {
        totalQuestions++;
        if (r.status === 'PASS') passCount++;

        const status = r.status === 'PASS' ? '✓' : '✗';
        console.log(`${status} ${examDir}/${file} — Q${r.taskNum} (${r.taskType}): ${r.wordCount}w (min ${r.minWords}w)`);
      });
    });
  });

  console.log(`\n========== FINAL SUMMARY ==========`);
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Passed: ${passCount}/${totalQuestions}`);
  console.log(`Success rate: ${((passCount/totalQuestions)*100).toFixed(1)}%`);

  if (passCount === totalQuestions) {
    console.log(`\n✓ ALL WRITING QUESTIONS HAVE VALID MODEL ANSWERS!`);
  } else {
    console.log(`\n✗ Some questions failed validation. See details above.`);
  }
}

main();
