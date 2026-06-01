#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'content', 'learning-hub');
const now = new Date().toISOString().slice(0,10);

function write(exam, section, data) {
  const dir = path.join(BASE, exam);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, section + '.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('wrote', file);
}

// ─── PTE VOCABULARY ──────────────────────────────────────────────────────────
const pteVocab = {
  exam: 'PTE Academic',
  section: 'vocabulary',
  lastUpdated: now,
  topicCount: 10,
  topics: [
    {
      topic: 'Academic Core Vocabulary',
      items: [
        { word: 'albeit', meaning: 'Although; even though.', example: 'The results were promising, albeit not as strong as the researchers had hoped.', usageNote: 'Formal conjunction. Common in PTE academic passages. Followed by adjective or clause.', difficulty: 'advanced' },
        { word: 'cognizant', meaning: 'Having knowledge or being aware of something.', example: 'Scientists must be cognizant of their own biases when interpreting experimental data.', usageNote: 'Formal synonym for "aware." Paired with "of."', difficulty: 'advanced' },
        { word: 'corroborate', meaning: 'To confirm or support a statement or theory with new evidence.', example: 'The satellite data corroborated the ground-based measurements.', usageNote: 'Key PTE reading/listening word. Often tested in "fill in the blanks."', difficulty: 'advanced' },
        { word: 'delineate', meaning: 'To describe or indicate something precisely; to portray or outline.', example: 'The report delineates three distinct phases of urban development.', usageNote: 'Formal. Related: outline, define, demarcate.', difficulty: 'advanced' },
        { word: 'dichotomy', meaning: 'A division or contrast between two things that are opposed or different.', example: 'The lecture explored the dichotomy between nature and nurture in human behavior.', usageNote: 'Common PTE topic word. Related: binary, divide.', difficulty: 'advanced' },
        { word: 'empirical', meaning: 'Based on observation or experiment rather than theory.', example: 'Empirical evidence from clinical trials supports the drug\'s effectiveness.', usageNote: 'Key term in PTE science passages. Opposite: theoretical.', difficulty: 'intermediate' },
        { word: 'facilitate', meaning: 'To make an action or process easier.', example: 'Technology facilitates communication across vast distances.', usageNote: 'PTE speaking and writing staple. Avoid overuse; can sound hollow.', difficulty: 'intermediate' },
        { word: 'inconclusive', meaning: 'Not leading to a definite conclusion.', example: 'The results of the first trial were inconclusive, requiring further study.', usageNote: 'Common in PTE summarize written text tasks on research topics.', difficulty: 'intermediate' },
        { word: 'juxtapose', meaning: 'To place or deal with close together for contrasting effect.', example: 'The author juxtaposes rural poverty with urban excess to highlight inequality.', usageNote: 'Common in literary and social science PTE passages.', difficulty: 'advanced' },
        { word: 'ubiquitous', meaning: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous in modern life across all demographics.', usageNote: 'Frequently tested in PTE fill-in-the-blank and reading tasks.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Science & Technology',
      items: [
        { word: 'genome', meaning: 'The complete set of genetic material present in an organism.', example: 'Mapping the human genome revolutionized our understanding of hereditary diseases.', usageNote: 'Related: DNA, chromosome, gene sequencing. Common in PTE biology passages.', difficulty: 'advanced' },
        { word: 'nanotechnology', meaning: 'Technology operating at the scale of individual atoms and molecules.', example: 'Nanotechnology is being explored for targeted drug delivery in cancer treatment.', usageNote: 'High-frequency PTE topic. Related: nanoscale, nanoparticle.', difficulty: 'advanced' },
        { word: 'algorithm', meaning: 'A process or set of rules followed by a computer to solve a problem.', example: 'Search engines use sophisticated algorithms to rank billions of web pages.', usageNote: 'Key PTE AI/tech vocabulary. Related: machine learning, artificial intelligence.', difficulty: 'intermediate' },
        { word: 'catalyst', meaning: 'A substance that increases the rate of a chemical reaction; anything that causes change.', example: 'The industrial revolution acted as a catalyst for global urbanization.', usageNote: 'Both literal (chemistry) and figurative. Very common in PTE speaking.', difficulty: 'intermediate' },
        { word: 'renewable energy', meaning: 'Energy from sources that are naturally replenished on a human timescale.', example: 'Solar and wind power are the fastest-growing renewable energy sources globally.', usageNote: 'PTE environment task staple. Related: fossil fuels, carbon neutral.', difficulty: 'intermediate' },
        { word: 'prototype', meaning: 'A first or preliminary model of something, used for testing.', example: 'Engineers built a prototype of the new bridge design before full-scale construction.', usageNote: 'Common in PTE engineering and innovation topics.', difficulty: 'intermediate' },
        { word: 'obsolete', meaning: 'No longer produced or used; out of date.', example: 'Many manufacturing jobs have become obsolete due to factory automation.', usageNote: 'Frequent PTE topic: technology and employment. Related: redundant, outdated.', difficulty: 'intermediate' },
        { word: 'infrastructure', meaning: 'The basic physical structures and facilities needed for a society to function.', example: 'A country\'s digital infrastructure is as vital as its road network.', usageNote: 'Common in PTE lectures and readings on development and economics.', difficulty: 'intermediate' },
        { word: 'extrapolate', meaning: 'To extend known data to predict or infer beyond the available data range.', example: 'From current trends, scientists extrapolate that sea levels will rise by 50 cm by 2100.', usageNote: 'Statistical and scientific contexts. Related: interpolate, project, forecast.', difficulty: 'advanced' },
        { word: 'carbon neutral', meaning: 'Having a net zero carbon footprint by balancing emissions with carbon removal.', example: 'Many countries have pledged to become carbon neutral by 2050.', usageNote: 'PTE environment/sustainability vocabulary. Related: net zero, offsetting.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Society & Culture',
      items: [
        { word: 'demographic', meaning: 'Relating to the structure of populations; a particular sector of a population.', example: 'Advertisers target the 18–35 demographic for most consumer products.', usageNote: 'As adjective or noun. Related: census, population, statistics.', difficulty: 'intermediate' },
        { word: 'globalization', meaning: 'The process by which businesses, cultures, and economies operate internationally.', example: 'Globalization has accelerated cultural exchange but also eroded local traditions.', usageNote: 'PTE writing and speaking topic. British spelling: globalisation.', difficulty: 'intermediate' },
        { word: 'socioeconomic', meaning: 'Relating to or concerned with the interaction of social and economic factors.', example: 'Educational outcomes are strongly correlated with socioeconomic background.', usageNote: 'Hyphenated compound adjective. Common in PTE social science passages.', difficulty: 'advanced' },
        { word: 'marginalized', meaning: 'Treated as insignificant or relegated to the edge of society.', example: 'The policy aims to improve employment outcomes for marginalized communities.', usageNote: 'Related: excluded, disadvantaged, disenfranchised.', difficulty: 'intermediate' },
        { word: 'paradigm', meaning: 'A typical example or pattern; a worldview or framework of thinking.', example: 'The discovery of DNA caused a paradigm shift in biological science.', usageNote: 'Paired with "shift" to indicate major change in thinking. High PTE frequency.', difficulty: 'advanced' },
        { word: 'urbanization', meaning: 'The growth of cities as people move from rural to urban areas.', example: 'Rapid urbanization in Asia has led to the emergence of megacities with over 10 million residents.', usageNote: 'Common PTE geography and sociology topic.', difficulty: 'intermediate' },
        { word: 'cohesion', meaning: 'The action or fact of forming a united whole; unity.', example: 'Social cohesion depends on shared values and equal access to public institutions.', usageNote: 'Related: cohesive (adjective). In PTE writing: text cohesion = logical flow.', difficulty: 'intermediate' },
        { word: 'disparity', meaning: 'A great difference.', example: 'The disparity in income between the richest and poorest households has widened.', usageNote: 'Related: inequality, gap, imbalance. Common in PTE economics passages.', difficulty: 'intermediate' },
        { word: 'philanthropy', meaning: 'The desire to promote the welfare of others through donation of money or time.', example: 'Corporate philanthropy can improve brand image while supporting community development.', usageNote: 'Related: philanthropist, charity, donation.', difficulty: 'advanced' },
        { word: 'indigenous', meaning: 'Originating or occurring naturally in a particular place; native.', example: 'Indigenous knowledge systems often contain centuries of ecological observation.', usageNote: 'Capitalize when referring to specific peoples. Related: native, aboriginal.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Environment & Sustainability',
      items: [
        { word: 'anthropogenic', meaning: 'Caused or produced by human activity.', example: 'Most scientists agree that current climate change is primarily anthropogenic.', usageNote: 'From Greek: anthropos (human) + genes (born). Key PTE climate vocabulary.', difficulty: 'advanced' },
        { word: 'biodiversity', meaning: 'The variety of life in a particular habitat or on Earth as a whole.', example: 'The Amazon rainforest contains roughly 10% of all species on Earth.', usageNote: 'Key term in ecology. Often paired with "loss of" or "threaten."', difficulty: 'intermediate' },
        { word: 'carbon sequestration', meaning: 'The process of capturing and storing atmospheric carbon dioxide.', example: 'Forests serve as natural carbon sequestration sites, absorbing CO₂ from the atmosphere.', usageNote: 'Key climate change mitigation vocabulary for PTE.', difficulty: 'advanced' },
        { word: 'ecosystem services', meaning: 'Benefits that humans receive from ecosystems, such as clean water and pollination.', example: 'The economic value of ecosystem services provided by wetlands is often underestimated.', usageNote: 'Common PTE environmental economics vocabulary.', difficulty: 'advanced' },
        { word: 'mitigation', meaning: 'The action of reducing the severity or seriousness of something.', example: 'Flood mitigation strategies include building levees and restoring natural wetlands.', usageNote: 'Paired with "strategy," "measure," or "effort." Related: adaptation, prevention.', difficulty: 'intermediate' },
        { word: 'deforestation', meaning: 'The large-scale removal of trees from a forested area.', example: 'Deforestation in the Amazon releases billions of tonnes of stored carbon annually.', usageNote: 'Related: reforestation, afforestation, slash-and-burn.', difficulty: 'intermediate' },
        { word: 'permafrost', meaning: 'Ground that remains frozen year-round, found in polar and alpine regions.', example: 'Thawing permafrost releases methane, a potent greenhouse gas.', usageNote: 'PTE climate science vocabulary. Related: tundra, Arctic, methane.', difficulty: 'advanced' },
        { word: 'ecological footprint', meaning: 'A measure of human demand on Earth\'s ecosystems.', example: 'Developed nations have a disproportionately large ecological footprint.', usageNote: 'Related: carbon footprint, resource depletion.', difficulty: 'intermediate' },
        { word: 'arable land', meaning: 'Land that is suitable for growing crops.', example: 'Population growth is placing increasing pressure on the world\'s arable land.', usageNote: 'Related: agriculture, cultivation, irrigation. Common PTE geography vocabulary.', difficulty: 'intermediate' },
        { word: 'renewable', meaning: 'A resource that is naturally replenished after use.', example: 'Wind and solar are renewable sources, unlike coal and petroleum.', usageNote: 'Used as adjective or noun. Opposite: non-renewable, finite.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Economics & Business',
      items: [
        { word: 'fiscal', meaning: 'Relating to government revenue, especially taxes.', example: 'The government announced a series of fiscal measures to address the budget deficit.', usageNote: 'Distinct from monetary (central bank policy). Key PTE economics adjective.', difficulty: 'intermediate' },
        { word: 'austerity', meaning: 'Measures taken by governments to reduce spending during economic difficulties.', example: 'Austerity policies cut public services and contributed to social unrest.', usageNote: 'Related: deficit reduction, belt-tightening, cuts.', difficulty: 'advanced' },
        { word: 'derivatives', meaning: 'Financial instruments whose value is based on underlying assets.', example: 'Unregulated derivatives played a key role in the 2008 financial crisis.', usageNote: 'Advanced PTE finance vocabulary. Related: futures, options, hedging.', difficulty: 'advanced' },
        { word: 'market capitalization', meaning: 'The total market value of a company\'s outstanding shares.', example: 'Apple became the first company to reach a market capitalization of $3 trillion.', usageNote: 'Abbreviated: market cap. Common in PTE business passages.', difficulty: 'advanced' },
        { word: 'outsourcing', meaning: 'Contracting work to an external organization, often overseas.', example: 'Many tech companies outsource customer service to reduce labor costs.', usageNote: 'Related: offshoring, subcontracting. Common PTE business/globalization topic.', difficulty: 'intermediate' },
        { word: 'aggregate demand', meaning: 'The total demand for goods and services in an economy at a given time.', example: 'Stimulus spending is intended to boost aggregate demand during a recession.', usageNote: 'Key macroeconomics term. Related: GDP, consumption, investment.', difficulty: 'advanced' },
        { word: 'procurement', meaning: 'The action of obtaining supplies or materials for an organization.', example: 'Sustainable procurement practices require suppliers to meet environmental standards.', usageNote: 'Business and government contexts. Related: supply chain, sourcing, tendering.', difficulty: 'advanced' },
        { word: 'liability', meaning: 'Something a company or person owes; legal responsibility.', example: 'The company\'s liabilities exceeded its assets, signaling potential bankruptcy.', usageNote: 'Financial: debt, obligation. Legal: responsibility for damages.', difficulty: 'intermediate' },
        { word: 'depreciation', meaning: 'A reduction in the value of an asset over time.', example: 'Accountants apply depreciation annually to reflect the declining value of machinery.', usageNote: 'Distinguish from currency depreciation (weakening exchange rate).', difficulty: 'advanced' },
        { word: 'venture capital', meaning: 'Financing provided to startup companies with high growth potential.', example: 'The AI startup secured $50 million in venture capital to expand its research team.', usageNote: 'Related: angel investor, seed funding, IPO (initial public offering).', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Health & Medicine',
      items: [
        { word: 'pathogen', meaning: 'A bacterium, virus, or other microorganism that can cause disease.', example: 'Understanding how pathogens mutate is essential for developing effective vaccines.', usageNote: 'Related: infectious disease, epidemiology, immunity.', difficulty: 'advanced' },
        { word: 'epidemiology', meaning: 'The study of how diseases spread and can be controlled in populations.', example: 'Epidemiological data showed that the infection spread primarily in densely populated areas.', usageNote: 'Related: outbreak, transmission, public health.', difficulty: 'advanced' },
        { word: 'placebo', meaning: 'An inactive substance given to a control group in clinical trials.', example: 'Patients receiving the placebo showed no improvement compared to the treatment group.', usageNote: 'Related: clinical trial, control group, double-blind study.', difficulty: 'intermediate' },
        { word: 'chronic disease', meaning: 'A long-lasting condition that can be controlled but not cured.', example: 'Type 2 diabetes is a chronic disease strongly linked to diet and physical inactivity.', usageNote: 'Types: cardiovascular disease, diabetes, arthritis. Related: comorbidity.', difficulty: 'intermediate' },
        { word: 'immunization', meaning: 'The process of making a person immune to an infection by administering a vaccine.', example: 'Widespread immunization programs have eradicated smallpox and nearly eliminated polio.', usageNote: 'Synonyms: vaccination, inoculation. Key public health vocabulary.', difficulty: 'intermediate' },
        { word: 'prognosis', meaning: 'A forecast of the likely course of a disease or condition.', example: 'Early-stage diagnosis typically results in a much better prognosis.', usageNote: 'Distinguished from diagnosis (identification) and treatment (intervention).', difficulty: 'advanced' },
        { word: 'sedentary', meaning: 'Tending to spend much time seated; physically inactive.', example: 'A sedentary lifestyle is a major risk factor for cardiovascular disease.', usageNote: 'Related: physical inactivity, screen time. Common in PTE health passages.', difficulty: 'intermediate' },
        { word: 'cognitive decline', meaning: 'A deterioration in memory, language, thinking, and judgment.', example: 'Research suggests that regular exercise may slow cognitive decline in older adults.', usageNote: 'Related: dementia, Alzheimer\'s disease, neurological health.', difficulty: 'advanced' },
        { word: 'morbidity', meaning: 'The condition of being diseased; the rate of disease in a population.', example: 'Poverty is strongly correlated with higher morbidity and mortality rates.', usageNote: 'Distinct from mortality (death rate). Both commonly tested in PTE.', difficulty: 'advanced' },
        { word: 'holistic', meaning: 'Treating the whole person rather than just symptoms; comprehensive.', example: 'A holistic approach to healthcare addresses physical, mental, and social well-being.', usageNote: 'Common in PTE healthcare and wellness readings.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Education & Cognition',
      items: [
        { word: 'pedagogy', meaning: 'The method and practice of teaching; the art of education.', example: 'Modern pedagogy emphasizes active learning over passive memorization.', usageNote: 'Related: didactics, curriculum, andragogy (adult learning).', difficulty: 'advanced' },
        { word: 'metacognition', meaning: 'Awareness and understanding of one\'s own thought processes.', example: 'Metacognition helps students identify where their understanding breaks down.', usageNote: 'Prefix: meta- (above, about). Tested in PTE psychology/education passages.', difficulty: 'advanced' },
        { word: 'critical thinking', meaning: 'The objective analysis and evaluation of an issue to form a judgment.', example: 'Universities aim to develop critical thinking skills alongside domain knowledge.', usageNote: 'PTE core skill and frequent writing/speaking topic.', difficulty: 'intermediate' },
        { word: 'curriculum', meaning: 'The subjects and learning activities prescribed for a course of study.', example: 'The revised curriculum places greater emphasis on STEM subjects.', usageNote: 'Plural: curricula. Related: syllabus, lesson plan.', difficulty: 'intermediate' },
        { word: 'rote learning', meaning: 'Memorization through repetition without deeper understanding.', example: 'Critics argue that rote learning stifles creativity and independent thinking.', usageNote: 'Related: memorization, recall. Often contrasted with meaningful learning.', difficulty: 'intermediate' },
        { word: 'formative assessment', meaning: 'Ongoing evaluation during learning to provide feedback.', example: 'Formative assessment allows teachers to adjust instruction before a final exam.', usageNote: 'Contrast: summative assessment (evaluates at the end).', difficulty: 'intermediate' },
        { word: 'cognitive load', meaning: 'The mental effort required to process information.', example: 'Poorly designed slides increase cognitive load and reduce learning.', usageNote: 'Related: working memory, attention, schema.', difficulty: 'advanced' },
        { word: 'autonomy', meaning: 'The right or condition of self-government; independence in learning.', example: 'Giving students autonomy over their projects increases motivation and engagement.', usageNote: 'Related: self-directed learning, independent study.', difficulty: 'intermediate' },
        { word: 'accreditation', meaning: 'Official certification that an institution meets established quality standards.', example: 'Choosing an accredited university ensures your degree is internationally recognized.', usageNote: 'Key term when discussing study abroad, qualifications, and professional licensing.', difficulty: 'advanced' },
        { word: 'retention', meaning: 'The ability to retain information in memory; the rate at which students stay enrolled.', example: 'Spaced repetition dramatically improves long-term retention of new vocabulary.', usageNote: 'Two senses: memory retention and student retention (dropout rates).', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Politics & Governance',
      items: [
        { word: 'sovereignty', meaning: 'Supreme authority within a territory; the power of a state to govern itself.', example: 'The treaty raised questions about national sovereignty and international law.', usageNote: 'Related: autonomy, jurisdiction, self-determination.', difficulty: 'advanced' },
        { word: 'referendum', meaning: 'A direct vote in which people decide on a specific political question.', example: 'The Brexit referendum in 2016 resulted in the UK\'s decision to leave the European Union.', usageNote: 'Related: plebiscite, ballot, popular vote.', difficulty: 'intermediate' },
        { word: 'lobbying', meaning: 'The act of attempting to influence government officials or legislation.', example: 'Pharmaceutical companies spend millions on lobbying to shape healthcare policy.', usageNote: 'Related: advocacy, lobbyist, special interest group.', difficulty: 'advanced' },
        { word: 'diplomacy', meaning: 'The management of international relations through negotiation.', example: 'Skilled diplomacy averted what could have become a serious military conflict.', usageNote: 'Related: diplomatic, diplomat, foreign policy.', difficulty: 'intermediate' },
        { word: 'sanction', meaning: 'An official penalty or approval; economic restrictions imposed on a country.', example: 'International sanctions were imposed to pressure the government into reform.', usageNote: 'Two opposite meanings: to sanction = to permit; sanctions = penalties.', difficulty: 'advanced' },
        { word: 'legislation', meaning: 'Laws made by a government or parliament.', example: 'New legislation requires all vehicles sold after 2035 to be electrically powered.', usageNote: 'Related: bill, act, statute, parliament, congress.', difficulty: 'intermediate' },
        { word: 'coalition', meaning: 'A temporary alliance of political parties or groups.', example: 'Neither party won a majority, so they formed a coalition government.', usageNote: 'Related: alliance, partnership, majority, minority government.', difficulty: 'intermediate' },
        { word: 'bureaucracy', meaning: 'A system of government with many complex rules and procedures.', example: 'Excessive bureaucracy can slow down the delivery of essential public services.', usageNote: 'Related: red tape, administration, civil service.', difficulty: 'advanced' },
        { word: 'constitution', meaning: 'A set of fundamental principles establishing the basis of governance.', example: 'The constitution guarantees freedom of speech and religion.', usageNote: 'Related: constitutional rights, amendment, supreme court.', difficulty: 'intermediate' },
        { word: 'bipartisan', meaning: 'Involving cooperation between two political parties.', example: 'The infrastructure bill passed with bipartisan support from both major parties.', usageNote: 'Related: bipartisanship, cross-party, consensus.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Language & Communication',
      items: [
        { word: 'coherent', meaning: 'Logical and consistent; easy to follow and understand.', example: 'A coherent argument presents ideas in a logical sequence with clear transitions.', usageNote: 'Related: coherence (noun), incoherent (opposite). PTE writing scoring criterion.', difficulty: 'intermediate' },
        { word: 'concise', meaning: 'Giving much information clearly and in few words.', example: 'The PTE Summarize Written Text task requires a concise single-sentence summary.', usageNote: 'Related: brief, succinct, terse. PTE writing target: concise but complete.', difficulty: 'intermediate' },
        { word: 'discourse', meaning: 'Written or spoken communication or debate; a formal discussion.', example: 'Academic discourse requires precise vocabulary and well-structured arguments.', usageNote: 'Related: discourse marker (however, furthermore). Key PTE writing term.', difficulty: 'advanced' },
        { word: 'lexical', meaning: 'Relating to the words or vocabulary of a language.', example: 'Lexical range refers to the variety of vocabulary used in speaking and writing.', usageNote: 'Related: lexicon, lexicology. PTE scoring criterion for vocabulary use.', difficulty: 'advanced' },
        { word: 'paraphrase', meaning: 'To restate text using different words while preserving the original meaning.', example: 'The PTE Repeat Sentence and Summarize tasks test your ability to paraphrase ideas.', usageNote: 'Key PTE skill. Avoid changing meaning or copying word-for-word.', difficulty: 'intermediate' },
        { word: 'rhetoric', meaning: 'The art of effective speaking or writing; persuasive language.', example: 'Political speeches often rely on emotional rhetoric rather than factual argument.', usageNote: 'Can be negative (empty rhetoric) or neutral/positive (rhetorical skill).', difficulty: 'advanced' },
        { word: 'syntax', meaning: 'The arrangement of words and phrases to create well-formed sentences.', example: 'Complex syntax with subordinate clauses can raise PTE writing scores when used correctly.', usageNote: 'Related: grammar, sentence structure, clause.', difficulty: 'advanced' },
        { word: 'ambiguous', meaning: 'Open to more than one interpretation; not clear.', example: 'The instructions were ambiguous, leading to different interpretations among students.', usageNote: 'Related: ambiguity, vague, unclear. Opposite: unambiguous, explicit.', difficulty: 'intermediate' },
        { word: 'nuance', meaning: 'A subtle distinction or variation in meaning, expression, or tone.', example: 'Non-native speakers often struggle with the nuance of idiomatic expressions.', usageNote: 'Related: subtle, connotation, implication.', difficulty: 'advanced' },
        { word: 'connotation', meaning: 'An implied or associated meaning beyond the literal definition.', example: 'The word "cheap" has negative connotations compared to the more neutral "affordable."', usageNote: 'Contrast: denotation (literal meaning). Key for PTE vocabulary-in-context questions.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'PTE Task-Specific Vocabulary',
      items: [
        { word: 'summarize', meaning: 'To give a brief statement of the main points of something.', example: 'Summarize the passage in one sentence of 75 words or fewer.', usageNote: 'Core PTE task type: Summarize Written Text. Focus on main idea only.', difficulty: 'beginner' },
        { word: 'infer', meaning: 'To deduce or conclude from evidence rather than explicit statements.', example: 'From the context, you can infer that the author supports renewable energy investment.', usageNote: 'PTE reading and listening task skill. Related: imply, suggest, deduce.', difficulty: 'intermediate' },
        { word: 'elaborate', meaning: 'To develop or present in further detail.', example: 'The professor elaborated on the main hypothesis with three supporting examples.', usageNote: 'Useful in PTE Speaking: Describe Image. Signal further detail.', difficulty: 'intermediate' },
        { word: 'highlight', meaning: 'To pick out and emphasize what is important or significant.', example: 'The graph highlights the dramatic rise in global temperatures since 1980.', usageNote: 'PTE task type: Highlight Correct Summary, Highlight Incorrect Words.', difficulty: 'beginner' },
        { word: 'contradict', meaning: 'To state the opposite of; to go against.', example: 'The new study seems to contradict the accepted theory of economic growth.', usageNote: 'Common PTE pattern: text A contradicts text B. Look for "however," "but," "yet."', difficulty: 'intermediate' },
        { word: 'indicate', meaning: 'To point out; to show; to be a sign of.', example: 'The trend indicated by the graph suggests continued growth over the next decade.', usageNote: 'Formal synonym for "show" or "suggest." Very common in PTE academic texts.', difficulty: 'beginner' },
        { word: 'assess', meaning: 'To evaluate or estimate the nature, value, or ability of something.', example: 'The task requires you to assess the reliability of the sources presented.', usageNote: 'Related: assessment, evaluative, critical analysis.', difficulty: 'intermediate' },
        { word: 'relevant', meaning: 'Closely connected or appropriate to what is being discussed.', example: 'Include only relevant details when summarizing — avoid peripheral information.', usageNote: 'Opposite: irrelevant. PTE scoring: answers must be relevant to the question.', difficulty: 'beginner' },
        { word: 'predict', meaning: 'To say or estimate in advance what will happen.', example: 'Based on current data, analysts predict a 5% decline in global trade.', usageNote: 'Related: prediction, forecast, project. Common in PTE describe-image tasks.', difficulty: 'beginner' },
        { word: 'trend', meaning: 'A general direction in which something is developing or changing.', example: 'The graph shows an upward trend in online learning enrollment since 2010.', usageNote: 'Key vocabulary for PTE Describe Image (bar, line, pie charts). Types: upward, downward, stable.', difficulty: 'beginner' }
      ]
    }
  ]
};

write('pte', 'vocabulary', pteVocab);
console.log('PTE done.');

// ─── DUOLINGO VOCABULARY ─────────────────────────────────────────────────────
const duolingoVocab = {
  exam: 'Duolingo English Test',
  section: 'vocabulary',
  lastUpdated: now,
  topicCount: 8,
  topics: [
    {
      topic: 'Everyday Vocabulary',
      items: [
        { word: 'elaborate', meaning: 'To add more detail; to explain in greater depth.', example: 'Could you elaborate on what you mean by "sustainable development"?', usageNote: 'Common DET speaking prompt response word. Shows fluency when used naturally.', difficulty: 'intermediate' },
        { word: 'commute', meaning: 'To travel regularly between home and work or school.', example: 'My daily commute takes about 40 minutes by subway.', usageNote: 'DET speaking and writing prompt topic: describe daily routine.', difficulty: 'beginner' },
        { word: 'routine', meaning: 'A regular sequence of actions performed at set times.', example: 'Establishing a study routine is one of the best ways to prepare for the DET.', usageNote: 'Common DET topic: describe your daily or study routine.', difficulty: 'beginner' },
        { word: 'genuine', meaning: 'Truly what it appears to be; authentic; sincere.', example: 'Her enthusiasm for the subject was clearly genuine.', usageNote: 'DET writing: avoid fake or exaggerated statements; sound genuine.', difficulty: 'intermediate' },
        { word: 'tendency', meaning: 'An inclination toward a particular behavior or way of thinking.', example: 'People have a natural tendency to trust information from familiar sources.', usageNote: 'DET writing structure: "There is a tendency to…" signals academic style.', difficulty: 'intermediate' },
        { word: 'aspect', meaning: 'A particular part or feature of a topic.', example: 'One important aspect of language learning is consistent daily practice.', usageNote: 'Highly versatile DET writing and speaking word. Replace "thing" or "part."', difficulty: 'beginner' },
        { word: 'demonstrate', meaning: 'To show or prove something clearly.', example: 'Research demonstrates that bilingualism has cognitive benefits.', usageNote: 'More formal than "show." Strong word for DET written responses.', difficulty: 'intermediate' },
        { word: 'perspective', meaning: 'A point of view; a way of thinking about something.', example: 'From an environmental perspective, electric vehicles are a positive development.', usageNote: 'DET speaking: "From my perspective…" shows complex thinking.', difficulty: 'intermediate' },
        { word: 'significant', meaning: 'Important; large enough to be noticed or have an effect.', example: 'Social media has had a significant impact on how people communicate.', usageNote: 'Academic synonym for "big" or "important." Very high DET frequency.', difficulty: 'beginner' },
        { word: 'whereas', meaning: 'In contrast or comparison with the fact that.', example: 'City life offers more opportunities, whereas rural life provides peace and quiet.', usageNote: 'DET writing: use "whereas" to contrast two ideas in one sentence.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Academic & Formal Writing',
      items: [
        { word: 'furthermore', meaning: 'In addition; moreover; used to introduce additional information.', example: 'Exercise improves mood; furthermore, it reduces the risk of chronic disease.', usageNote: 'Discourse marker for addition. Higher register than "also" or "and."', difficulty: 'intermediate' },
        { word: 'nevertheless', meaning: 'In spite of that; however; all the same.', example: 'The task was challenging; nevertheless, the team completed it on time.', usageNote: 'Strong contrast transition. More formal than "but." Common in DET writing.', difficulty: 'intermediate' },
        { word: 'advocate', meaning: 'To publicly support or recommend a cause or policy.', example: 'Many educators advocate for smaller class sizes to improve learning outcomes.', usageNote: 'As a verb: advocate for. As a noun: a strong advocate of.', difficulty: 'intermediate' },
        { word: 'consequence', meaning: 'A result or effect of an action or condition.', example: 'One consequence of excessive screen time is disrupted sleep patterns.', usageNote: 'DET writing structure: "As a consequence…" / "The consequences of X are…"', difficulty: 'intermediate' },
        { word: 'illustrate', meaning: 'To make something clear by using examples, pictures, or stories.', example: 'This example illustrates how technology can both connect and isolate people.', usageNote: 'Replace "shows" in formal writing. Related: exemplify, demonstrate.', difficulty: 'intermediate' },
        { word: 'contend', meaning: 'To assert or maintain (a position) in an argument.', example: 'Some researchers contend that social media harms teenagers\' mental health.', usageNote: 'Formal reporting verb. Similar: argue, claim, assert, maintain.', difficulty: 'advanced' },
        { word: 'attributed to', meaning: 'Caused by or credited to a particular source.', example: 'The increase in obesity rates is largely attributed to sedentary lifestyles.', usageNote: 'Useful DET phrase: "This can be attributed to…" explains causes.', difficulty: 'intermediate' },
        { word: 'predominantly', meaning: 'Mainly; for the most part.', example: 'The workforce in that sector is predominantly composed of recent graduates.', usageNote: 'More precise than "mostly." Common in DET academic writing tasks.', difficulty: 'advanced' },
        { word: 'subsequent', meaning: 'Coming after or following something.', example: 'The initial study and subsequent experiments confirmed the hypothesis.', usageNote: 'Related: subsequently (adverb). Replace "next" in formal writing.', difficulty: 'intermediate' },
        { word: 'novel', meaning: 'New or unusual; not previously known.', example: 'The study proposed a novel approach to teaching reading comprehension.', usageNote: 'As adjective meaning "new" (not the book). Common in academic DET passages.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Opinion & Argument',
      items: [
        { word: 'compelling', meaning: 'Evoking strong interest or admiration; powerfully convincing.', example: 'The documentary made a compelling case for reforming the criminal justice system.', usageNote: 'Use in DET writing: "The most compelling reason is…"', difficulty: 'intermediate' },
        { word: 'outweigh', meaning: 'To be heavier or more significant than something.', example: 'The benefits of studying abroad outweigh the challenges for most students.', usageNote: 'DET essay structure: "The advantages outweigh the disadvantages."', difficulty: 'intermediate' },
        { word: 'valid', meaning: 'Sound, logical, and well-supported; legally acceptable.', example: 'Both sides of the debate raised valid points about urban development.', usageNote: 'Related: validity, invalidate, validate. Strong DET argument word.', difficulty: 'beginner' },
        { word: 'counterargument', meaning: 'A point raised in opposition to another argument.', example: 'A strong essay acknowledges the counterargument before refuting it.', usageNote: 'DET writing: show balanced thinking by addressing the opposing view.', difficulty: 'intermediate' },
        { word: 'plausible', meaning: 'Seeming reasonable or probable; believable.', example: 'The theory, while not proven, is plausible given the available evidence.', usageNote: 'Stronger than "possible." Related: implausible (not believable).', difficulty: 'advanced' },
        { word: 'impact', meaning: 'A strong effect or influence.', example: 'Technology has had a profound impact on how we communicate and learn.', usageNote: 'As a noun and verb. Avoid "impactful" in formal academic writing.', difficulty: 'beginner' },
        { word: 'bias', meaning: 'A tendency to favor one view unfairly; prejudice.', example: 'Media bias can influence public opinion more subtly than outright propaganda.', usageNote: 'Related: biased, unbiased, objective. Critical thinking vocabulary.', difficulty: 'intermediate' },
        { word: 'crucial', meaning: 'Decisive and of the greatest importance.', example: 'Access to clean water is crucial for public health in developing regions.', usageNote: 'Synonyms: vital, essential, critical. Use varied synonyms in DET writing.', difficulty: 'beginner' },
        { word: 'assume', meaning: 'To take something for granted without proof.', example: 'It is often assumed that technology always improves productivity.', usageNote: 'Related: assumption. Flagging assumptions shows critical thinking in DET.', difficulty: 'beginner' },
        { word: 'refute', meaning: 'To prove a statement or theory to be wrong or false.', example: 'Subsequent research refuted the earlier claims about the drug\'s effectiveness.', usageNote: 'More formal than "disprove." Common in DET academic reading passages.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Society & Technology',
      items: [
        { word: 'accessible', meaning: 'Easy to reach, use, or understand; available to a wide range of people.', example: 'Online learning has made university education more accessible worldwide.', usageNote: 'Common DET writing and speaking topic. Related: accessibility.', difficulty: 'beginner' },
        { word: 'interconnected', meaning: 'Mutually connected; related to each other.', example: 'In a globalized world, national economies are deeply interconnected.', usageNote: 'DET writing: discuss global issues using "interconnected systems."', difficulty: 'intermediate' },
        { word: 'innovation', meaning: 'The introduction of new ideas, methods, or products.', example: 'Technological innovation continues to disrupt traditional industries.', usageNote: 'Related: innovate, innovative, innovator. High DET frequency.', difficulty: 'intermediate' },
        { word: 'privacy', meaning: 'The right to keep personal information or activities confidential.', example: 'Social media platforms often compromise user privacy in exchange for free services.', usageNote: 'Common DET essay topic. Related: data security, surveillance.', difficulty: 'intermediate' },
        { word: 'digital divide', meaning: 'The gap between those who have access to digital technology and those who do not.', example: 'The digital divide means that remote communities often miss out on online education.', usageNote: 'High-frequency DET topic on technology inequality.', difficulty: 'intermediate' },
        { word: 'misinformation', meaning: 'False or inaccurate information, especially that spread unintentionally.', example: 'Misinformation spreads faster on social media than factual corrections.', usageNote: 'Distinct from disinformation (deliberately false). DET media literacy topic.', difficulty: 'intermediate' },
        { word: 'platform', meaning: 'A digital or physical medium for communication, commerce, or expression.', example: 'Social media platforms have transformed political campaigning globally.', usageNote: 'Used both for technology (social media platform) and politics (policy platform).', difficulty: 'beginner' },
        { word: 'collaborate', meaning: 'To work jointly with others, especially in intellectual endeavors.', example: 'Scientists across 40 countries collaborated to map the human genome.', usageNote: 'Related: collaboration, collaborative. Positive workplace and academic vocabulary.', difficulty: 'intermediate' },
        { word: 'surveillance', meaning: 'Close observation, especially of suspected persons or systems.', example: 'Government surveillance programs raise serious concerns about civil liberties.', usageNote: 'DET writing: privacy and government power topic. Related: monitoring, oversight.', difficulty: 'advanced' },
        { word: 'virtual', meaning: 'Existing or occurring on a computer or online rather than in physical form.', example: 'Virtual classrooms expanded rapidly during the global health crisis.', usageNote: 'Related: virtual reality, online, remote. High DET frequency.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Environment & Health',
      items: [
        { word: 'climate change', meaning: 'Long-term shifts in temperatures and weather patterns caused mainly by human activity.', example: 'Climate change is increasing the frequency of extreme weather events worldwide.', usageNote: 'DET writing and speaking top topic. Distinguish from "global warming" (narrower term).', difficulty: 'beginner' },
        { word: 'biodiversity', meaning: 'The variety of life in a particular habitat or on Earth.', example: 'Habitat destruction is the leading cause of biodiversity loss.', usageNote: 'Related: species, ecosystem, extinction. DET environment topic.', difficulty: 'intermediate' },
        { word: 'sustainable', meaning: 'Capable of being maintained long-term without harming the environment.', example: 'Sustainable consumption means buying less and choosing durable products.', usageNote: 'High DET frequency. Related: sustainability, sustainably.', difficulty: 'intermediate' },
        { word: 'emission', meaning: 'The production and discharge of something, especially greenhouse gases.', example: 'Reducing carbon emissions is the primary goal of international climate agreements.', usageNote: 'Related: emit, emitter, carbon emission, greenhouse gas.', difficulty: 'intermediate' },
        { word: 'renewable', meaning: 'A resource that is naturally replenished over time.', example: 'Investing in renewable energy reduces dependence on fossil fuels.', usageNote: 'Paired with: resource, energy, sources. Opposite: non-renewable.', difficulty: 'beginner' },
        { word: 'well-being', meaning: 'A state of health, happiness, and comfort.', example: 'Exercise has been shown to improve both physical and mental well-being.', usageNote: 'Hyphenated compound noun. DET health and lifestyle topic.', difficulty: 'beginner' },
        { word: 'sedentary', meaning: 'Physically inactive; tending to sit for long periods.', example: 'Sedentary jobs increase the risk of obesity, diabetes, and heart disease.', usageNote: 'Common DET health-focused writing prompt vocabulary.', difficulty: 'intermediate' },
        { word: 'nutrition', meaning: 'The process of consuming the nutrients necessary for health and growth.', example: 'Good nutrition during childhood is critical for cognitive development.', usageNote: 'Related: nutritious, malnutrition, diet, balanced meal.', difficulty: 'beginner' },
        { word: 'obesity', meaning: 'The condition of being significantly overweight; excessive body fat.', example: 'Obesity rates have doubled in many countries over the past three decades.', usageNote: 'DET health essay topic. Related: overweight, BMI, lifestyle diseases.', difficulty: 'intermediate' },
        { word: 'mindfulness', meaning: 'A mental state of focused awareness of the present moment.', example: 'Mindfulness practices have been shown to reduce stress and anxiety significantly.', usageNote: 'Growing DET topic. Related: meditation, mental health, focus.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Education & Opportunity',
      items: [
        { word: 'opportunity', meaning: 'A favorable circumstance for advancement or progress.', example: 'Higher education provides greater economic opportunities over a lifetime.', usageNote: 'DET speaking: describe opportunities available to you. High-frequency word.', difficulty: 'beginner' },
        { word: 'critical thinking', meaning: 'The skill of analyzing and evaluating information to form a sound judgment.', example: 'Universities aim to develop critical thinking alongside subject knowledge.', usageNote: 'Core DET academic skill. Shows when you challenge assumptions in writing.', difficulty: 'intermediate' },
        { word: 'diverse', meaning: 'Showing a great deal of variety; different from each other.', example: 'A diverse classroom enriches learning by bringing in multiple perspectives.', usageNote: 'Related: diversity, diversify. DET campus and social topic.', difficulty: 'beginner' },
        { word: 'merit', meaning: 'The quality of being particularly good; deserving of reward.', example: 'Scholarships should be awarded based on academic merit, not just financial need.', usageNote: 'Related: meritocracy, merit-based, deserving.', difficulty: 'intermediate' },
        { word: 'literacy', meaning: 'The ability to read and write; competence in a subject.', example: 'Financial literacy should be a mandatory subject in secondary schools.', usageNote: 'Extended uses: digital literacy, media literacy, scientific literacy.', difficulty: 'intermediate' },
        { word: 'inequality', meaning: 'Difference in size, degree, or circumstances; lack of equality.', example: 'Educational inequality often reflects and reinforces broader socioeconomic disparities.', usageNote: 'Related: equal, equitable, disparity, gap.', difficulty: 'intermediate' },
        { word: 'scholarship', meaning: 'Academic achievement; a financial grant for study.', example: 'She earned a scholarship to study abroad at a prestigious university.', usageNote: 'Distinguish from bursary (need-based) and loan (must be repaid).', difficulty: 'beginner' },
        { word: 'credential', meaning: 'A qualification or achievement used to demonstrate competence.', example: 'Many employers now value skills and portfolios over traditional credentials.', usageNote: 'Related: degree, certificate, accreditation.', difficulty: 'intermediate' },
        { word: 'mentorship', meaning: 'Guidance provided by an experienced person to a less experienced one.', example: 'Mentorship programs help first-generation students navigate university life.', usageNote: 'Related: mentor, mentee. DET topic: describe someone influential.', difficulty: 'intermediate' },
        { word: 'aspiration', meaning: 'A hope or ambition for achievement.', example: 'Her aspiration to become a surgeon motivated her to excel in science.', usageNote: 'DET speaking prompt: talk about goals and aspirations.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Describing Images & Data',
      items: [
        { word: 'proportion', meaning: 'A part or share of a whole; a ratio.', example: 'The largest proportion of survey respondents preferred online learning.', usageNote: 'DET: use when describing pie charts or percentages.', difficulty: 'intermediate' },
        { word: 'fluctuate', meaning: 'To rise and fall irregularly; to vary.', example: 'Oil prices fluctuate in response to global political events.', usageNote: 'DET: describe line graphs showing irregular change. Related: fluctuation.', difficulty: 'intermediate' },
        { word: 'steadily', meaning: 'In a uniform and regular manner; gradually and consistently.', example: 'The number of online learners has increased steadily since 2015.', usageNote: 'DET line graph vocabulary. Related: gradually, consistently, progressively.', difficulty: 'beginner' },
        { word: 'decline', meaning: 'A gradual decrease in numbers, quality, or strength.', example: 'The graph shows a sharp decline in newspaper readership over the past decade.', usageNote: 'As noun and verb. Related: decrease, fall, drop, plummet.', difficulty: 'beginner' },
        { word: 'peak', meaning: 'The highest point or value; to reach the highest point.', example: 'Enrollment peaked in 2018 before declining as online alternatives grew.', usageNote: 'As noun and verb. Related: reach a peak, peak at, plateau.', difficulty: 'beginner' },
        { word: 'approximately', meaning: 'Close to a particular number or time; roughly.', example: 'Approximately 60% of respondents indicated satisfaction with the service.', usageNote: 'Formal alternative to "about." DET describe image data vocabulary.', difficulty: 'beginner' },
        { word: 'correlate', meaning: 'To have a mutual relationship where one thing affects or depends on another.', example: 'Higher education levels correlate with lower unemployment rates.', usageNote: 'Related: correlation, correlated, corresponding.', difficulty: 'intermediate' },
        { word: 'majority', meaning: 'The greater number or part; more than half.', example: 'The majority of respondents reported using smartphones more than 5 hours daily.', usageNote: 'Distinguish from "most": majority = over 50%. Common DET data phrase.', difficulty: 'beginner' },
        { word: 'contrast', meaning: 'A difference when things are compared; to compare to show differences.', example: 'In contrast to the previous year, sales increased significantly in Q4.', usageNote: 'As noun and verb. DET: "In contrast..." / "The contrast between X and Y..."', difficulty: 'beginner' },
        { word: 'comparable', meaning: 'Able to be likened; similar in relevant ways.', example: 'Results from this study are comparable to those reported by similar research teams.', usageNote: 'Related: compare, comparison, similarly.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'DET Speaking Prompts Vocabulary',
      items: [
        { word: 'memorable', meaning: 'Worth remembering or easily remembered; striking.', example: 'My most memorable travel experience was hiking the Inca Trail to Machu Picchu.', usageNote: 'DET speaking prompt: "Describe a memorable experience." Shows vivid recall.', difficulty: 'beginner' },
        { word: 'challenge', meaning: 'A difficulty requiring effort and determination to overcome.', example: 'One of the greatest challenges I have faced is adapting to a new country and culture.', usageNote: 'DET speaking: describe challenges you have overcome. High frequency.', difficulty: 'beginner' },
        { word: 'influence', meaning: 'The capacity to have an effect on the development of someone or something.', example: 'My high school teacher had a profound influence on my decision to study medicine.', usageNote: 'DET speaking: describe influential people. As noun and verb.', difficulty: 'beginner' },
        { word: 'achievement', meaning: 'A thing done successfully through effort, skill, or courage.', example: 'Passing the DET with a high score was a significant personal achievement.', usageNote: 'DET speaking prompt: "Describe a personal achievement."', difficulty: 'beginner' },
        { word: 'preference', meaning: 'A greater liking for one thing over another.', example: 'My preference is to study in the morning when my concentration is highest.', usageNote: 'DET speaking: "I have a preference for…" or "My preference is…"', difficulty: 'beginner' },
        { word: 'passion', meaning: 'A strong and barely controllable emotion; an intense enthusiasm.', example: 'Her passion for marine biology led her to volunteer at aquariums during high school.', usageNote: 'DET speaking: describe interests and motivations.', difficulty: 'beginner' },
        { word: 'adapt', meaning: 'To adjust or modify to suit a new environment or situation.', example: 'I had to adapt quickly to a different teaching style when I started university.', usageNote: 'DET speaking: describe adjustments made in life. Related: adaptation, adaptable.', difficulty: 'intermediate' },
        { word: 'essential', meaning: 'Absolutely necessary; extremely important.', example: 'Good time management is essential for balancing study, work, and social life.', usageNote: 'Synonyms: vital, crucial, necessary. DET high-frequency adjective.', difficulty: 'beginner' },
        { word: 'appreciate', meaning: 'To recognize the value of; to be grateful for.', example: 'Living abroad made me appreciate the importance of cultural sensitivity.', usageNote: 'DET speaking: "I appreciate…" is a common natural response opener.', difficulty: 'beginner' },
        { word: 'overcome', meaning: 'To succeed in dealing with a problem or difficulty.', example: 'With persistence and support from family, she overcame her language barrier.', usageNote: 'DET speaking: describe how you handled adversity. Irregular past: overcame.', difficulty: 'intermediate' }
      ]
    }
  ]
};

write('duolingo', 'vocabulary', duolingoVocab);
console.log('Duolingo done.');
