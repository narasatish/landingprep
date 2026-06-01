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

// GRE vocabulary — converting from category word-lists to full definitions format
const greVocab = {
  exam: 'GRE',
  section: 'vocabulary',
  lastUpdated: now,
  topicCount: 10,
  topics: [
    {
      topic: 'High-Frequency GRE Words A–C',
      items: [
        { word: 'abstruse', meaning: 'Difficult to understand; obscure.', example: 'The philosopher\'s abstruse arguments were difficult to follow even for trained scholars.', usageNote: 'Synonyms: arcane, recondite, esoteric. Antonym: lucid.', difficulty: 'advanced' },
        { word: 'acrimony', meaning: 'Bitterness or ill feeling.', example: 'The divorce proceedings were marked by such acrimony that the children were deeply affected.', usageNote: 'Adjective: acrimonious. Related: rancor, animosity.', difficulty: 'advanced' },
        { word: 'ameliorate', meaning: 'To make something bad or unsatisfactory better.', example: 'The new policy was intended to ameliorate the suffering caused by the housing shortage.', usageNote: 'Synonym: mitigate, alleviate. Antonym: exacerbate, aggravate.', difficulty: 'advanced' },
        { word: 'anachronism', meaning: 'Something belonging to a period other than the one being portrayed; a thing out of its time.', example: 'A knight carrying a smartphone would be an obvious anachronism in a medieval film.', usageNote: 'Adjective: anachronistic. Common in GRE reading comprehension.', difficulty: 'advanced' },
        { word: 'antipathy', meaning: 'A strong feeling of dislike.', example: 'Her antipathy toward competitive sports dated back to an unpleasant experience in childhood.', usageNote: 'Antonym: affinity, predilection. Related: aversion, animus.', difficulty: 'advanced' },
        { word: 'arcane', meaning: 'Understood by few; mysterious or secret.', example: 'The manuscript was filled with arcane symbols that only a handful of scholars could interpret.', usageNote: 'Synonyms: abstruse, esoteric, recondite. Common GRE word.', difficulty: 'advanced' },
        { word: 'belie', meaning: 'To give a false impression of; to fail to justify.', example: 'Her cheerful expression belied the anxiety she felt about the exam results.', usageNote: 'High GRE frequency. Do not confuse with "believe." Often used in TC questions.', difficulty: 'advanced' },
        { word: 'bombastic', meaning: 'High-sounding but with little meaning; pompous.', example: 'The senator\'s bombastic speech impressed few voters who wanted concrete policy plans.', usageNote: 'Noun: bombast. Synonyms: grandiloquent, turgid, inflated.', difficulty: 'advanced' },
        { word: 'cacophony', meaning: 'A harsh discordant mixture of sounds.', example: 'The orchestra\'s warm-up produced a cacophony that gradually resolved into harmony.', usageNote: 'Antonym: euphony, mellifluous. Adjective: cacophonous.', difficulty: 'advanced' },
        { word: 'capricious', meaning: 'Given to sudden and unaccountable changes of mood or behavior.', example: 'The capricious reviewer praised the book one month and condemned it the next.', usageNote: 'Noun: caprice. Synonyms: mercurial, fickle, volatile. Antonym: steadfast.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'High-Frequency GRE Words D–G',
      items: [
        { word: 'daunt', meaning: 'To make someone feel less confident or determined; to intimidate.', example: 'The sheer volume of GRE vocabulary did not daunt her — she studied systematically.', usageNote: 'Adjective: daunting, dauntless (fearless). Related: intimidate, discourage.', difficulty: 'intermediate' },
        { word: 'deleterious', meaning: 'Causing harm or damage.', example: 'Long-term exposure to noise pollution has deleterious effects on cardiovascular health.', usageNote: 'Synonyms: detrimental, inimical, pernicious. Antonym: salutary.', difficulty: 'advanced' },
        { word: 'diffidence', meaning: 'Modesty or shyness resulting from a lack of self-confidence.', example: 'His diffidence in social situations masked a sharp and analytical mind.', usageNote: 'Adjective: diffident. Antonym: presumptuous, audacious.', difficulty: 'advanced' },
        { word: 'dissonance', meaning: 'Lack of harmony; a tension or clash.', example: 'The cognitive dissonance between her beliefs and actions caused considerable distress.', usageNote: 'Musical and psychological senses. Antonym: consonance. Adjective: dissonant.', difficulty: 'advanced' },
        { word: 'ebullient', meaning: 'Cheerful and full of energy.', example: 'The ebullient coach motivated her team even after a string of defeats.', usageNote: 'Noun: ebullience. Synonyms: exuberant, effervescent. Antonym: morose.', difficulty: 'advanced' },
        { word: 'enervate', meaning: 'To weaken or drain of energy.', example: 'The oppressive summer heat enervated the researchers, slowing progress considerably.', usageNote: 'Do not confuse with "energize" — they are near-opposites. Antonym: invigorate.', difficulty: 'advanced' },
        { word: 'equivocate', meaning: 'To use ambiguous language so as to conceal the truth.', example: 'When pressed about the budget cuts, the official continued to equivocate.', usageNote: 'Noun: equivocation. Synonyms: prevaricate, hedge, waffle.', difficulty: 'advanced' },
        { word: 'fecund', meaning: 'Producing or capable of producing an abundance of offspring or new growth; fertile.', example: 'Darwin\'s fecund imagination produced not only the theory of evolution but many subsidiary ideas.', usageNote: 'Both literal (biology) and figurative (creative output).', difficulty: 'advanced' },
        { word: 'garrulous', meaning: 'Excessively talkative, especially on trivial matters.', example: 'The garrulous tour guide spoke so continuously that visitors could not absorb the information.', usageNote: 'Synonyms: loquacious, voluble. Antonym: taciturn, laconic.', difficulty: 'advanced' },
        { word: 'grandiloquent', meaning: 'Pompous or extravagant in language, style, or manner.', example: 'The grandiloquent prose of Victorian-era novelists can seem excessive to modern readers.', usageNote: 'Related: bombastic, turgid, magniloquent.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'High-Frequency GRE Words H–L',
      items: [
        { word: 'harangue', meaning: 'A lengthy and aggressive speech; to lecture at length.', example: 'The professor\'s harangue about citation style lasted twice as long as the lecture itself.', usageNote: 'As noun and verb. Synonyms: tirade, diatribe, philippic.', difficulty: 'advanced' },
        { word: 'hubris', meaning: 'Excessive pride or self-confidence, especially when leading to downfall.', example: 'The general\'s hubris led him to underestimate the enemy\'s strength, with catastrophic results.', usageNote: 'From Greek tragedy. Related: nemesis (punishment for hubris). GRE reading staple.', difficulty: 'advanced' },
        { word: 'iconoclast', meaning: 'A person who attacks established beliefs or institutions.', example: 'Copernicus was an iconoclast whose heliocentric model upended centuries of accepted astronomy.', usageNote: 'Adjective: iconoclastic. Related: maverick, contrarian.', difficulty: 'advanced' },
        { word: 'impetuous', meaning: 'Acting or done quickly and without thought; impulsive.', example: 'Her impetuous decision to quit her job without a backup plan proved costly.', usageNote: 'Synonyms: rash, precipitate, hasty. Antonym: circumspect, deliberate.', difficulty: 'advanced' },
        { word: 'insipid', meaning: 'Lacking flavor; lacking vigor or interest; dull.', example: 'Critics dismissed the novel as insipid, noting its predictable plot and flat characters.', usageNote: 'Synonyms: bland, vapid, banal. Antonym: piquant, stimulating.', difficulty: 'advanced' },
        { word: 'laconic', meaning: 'Using very few words.', example: 'The general\'s laconic reply — "If" — became legendary for its quiet confidence.', usageNote: 'From Sparta (Laconia), known for terse speech. Antonym: verbose, loquacious.', difficulty: 'advanced' },
        { word: 'laud', meaning: 'To praise highly.', example: 'The committee lauded the researcher\'s meticulous methodology and original conclusions.', usageNote: 'Noun: laudation. Adjective: laudable (praiseworthy). Antonym: censure, castigate.', difficulty: 'intermediate' },
        { word: 'loquacious', meaning: 'Tending to talk a great deal; garrulous.', example: 'The loquacious salesman dominated the conversation, giving his customer no chance to object.', usageNote: 'Synonyms: garrulous, voluble. Antonym: taciturn, reticent, laconic.', difficulty: 'advanced' },
        { word: 'lugubrious', meaning: 'Looking or sounding sad and dismal.', example: 'The lugubrious music at the farewell ceremony reflected the depth of the community\'s grief.', usageNote: 'Synonyms: mournful, doleful, elegiac. Antonym: ebullient, sanguine.', difficulty: 'advanced' },
        { word: 'limpid', meaning: 'Clear and transparent; (of writing or music) clear and easily understood.', example: 'Her limpid prose style made complex philosophical ideas accessible to general readers.', usageNote: 'Synonyms: pellucid, lucid, transparent. Antonym: murky, turbid.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'High-Frequency GRE Words M–P',
      items: [
        { word: 'maladroit', meaning: 'Ineffective or bungling; clumsy.', example: 'The diplomat\'s maladroit comment offended the host country\'s delegation.', usageNote: 'Antonym: adroit, dexterous. Related: inept, gauche.', difficulty: 'advanced' },
        { word: 'malleable', meaning: 'Able to be hammered or pressed into shape; easily influenced.', example: 'Young children\'s minds are remarkably malleable and receptive to new languages.', usageNote: 'Both literal (metals) and figurative (personalities). Antonym: intractable, inflexible.', difficulty: 'advanced' },
        { word: 'mendacious', meaning: 'Not telling the truth; lying.', example: 'The report exposed the politician\'s mendacious claims about the budget surplus.', usageNote: 'Noun: mendacity. Synonyms: dishonest, duplicitous, dissembling. Antonym: veracious.', difficulty: 'advanced' },
        { word: 'mercurial', meaning: 'Subject to sudden or unpredictable changes of mood or mind.', example: 'The mercurial director inspired loyalty and frustration in equal measure.', usageNote: 'Synonyms: capricious, volatile, protean. Antonym: steadfast, phlegmatic.', difficulty: 'advanced' },
        { word: 'munificent', meaning: 'Characterized by great generosity.', example: 'The munificent donation funded three new research chairs at the university.', usageNote: 'Synonyms: magnanimous, bountiful, lavish. Antonym: parsimonious, niggardly.', difficulty: 'advanced' },
        { word: 'obsequious', meaning: 'Obedient or attentive to an excessive degree; fawning.', example: 'The obsequious assistant agreed with every suggestion the boss made, regardless of merit.', usageNote: 'Noun: obsequiousness. Synonyms: sycophantic, unctuous, servile.', difficulty: 'advanced' },
        { word: 'opaque', meaning: 'Not transparent; not clear or lucid; difficult to understand.', example: 'The legal document was so opaque that even the lawyers needed time to interpret it.', usageNote: 'Antonym: lucid, pellucid, transparent. Common in GRE text completion.', difficulty: 'intermediate' },
        { word: 'ostentation', meaning: 'Pretentious and vulgar display intended to impress others.', example: 'The magnate\'s ostentation — gold-plated fixtures and a private helicopter — alienated the public.', usageNote: 'Adjective: ostentatious. Synonyms: showiness, vainglory, flamboyance.', difficulty: 'advanced' },
        { word: 'parsimony', meaning: 'Extreme unwillingness to spend money; excessive frugality.', example: 'His parsimony was legendary — he would reuse tea bags and avoid any unnecessary expense.', usageNote: 'Adjective: parsimonious. Antonym: munificent, profligate.', difficulty: 'advanced' },
        { word: 'pedantic', meaning: 'Excessively concerned with minor details or rules; unimaginative.', example: 'Her pedantic insistence on following every protocol slowed the team\'s progress considerably.', usageNote: 'Noun: pedant, pedantry. Related: didactic, doctrinaire.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'High-Frequency GRE Words P–S',
      items: [
        { word: 'penury', meaning: 'Extreme poverty; destitution.', example: 'After decades of penury, the family\'s fortunes were transformed by an unexpected inheritance.', usageNote: 'Adjective: penurious (also meaning miserly). Antonym: opulence, affluence.', difficulty: 'advanced' },
        { word: 'perfidy', meaning: 'Deceitfulness; an act of deliberate betrayal.', example: 'The general\'s perfidy in communicating with the enemy was one of the war\'s great scandals.', usageNote: 'Adjective: perfidious. Synonyms: treachery, duplicity.', difficulty: 'advanced' },
        { word: 'perspicacious', meaning: 'Having a ready insight into things; shrewdly perceptive.', example: 'The perspicacious investor saw the opportunity in the distressed market before anyone else did.', usageNote: 'Noun: perspicacity. Synonyms: astute, discerning, sagacious. Antonym: obtuse.', difficulty: 'advanced' },
        { word: 'placate', meaning: 'To make (someone) less angry or hostile.', example: 'Management tried to placate workers with a small pay rise but failed to address core grievances.', usageNote: 'Adjective: implacable (unable to be appeased). Synonyms: mollify, appease, conciliate.', difficulty: 'advanced' },
        { word: 'pliant', meaning: 'Easily bent; easily influenced; yielding readily.', example: 'The committee wanted a pliant leader who would follow directives without challenge.', usageNote: 'Synonyms: malleable, pliable, tractable. Antonym: intractable, recalcitrant.', difficulty: 'advanced' },
        { word: 'prolix', meaning: 'Using too many words; long-winded.', example: 'The prolix legal document could have said the same thing in one-tenth of the words.', usageNote: 'Noun: prolixity. Antonym: laconic, pithy, succinct.', difficulty: 'advanced' },
        { word: 'recondite', meaning: 'Not known by many people; obscure or abstruse.', example: 'The paper\'s recondite subject matter limited its readership to a handful of specialists.', usageNote: 'Synonyms: esoteric, arcane, abstruse. Antonym: accessible, popular.', difficulty: 'advanced' },
        { word: 'reticent', meaning: 'Not revealing one\'s thoughts or feelings readily.', example: 'He was reticent about his past and rarely volunteered personal information.', usageNote: 'Synonyms: reserved, taciturn, diffident. Antonym: forthright, candid.', difficulty: 'advanced' },
        { word: 'sanguine', meaning: 'Optimistic, especially in a difficult situation; blood-red.', example: 'Despite the setbacks, the CEO remained sanguine about the company\'s long-term prospects.', usageNote: 'From Latin: sanguis (blood). Antonym: pessimistic, despondent, melancholic.', difficulty: 'advanced' },
        { word: 'solipsism', meaning: 'The view that the self is all that can be known to exist; extreme self-absorption.', example: 'The critic accused the novel of solipsism — it was entirely focused on the narrator\'s interior world.', usageNote: 'Adjective: solipsistic. GRE philosophy/psychology reading vocabulary.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'High-Frequency GRE Words S–Z',
      items: [
        { word: 'spurious', meaning: 'Not being what it purports to be; false or fake.', example: 'The researcher\'s conclusions were based on spurious data fabricated for the study.', usageNote: 'Synonyms: specious, counterfeit, fallacious. Antonym: genuine, authentic.', difficulty: 'advanced' },
        { word: 'stolid', meaning: 'Calm, dependable, and showing little emotion or animation.', example: 'The stolid administrator was unruffled by even the most urgent crises.', usageNote: 'Antonym: volatile, mercurial, emotional.', difficulty: 'advanced' },
        { word: 'subvert', meaning: 'To undermine the power and authority of an established system.', example: 'The novel was banned for subverting traditional moral values.', usageNote: 'Noun: subversion. Adjective: subversive. Related: undermine, sabotage.', difficulty: 'intermediate' },
        { word: 'taciturn', meaning: 'Reserved or uncommunicative in speech; saying little.', example: 'The taciturn scientist communicated only through published papers and avoided interviews.', usageNote: 'Synonyms: reticent, laconic. Antonym: garrulous, loquacious.', difficulty: 'advanced' },
        { word: 'temerity', meaning: 'Excessive confidence or boldness; audacity.', example: 'She had the temerity to challenge the professor\'s thesis in front of the entire lecture hall.', usageNote: 'Related: audacity, effrontery, impertinence. Not to be confused with timidity.', difficulty: 'advanced' },
        { word: 'tenacious', meaning: 'Holding firmly to something; persistent.', example: 'Her tenacious pursuit of justice eventually led to the reform of the unjust law.', usageNote: 'Noun: tenacity. Synonyms: resolute, dogged, steadfast. Antonym: vacillating.', difficulty: 'intermediate' },
        { word: 'timorous', meaning: 'Showing or suffering from nervousness or lack of confidence.', example: 'The timorous applicant barely spoke above a whisper throughout the interview.', usageNote: 'Antonym: bold, intrepid, sanguine.', difficulty: 'advanced' },
        { word: 'torpor', meaning: 'A state of physical or mental inactivity; lethargy.', example: 'The long winter induced a kind of intellectual torpor that made writing impossible.', usageNote: 'Synonyms: languor, lethargy, inertia. Antonym: vivacity, energy.', difficulty: 'advanced' },
        { word: 'turgid', meaning: 'Swollen; pompous or bombastic in language.', example: 'The manuscript was rejected for its turgid prose and lack of original ideas.', usageNote: 'Related: bombastic, grandiloquent, inflated. Antonym: lucid, spare.', difficulty: 'advanced' },
        { word: 'vacillate', meaning: 'To waver between different opinions or actions; to be indecisive.', example: 'The committee vacillated for months before reaching a decision on the proposal.', usageNote: 'Synonyms: dither, waver, oscillate. Antonym: resolute, steadfast.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'GRE Text Completion: Common Patterns',
      items: [
        { word: 'vindicate', meaning: 'To clear someone of blame or suspicion; to show to be right.', example: 'The new evidence vindicated the scientist whose theory had been ridiculed for decades.', usageNote: 'Noun: vindication. Antonym: indict, impugn, incriminate.', difficulty: 'intermediate' },
        { word: 'venerate', meaning: 'To regard with great respect; to revere.', example: 'Confucian society venerates scholars and educators above other social classes.', usageNote: 'Noun: veneration. Synonyms: revere, esteem, idolize. Antonym: disparage.', difficulty: 'intermediate' },
        { word: 'vilify', meaning: 'To speak or write about in an abusively disparaging manner.', example: 'The tabloids vilified the politician without regard for accuracy or fairness.', usageNote: 'Noun: vilification. Synonyms: malign, defame, calumniate.', difficulty: 'advanced' },
        { word: 'volatile', meaning: 'Liable to change rapidly and unpredictably; evaporating quickly.', example: 'The volatile political situation made long-term planning nearly impossible.', usageNote: 'Noun: volatility. Synonyms: mercurial, capricious. Antonym: stable, steadfast.', difficulty: 'intermediate' },
        { word: 'wary', meaning: 'Feeling or showing caution about possible dangers or problems.', example: 'Investors were wary of committing funds in such an uncertain regulatory climate.', usageNote: 'Synonyms: cautious, circumspect, guarded. Antonym: reckless, heedless.', difficulty: 'beginner' },
        { word: 'wistful', meaning: 'Having or showing a feeling of vague or regretful longing.', example: 'She cast a wistful look at the old photographs, remembering her childhood home.', usageNote: 'Related: nostalgic, pensive, mournful.', difficulty: 'intermediate' },
        { word: 'zealot', meaning: 'A person who is fanatical and uncompromising in pursuit of their ideals.', example: 'The reforms were opposed by zealots who refused any compromise on principle.', usageNote: 'Adjective: zealous (positive) vs. zealotry (extreme). Related: fanatic.', difficulty: 'intermediate' },
        { word: 'zenith', meaning: 'The highest point; the time at which something is most powerful.', example: 'The empire\'s zenith under Augustus was followed by centuries of gradual decline.', usageNote: 'Antonym: nadir (lowest point). Common GRE contrast pairing.', difficulty: 'intermediate' },
        { word: 'zeal', meaning: 'Great energy or enthusiasm in pursuit of a cause.', example: 'She pursued her research with the zeal of a convert who had found her true calling.', usageNote: 'Related: zealous, zealot. Positive connotation; excess = zealotry.', difficulty: 'beginner' },
        { word: 'nadir', meaning: 'The lowest or most unsuccessful point; the point opposite the zenith.', example: 'The stock market crash of 1929 represented the nadir of investor confidence.', usageNote: 'Antonym: zenith, apex, acme. GRE reading: often paired with "zenith" for contrast.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'GRE Sentence Equivalence Pairs',
      items: [
        { word: 'pellucid', meaning: 'Translucently clear; easily understood.', example: 'Her pellucid explanation made a complex legal concept accessible to the jury.', usageNote: 'Synonyms: lucid, limpid, transparent. Common SE pairing with "lucid."', difficulty: 'advanced' },
        { word: 'lucid', meaning: 'Expressed clearly; easily understood; mentally clear.', example: 'Even after 30 years of teaching, his lucid lectures never lost their clarity.', usageNote: 'SE pair with: pellucid. Antonym: opaque, abstruse.', difficulty: 'intermediate' },
        { word: 'truculent', meaning: 'Eager or quick to argue or fight; aggressively defiant.', example: 'The truculent witness refused to cooperate, answering every question with a counter-challenge.', usageNote: 'SE pair with: belligerent, pugnacious. Antonym: placid, docile.', difficulty: 'advanced' },
        { word: 'pugnacious', meaning: 'Eager to argue, quarrel, or fight.', example: 'The senator\'s pugnacious debating style won admirers and enemies in equal measure.', usageNote: 'SE pair with: truculent, bellicose, combative.', difficulty: 'advanced' },
        { word: 'sycophant', meaning: 'A person who acts obsequiously toward someone important to gain advantage.', example: 'Surrounded by sycophants, the CEO never received honest feedback about his decisions.', usageNote: 'SE pair with: toady, flatterer. Adjective: sycophantic.', difficulty: 'advanced' },
        { word: 'toady', meaning: 'A person who behaves obsequiously; to flatter someone for personal gain.', example: 'The board was filled with toadies who approved every proposal without debate.', usageNote: 'SE pair with: sycophant, flatterer, yes-man.', difficulty: 'advanced' },
        { word: 'miserly', meaning: 'Having or showing an excessive desire to save money; unwilling to spend.', example: 'The miserly landlord refused to repair the heating system despite repeated requests.', usageNote: 'SE pair with: parsimonious, penurious, niggardly. Antonym: munificent.', difficulty: 'intermediate' },
        { word: 'niggardly', meaning: 'Ungenerous with money, time, or resources; stingy.', example: 'The niggardly allocation of funds made the project impossible to complete on time.', usageNote: 'SE pair with: miserly, parsimonious. Note: not related to any slur.', difficulty: 'advanced' },
        { word: 'astute', meaning: 'Having an ability to accurately assess situations; shrewd.', example: 'The astute investor spotted the undervalued company before the rest of the market.', usageNote: 'SE pair with: perspicacious, sagacious, discerning.', difficulty: 'intermediate' },
        { word: 'sagacious', meaning: 'Having or showing good judgment; wise.', example: 'The sagacious judge weighed every argument carefully before delivering a nuanced verdict.', usageNote: 'SE pair with: astute, perspicacious. Noun: sagacity.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'GRE Analytical Writing Vocabulary',
      items: [
        { word: 'substantiate', meaning: 'To provide evidence to support or prove the truth of something.', example: 'The author fails to substantiate the claim that exercise alone can prevent depression.', usageNote: 'Key GRE AWA word. Related: corroborate, validate. Antonym: refute.', difficulty: 'intermediate' },
        { word: 'contention', meaning: 'A point argued as part of a larger debate; heated disagreement.', example: 'The central contention of the argument is that economic growth requires environmental sacrifice.', usageNote: 'AWA: "The argument\'s central contention is..." Strong academic signal.', difficulty: 'intermediate' },
        { word: 'presuppose', meaning: 'To require as a precondition; to assume in advance.', example: 'The argument presupposes that all consumers have access to reliable broadband.', usageNote: 'GRE AWA: identifying unstated assumptions. Related: assume, take for granted.', difficulty: 'advanced' },
        { word: 'cogent', meaning: 'Clear, logical, and convincing.', example: 'A cogent argument presents evidence in a logical order that leads naturally to the conclusion.', usageNote: 'Antonym: specious, fallacious. Noun: cogency.', difficulty: 'advanced' },
        { word: 'fallacious', meaning: 'Based on a mistaken belief; logically unsound.', example: 'The study\'s conclusion is fallacious because it confuses correlation with causation.', usageNote: 'Noun: fallacy. Types: ad hominem, straw man, false dichotomy, hasty generalization.', difficulty: 'advanced' },
        { word: 'extrapolate', meaning: 'To extend a trend or conclusion beyond the known data.', example: 'The author extrapolates from one city\'s data to draw conclusions about the entire country.', usageNote: 'GRE AWA flaw identification: invalid extrapolation from a small sample.', difficulty: 'advanced' },
        { word: 'specious', meaning: 'Superficially plausible but actually wrong; misleading.', example: 'The argument is specious: it sounds logical but relies on an undefined key term.', usageNote: 'GRE AWA: "This is a specious argument because..." Antonym: cogent, sound.', difficulty: 'advanced' },
        { word: 'unwarranted', meaning: 'Not justified or authorized; lacking adequate grounds.', example: 'The leap from survey data to sweeping policy recommendations is unwarranted.', usageNote: 'GRE AWA: identify unwarranted assumptions or conclusions.', difficulty: 'intermediate' },
        { word: 'analogy', meaning: 'A comparison between two things for the purpose of explanation.', example: 'The author uses the analogy of a chain being only as strong as its weakest link.', usageNote: 'GRE AWA: evaluate whether an analogy is apt. Also a question type in old GRE.', difficulty: 'intermediate' },
        { word: 'dichotomy', meaning: 'A division or contrast between two opposed things.', example: 'The false dichotomy of "growth vs. environment" ignores the possibility of sustainable development.', usageNote: 'GRE AWA flaw: false dichotomy / either-or fallacy.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'GRE Quantitative Vocabulary',
      items: [
        { word: 'integer', meaning: 'A whole number (not a fraction); positive, negative, or zero.', example: 'If x is a positive integer less than 10, how many values can x take?', usageNote: 'Core GRE quant term. Distinguish from: rational, real, irrational.', difficulty: 'beginner' },
        { word: 'prime number', meaning: 'A number greater than 1 divisible only by 1 and itself.', example: 'The prime numbers less than 20 are: 2, 3, 5, 7, 11, 13, 17, and 19.', usageNote: 'GRE quant staple. Note: 1 is NOT prime; 2 is the only even prime.', difficulty: 'beginner' },
        { word: 'median', meaning: 'The middle value in a sorted list of numbers.', example: 'In the data set {2, 3, 7, 8, 12}, the median is 7.', usageNote: 'GRE statistics: distinguished from mean (average) and mode (most frequent).', difficulty: 'beginner' },
        { word: 'remainder', meaning: 'The amount left over after dividing one number by another.', example: 'When 17 is divided by 5, the remainder is 2.', usageNote: 'Key GRE concept: divisibility, modular arithmetic.', difficulty: 'beginner' },
        { word: 'probability', meaning: 'The likelihood of an event occurring, expressed as a fraction from 0 to 1.', example: 'The probability of flipping heads twice in a row is 1/4.', usageNote: 'GRE quant topic: independent events, conditional probability, combinations.', difficulty: 'intermediate' },
        { word: 'permutation', meaning: 'An arrangement of all or some elements of a set in a definite order.', example: 'The number of permutations of 4 items taken 2 at a time is 4 × 3 = 12.', usageNote: 'Order matters in permutations; compare with combinations (order does not matter).', difficulty: 'intermediate' },
        { word: 'standard deviation', meaning: 'A measure of how spread out numbers are in a data set.', example: 'A high standard deviation indicates that data points are spread far from the mean.', usageNote: 'GRE: understand conceptually — recognize higher vs. lower spread in data.', difficulty: 'intermediate' },
        { word: 'proportion', meaning: 'A part, share, or number considered in relation to a whole; equality of ratios.', example: 'If 3 out of 12 students passed, the proportion who passed is 1/4 or 25%.', usageNote: 'GRE quant: ratios, rates, percentages. "Direct proportion" = y = kx.', difficulty: 'beginner' },
        { word: 'exponent', meaning: 'A quantity that expresses the power to which another quantity is raised.', example: 'In 2^5 = 32, the exponent is 5.', usageNote: 'GRE rules: x^0 = 1; x^1 = x; (x^a)(x^b) = x^(a+b); (x^a)^b = x^(ab).', difficulty: 'beginner' },
        { word: 'asymptote', meaning: 'A line that a curve approaches but never quite reaches.', example: 'The function y = 1/x has the x-axis and y-axis as asymptotes.', usageNote: 'GRE quant: relevant in graphs and functions questions. Related: limit, infinity.', difficulty: 'advanced' }
      ]
    }
  ]
};

write('gre', 'vocabulary', greVocab);
console.log('GRE vocabulary done.');
