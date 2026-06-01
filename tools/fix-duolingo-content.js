#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Pool of ~20 varied Unsplash image URLs with fallback descriptions
const IMAGE_POOL = [
  { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80', desc: 'A busy city intersection with pedestrians, cyclists, and vehicles. Urban infrastructure, crosswalks, and bustling street activity.' },
  { url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65e?w=600&q=80', desc: 'A traditional outdoor market with colourful stalls, fresh produce, and active vendors. Shoppers browse items in a vibrant, community setting.' },
  { url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80', desc: 'An outdoor farmers market with bright umbrellas, varied produce displays, and diverse shoppers. The scene conveys energy and local commerce.' },
  { url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311c15?w=600&q=80', desc: 'A university library interior with students studying at desks, shelves of books, and quiet concentration. Natural light illuminates focused learning.' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', desc: 'A young person at a desk using a laptop in a modern study space, surrounded by books and learning materials. Academic focus is evident.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A diverse group of colleagues collaborating in a modern office environment, standing around a table discussing plans. Teamwork and engagement are visible.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A professional team meeting in progress with multiple participants engaged in discussion. Office setting with modern furnishings and collaborative atmosphere.' },
  { url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80', desc: 'A busy airport or transit hub with travellers moving with luggage and backpacks. Architecture and human activity create dynamic travel atmosphere.' },
  { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', desc: 'A modern coffee shop interior with customers seated at tables, some working on laptops. Casual café environment with warm lighting and social atmosphere.' },
  { url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80', desc: 'Two people engaged in conversation at a café table with beverages. Friendly interaction and relaxed setting suggest social or professional meeting.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A professional training or presentation scenario with an instructor and participants. Business setting focused on knowledge transfer and skill development.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'Colleagues engaged in active discussion around a boardroom table. Professional environment with focus on communication and decision-making.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A diverse team collaborating in a modern workspace with laptops and materials. Inclusive professional setting emphasising teamwork and innovation.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'Professionals in business casual attire discussing strategy. Contemporary office environment with engaged participants focused on shared objectives.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A corporate meeting with multiple attendees and presentation materials visible. Professional setting demonstrating formal communication and planning.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'Team members gathered around a central table for collaborative work. Modern office setup with clear focus on group problem-solving and discussion.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'Professionals in a productive meeting environment with engaged participants. Contemporary office setting showing active discussion and collaboration.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A business team interaction showing positive engagement and professional atmosphere. Office setting with participants focused on shared discussion.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'Corporate professionals engaged in collaborative discussion. Modern workplace environment demonstrating teamwork and effective communication.' },
  { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80', desc: 'A diverse group working together in a professional setting. Contemporary office with participants engaged in active listening and dialogue.' }
];

// Pool of audio scripts for listen_and_type tasks
const AUDIO_SCRIPTS = [
  'The international conference brought together researchers from multiple countries.',
  'Sustainable energy solutions are becoming increasingly viable in modern infrastructure.',
  'Educational institutions are adapting to incorporate digital technology in classrooms.',
  'The pharmaceutical industry continues to develop treatments for emerging health challenges.',
  'Climate patterns are shifting due to increased atmospheric carbon concentrations.',
  'Urban planning strategies must balance environmental concerns with population growth.',
  'Archaeological discoveries continue to reveal insights about ancient civilisations.',
  'The telecommunications sector has revolutionised global communication networks.',
  'Biodiversity conservation requires international cooperation and policy coordination.',
  'Advances in artificial intelligence are transforming industrial automation.',
  'Global trade agreements shape economic relationships between nations.',
  'Public health initiatives address infectious disease prevention strategies.',
  'Renewable energy infrastructure investments are expanding worldwide.',
  'Cultural heritage preservation requires dedicated funding and expertise.',
  'Transportation networks are evolving to accommodate urban sustainability goals.',
  'The publishing industry is adapting to digital distribution methods.',
  'Environmental monitoring systems track pollution levels in populated areas.',
  'Innovation hubs foster entrepreneurship and technological development.',
  'Workforce training programmes address skills gaps in emerging industries.',
  'International diplomacy facilitates resolution of complex geopolitical issues.',
];

// Pool of varied reading comprehension prompts
const READING_COMPS = [
  'Recent studies indicate that urban green spaces reduce ambient temperatures by three to five degrees Celsius, providing significant relief from heat island effects.',
  'Ocean acidification poses threats to marine ecosystems, as increased carbon dioxide absorption alters the chemical balance of seawater.',
  'Renewable energy technologies have achieved cost parity with fossil fuels in many regions, accelerating their adoption in global energy markets.',
  'Archaeological evidence suggests that early human migrations followed coastal routes, enabling settlement of distant continents.',
  'Machine learning algorithms are increasingly used in medical diagnostics to identify disease patterns from imaging data.',
  'The erosion of biodiversity threatens ecosystem services that societies depend upon for food, water, and climate regulation.',
  'Public transportation investments in developing cities reduce traffic congestion and improve air quality.',
  'Digital literacy programmes are essential for ensuring equitable access to economic opportunities in knowledge-based economies.',
  'Climate adaptation strategies must incorporate both technological innovation and community-based resilience measures.',
  'International collaboration in scientific research accelerates the pace of technological advancement and discovery.',
];

function getImageForTopic(topic, index) {
  // Use topic hash to assign consistent images
  let hash = 0;
  for (let i = 0; i < (topic || '').length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  }
  return IMAGE_POOL[(hash + index) % IMAGE_POOL.length];
}

function getAudioScriptForTopic(topic, index) {
  let hash = 0;
  for (let i = 0; i < (topic || '').length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) >>> 0;
  }
  return AUDIO_SCRIPTS[(hash + index) % AUDIO_SCRIPTS.length];
}

function getReadingPrompt(index) {
  return READING_COMPS[index % READING_COMPS.length];
}

const duolingoDir = path.join(__dirname, '..', 'content', 'duolingo');
const subdirs = ['adaptive', 'literacy', 'comprehension', 'conversation', 'production'];

let fixStats = {
  filesProcessed: 0,
  photoItemsFixed: 0,
  audioItemsFixed: 0,
  readingPromptsDeduplicated: 0,
};

for (const subdir of subdirs) {
  const subPath = path.join(duolingoDir, subdir);
  if (!fs.existsSync(subPath)) continue;

  const files = fs.readdirSync(subPath).filter(f => f.startsWith('test-') && f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(subPath, file);
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    let readingCount = 0;

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];

      // Fix photo items (write_about_photo, speak_about_photo)
      if (q.questionType === 'write_about_photo' || q.questionType === 'speak_about_photo') {
        if (!q.photoUrl) {
          const img = getImageForTopic(q.topic, i);
          q.photoUrl = img.url;
          q.photoFallbackDescription = img.desc;
          fixStats.photoItemsFixed++;
        }
      }

      // Fix listen_and_type items
      if (q.questionType === 'listen_and_type') {
        if (!q.audioScript) {
          q.audioScript = getAudioScriptForTopic(q.topic, i);
          fixStats.audioItemsFixed++;
        }
      }

      // Fix reading_comprehension duplication
      if (q.questionType === 'reading_comprehension') {
        readingCount++;
        if (readingCount > 2) {
          q.prompt = getReadingPrompt(readingCount);
          fixStats.readingPromptsDeduplicated++;
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    fixStats.filesProcessed++;
  }
}

console.log('✓ Duolingo content fixed');
console.log(`  Files processed: ${fixStats.filesProcessed}`);
console.log(`  Photo items fixed: ${fixStats.photoItemsFixed}`);
console.log(`  Audio scripts added: ${fixStats.audioItemsFixed}`);
console.log(`  Reading prompts deduplicated: ${fixStats.readingPromptsDeduplicated}`);
console.log(`Field names used: photoUrl, photoFallbackDescription, audioScript`);
