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

// ─── TOEFL VOCABULARY ────────────────────────────────────────────────────────
const toeflVocab = {
  exam: 'TOEFL iBT',
  section: 'vocabulary',
  lastUpdated: now,
  topicCount: 10,
  topics: [
    {
      topic: 'Campus Life',
      items: [
        { word: 'tuition', meaning: 'The fee charged for instruction at a university or college.', example: 'She applied for a scholarship to help cover the rising tuition costs.', usageNote: 'Often paired with "tuition fees" or "pay tuition."', difficulty: 'beginner' },
        { word: 'dormitory', meaning: 'A large building at a university providing residential quarters for students.', example: 'Freshmen are required to live in the dormitory during their first year.', usageNote: 'Informally called "dorm." Common topic in TOEFL conversations.', difficulty: 'beginner' },
        { word: 'prerequisite', meaning: 'A course or condition required before enrolling in another course.', example: 'Calculus I is a prerequisite for taking Calculus II.', usageNote: 'Often appears in academic advising conversations.', difficulty: 'intermediate' },
        { word: 'registrar', meaning: 'The university official responsible for student records and course registration.', example: 'He visited the registrar\'s office to resolve a scheduling conflict.', usageNote: 'Common in TOEFL campus-situation dialogues.', difficulty: 'intermediate' },
        { word: 'syllabus', meaning: 'An outline of the topics, assignments, and policies for a course.', example: 'The professor distributed the syllabus on the first day of class.', usageNote: 'Plural: syllabi or syllabuses.', difficulty: 'beginner' },
        { word: 'extracurricular', meaning: 'Activities pursued outside of the formal academic curriculum.', example: 'Joining the debate club is an extracurricular activity that looks good on résumés.', usageNote: 'Used with "activities" or "involvement."', difficulty: 'intermediate' },
        { word: 'thesis', meaning: 'A long research paper or dissertation submitted for a university degree.', example: 'Her thesis argued that urban green spaces reduce community stress levels.', usageNote: 'Undergraduate: thesis; graduate: dissertation (US).', difficulty: 'intermediate' },
        { word: 'fellowship', meaning: 'A grant of money awarded to a scholar to fund research or study.', example: 'He received a two-year fellowship to study marine biology in Hawaii.', usageNote: 'Distinguished from scholarship: fellowships often include research duties.', difficulty: 'advanced' },
        { word: 'audit', meaning: 'To attend a course without receiving academic credit or a grade.', example: 'She decided to audit the astronomy course out of personal interest.', usageNote: 'As a verb: "to audit a class." As a noun: "an audit."', difficulty: 'intermediate' },
        { word: 'transcript', meaning: 'An official record of a student\'s academic performance and courses taken.', example: 'Graduate schools require official transcripts from all previously attended institutions.', usageNote: 'Always "official transcript" when submitted formally.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Biology & Natural Science',
      items: [
        { word: 'caecum', meaning: 'A pouch at the start of the large intestine; in koalas, it detoxifies eucalyptus.', example: 'The koala\'s exceptionally long caecum allows it to neutralize the toxic oils in eucalyptus leaves.', usageNote: 'British spelling: caecum; American: cecum. TOEFL lecture topic.', difficulty: 'advanced' },
        { word: 'arrector pili', meaning: 'Tiny muscles attached to hair follicles that contract to cause goosebumps.', example: 'When frightened, the arrector pili muscles contract, making body hair stand upright.', usageNote: 'From Latin: "erector of the hair." Discussed in TOEFL biology lectures.', difficulty: 'advanced' },
        { word: 'prehensile', meaning: 'Capable of grasping, especially by wrapping around an object.', example: 'Raccoons have prehensile front paws that allow them to manipulate objects with dexterity.', usageNote: 'Often describes tails (primates) or limbs. TOEFL lecture keyword.', difficulty: 'advanced' },
        { word: 'biodiversity', meaning: 'The variety of life in a particular habitat or on Earth as a whole.', example: 'Tropical rainforests support extraordinary biodiversity, hosting millions of species.', usageNote: 'Key term in ecology. Often paired with "loss of" or "threaten."', difficulty: 'intermediate' },
        { word: 'photosynthesis', meaning: 'The process by which green plants use sunlight to synthesize food from CO₂ and water.', example: 'Without photosynthesis, virtually all food chains on Earth would collapse.', usageNote: 'Related: chlorophyll, chloroplast, glucose.', difficulty: 'beginner' },
        { word: 'symbiosis', meaning: 'A close, long-term interaction between two different biological species.', example: 'The relationship between clownfish and sea anemones is a classic example of symbiosis.', usageNote: 'Types: mutualism, commensalism, parasitism.', difficulty: 'intermediate' },
        { word: 'taxonomy', meaning: 'The science of classifying organisms into groups based on shared characteristics.', example: 'Modern taxonomy relies heavily on DNA analysis to determine evolutionary relationships.', usageNote: 'Levels: kingdom, phylum, class, order, family, genus, species.', difficulty: 'advanced' },
        { word: 'dormancy', meaning: 'A period of inactivity or arrested development in an organism.', example: 'Bears enter dormancy during winter, lowering their metabolism significantly.', usageNote: 'Related: hibernate, estivate. Common in biology lectures.', difficulty: 'intermediate' },
        { word: 'nocturnal', meaning: 'Active during the night rather than the day.', example: 'Raccoons are nocturnal animals, using their sensitive paws to forage in the dark.', usageNote: 'Opposite: diurnal. Common TOEFL biology vocabulary.', difficulty: 'intermediate' },
        { word: 'adaptation', meaning: 'A feature evolved by a species to improve its fitness in its environment.', example: 'The snow leopard\'s thick fur is an adaptation to the extreme cold of its mountain habitat.', usageNote: 'Verb: adapt. Distinguished from acclimatization (short-term).', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'History & Archaeology',
      items: [
        { word: 'skiff', meaning: 'A shallow, flat-bottomed open boat used on rivers and coastal waters.', example: 'Ancient Egyptian priests transported sacred items by skiff along the Nile.', usageNote: 'TOEFL listening topic: Egyptian ceremonial boats.', difficulty: 'advanced' },
        { word: 'artifact', meaning: 'An object made or modified by a human being, especially one of historical interest.', example: 'The archaeologists uncovered dozens of artifacts from the Bronze Age settlement.', usageNote: 'British spelling: artefact. Do not confuse with "artificial."', difficulty: 'intermediate' },
        { word: 'circa', meaning: 'Approximately; used before dates to indicate uncertainty.', example: 'The manuscript dates to circa 1350 CE, near the beginning of the late medieval period.', usageNote: 'Abbreviated: c. or ca. Common in academic history texts.', difficulty: 'intermediate' },
        { word: 'dynasty', meaning: 'A line of rulers from the same family or group.', example: 'The Tang Dynasty is considered a golden age of Chinese arts and trade.', usageNote: 'Can be used figuratively: "a business dynasty."', difficulty: 'beginner' },
        { word: 'excavation', meaning: 'The process of carefully digging to uncover buried structures or objects.', example: 'The excavation at Pompeii has revealed remarkably preserved Roman buildings.', usageNote: 'Verb: excavate. Related: dig, unearthed, site.', difficulty: 'intermediate' },
        { word: 'stratigraphy', meaning: 'The study of rock layers (strata) and their chronological sequence.', example: 'Using stratigraphy, archaeologists determined the settlement was occupied for over 800 years.', usageNote: 'The lower the stratum, the older the deposit.', difficulty: 'advanced' },
        { word: 'indigenous', meaning: 'Originating or occurring naturally in a particular place; native.', example: 'The indigenous peoples of the Amazon developed sophisticated agricultural techniques.', usageNote: 'Preferred to "native" in most academic and political contexts.', difficulty: 'intermediate' },
        { word: 'renaissance', meaning: 'A revival of or renewed interest in something; the European cultural movement (14th–17th c.).', example: 'The Renaissance saw great advances in violin-making, particularly by masters like Stradivari.', usageNote: 'Capitalize when referring to the historical period.', difficulty: 'intermediate' },
        { word: 'chronicle', meaning: 'A factual written account of important historical events in order of time.', example: 'Medieval chronicles provide valuable but sometimes biased accounts of past battles.', usageNote: 'As a verb: "to chronicle events."', difficulty: 'intermediate' },
        { word: 'feudalism', meaning: 'The medieval European social system in which land was exchanged for military service.', example: 'Under feudalism, serfs were bound to the land owned by the lord above them.', usageNote: 'Related: vassal, serf, lord, fief.', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Environment & Ecology',
      items: [
        { word: 'habitat', meaning: 'The natural environment in which an organism lives and to which it is adapted.', example: 'Snow leopards require vast mountain habitats with rocky terrain for ambush hunting.', usageNote: 'Do not confuse with "habituation" (becoming used to something).', difficulty: 'beginner' },
        { word: 'deforestation', meaning: 'The large-scale removal of trees from a forested area.', example: 'Widespread deforestation in the Amazon basin is accelerating climate change.', usageNote: 'Key TOEFL topic. Related: reforestation, afforestation.', difficulty: 'intermediate' },
        { word: 'erosion', meaning: 'The gradual wearing away of rock or soil by water, wind, or other forces.', example: 'Coastal erosion is threatening homes built too close to the shoreline.', usageNote: 'Types: water erosion, wind erosion, glacial erosion.', difficulty: 'beginner' },
        { word: 'greenhouse gas', meaning: 'A gas that traps heat in the atmosphere, contributing to global warming.', example: 'Carbon dioxide is the most significant greenhouse gas produced by human activity.', usageNote: 'Abbreviated GHG. Key vocabulary for environment lectures.', difficulty: 'intermediate' },
        { word: 'ecosystem', meaning: 'A biological community of interacting organisms and their physical environment.', example: 'The loss of apex predators destabilizes the entire ecosystem below them.', usageNote: 'Includes biotic (living) and abiotic (non-living) components.', difficulty: 'intermediate' },
        { word: 'sequester', meaning: 'To isolate or store, especially in reference to carbon captured from the atmosphere.', example: 'Forests sequester large amounts of carbon dioxide, slowing climate change.', usageNote: 'Also a legal term (isolate a jury). Context determines meaning.', difficulty: 'advanced' },
        { word: 'endemic', meaning: 'Native to and restricted to a particular area or environment.', example: 'The Galápagos tortoise is endemic to the Galápagos Islands.', usageNote: 'Do not confuse with epidemic (disease). Endemic species = found nowhere else.', difficulty: 'advanced' },
        { word: 'migration', meaning: 'The seasonal movement of animals from one region to another.', example: 'The annual migration of monarch butterflies spans thousands of miles.', usageNote: 'Also used for human population movement.', difficulty: 'beginner' },
        { word: 'sustainable', meaning: 'Capable of being maintained without depleting natural resources or harming the environment.', example: 'Sustainable fishing practices ensure that fish populations are not exhausted.', usageNote: 'Paired with: development, agriculture, energy, practices.', difficulty: 'intermediate' },
        { word: 'carbon footprint', meaning: 'The total greenhouse gases produced by an individual, organization, or activity.', example: 'Switching to renewable energy significantly reduces a company\'s carbon footprint.', usageNote: 'Measured in tonnes of CO₂ equivalent.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Psychology & Behavior',
      items: [
        { word: 'cognition', meaning: 'The mental processes involved in acquiring knowledge through thought and experience.', example: 'Research on animal cognition has revealed surprising problem-solving abilities in crows.', usageNote: 'Adjective: cognitive. Related: perception, memory, reasoning.', difficulty: 'intermediate' },
        { word: 'stimulus', meaning: 'Something that causes a physiological or psychological response.', example: 'The smell of food acts as a stimulus that triggers hunger-related behavior.', usageNote: 'Plural: stimuli. Pairs with "response" in behavioral research.', difficulty: 'intermediate' },
        { word: 'conditioned response', meaning: 'A learned reaction to a stimulus that was previously neutral.', example: 'Pavlov\'s dogs exhibited a conditioned response by salivating at the sound of a bell.', usageNote: 'Core concept in classical conditioning (Pavlov).', difficulty: 'advanced' },
        { word: 'intrinsic motivation', meaning: 'Motivation driven by internal rewards such as enjoyment or personal satisfaction.', example: 'Students with intrinsic motivation tend to engage more deeply with their coursework.', usageNote: 'Contrasted with extrinsic motivation (external rewards).', difficulty: 'advanced' },
        { word: 'perception', meaning: 'The way in which sensory information is organized and interpreted by the brain.', example: 'Color perception varies across individuals due to differences in cone cell sensitivity.', usageNote: 'Related: sensation (detecting) vs. perception (interpreting).', difficulty: 'intermediate' },
        { word: 'bias', meaning: 'A systematic deviation from rational judgment, often unconscious.', example: 'Confirmation bias leads people to favor information that supports existing beliefs.', usageNote: 'Types: cognitive bias, selection bias, anchoring bias.', difficulty: 'intermediate' },
        { word: 'habituation', meaning: 'Decreased response to a stimulus after repeated exposure.', example: 'City dwellers often show habituation to traffic noise over time.', usageNote: 'Not the same as fatigue; it is a learned change in response.', difficulty: 'advanced' },
        { word: 'empathy', meaning: 'The ability to understand and share the feelings of another.', example: 'High empathy levels are associated with stronger prosocial behaviors.', usageNote: 'Contrasted with sympathy: empathy is sharing feelings; sympathy is acknowledging them.', difficulty: 'beginner' },
        { word: 'reinforcement', meaning: 'A consequence that strengthens or increases the likelihood of a behavior.', example: 'Positive reinforcement, like praise, is more effective than punishment for long-term learning.', usageNote: 'Positive: adds a reward. Negative: removes an unpleasant stimulus.', difficulty: 'intermediate' },
        { word: 'conformity', meaning: 'The tendency to align one\'s behavior with group norms or expectations.', example: 'Asch\'s line experiments demonstrated how social pressure drives conformity.', usageNote: 'Distinguish from compliance (acting outwardly) and internalization (believing it).', difficulty: 'advanced' }
      ]
    },
    {
      topic: 'Art, Music & Architecture',
      items: [
        { word: 'Stradivarius', meaning: 'A violin or other instrument made by the Italian craftsman Antonio Stradivari (1644–1737).', example: 'Stradivarius violins are prized for their exceptional tonal quality and are worth millions today.', usageNote: 'TOEFL lecture topic (violin history). Note the historical context of Renaissance craft.', difficulty: 'advanced' },
        { word: 'acoustics', meaning: 'The properties of a room or building that determine how sound is transmitted within it.', example: 'The concert hall was redesigned to improve its acoustics after audiences complained of echo.', usageNote: 'Also the branch of physics dealing with sound.', difficulty: 'intermediate' },
        { word: 'motif', meaning: 'A recurring element or theme in artistic, literary, or musical work.', example: 'The composer used a four-note motif throughout the symphony to create unity.', usageNote: 'Plural: motifs. Common in art, literature, and music analysis.', difficulty: 'intermediate' },
        { word: 'fresco', meaning: 'A technique of mural painting executed on freshly laid wet plaster.', example: 'Michelangelo\'s Sistine Chapel ceiling is the world\'s most famous fresco.', usageNote: 'From Italian: "fresh." Related: al fresco (in the open air).', difficulty: 'advanced' },
        { word: 'symmetry', meaning: 'Exact correspondence of form and arrangement on both sides of a dividing line.', example: 'Greek temples exhibit perfect bilateral symmetry in their colonnaded facades.', usageNote: 'Types: bilateral, radial, rotational. Common in architecture and biology.', difficulty: 'intermediate' },
        { word: 'genre', meaning: 'A category or style of artistic, musical, or literary work.', example: 'Baroque music is a genre characterized by ornate style and complex counterpoint.', usageNote: 'Borrowed from French. Pronounced ZHON-ruh.', difficulty: 'intermediate' },
        { word: 'patron', meaning: 'A person who supports or sponsors an artist, musician, or artistic institution.', example: 'The Medici family were famous patrons who funded Renaissance artists and architects.', usageNote: 'Related: patronage, patronize (to support).', difficulty: 'intermediate' },
        { word: 'restoration', meaning: 'The process of returning something to its original condition.', example: 'The restoration of the ancient Roman mosaic took three years of painstaking work.', usageNote: 'Common in art history and archaeology contexts.', difficulty: 'intermediate' },
        { word: 'composition', meaning: 'The arrangement of elements in a work of art or music; also a piece of music.', example: 'The painting\'s composition draws the viewer\'s eye to the central figure first.', usageNote: 'In music: the process of creating a piece. In art: the arrangement of elements.', difficulty: 'intermediate' },
        { word: 'abstract', meaning: 'Art that does not depict real objects but uses shapes, colors, and forms to express ideas.', example: 'Kandinsky was a pioneer of abstract art, believing color alone could convey emotion.', usageNote: 'Contrast with representational or figurative art.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Economics & Business',
      items: [
        { word: 'supply and demand', meaning: 'The economic model describing price as determined by the amount available and buyers\' desire for it.', example: 'As drought reduced harvests, supply and demand pushed grain prices to record highs.', usageNote: 'Law: price rises when demand exceeds supply; falls when supply exceeds demand.', difficulty: 'beginner' },
        { word: 'inflation', meaning: 'A general increase in prices and corresponding fall in the purchasing power of money.', example: 'Central banks raise interest rates to control rising inflation.', usageNote: 'Related: deflation (falling prices), stagflation (high inflation + stagnation).', difficulty: 'intermediate' },
        { word: 'monopoly', meaning: 'Exclusive control of a commodity or service by one provider.', example: 'Standard Oil\'s monopoly over petroleum refining was broken up by the US government in 1911.', usageNote: 'Related: oligopoly (few firms), duopoly (two firms).', difficulty: 'intermediate' },
        { word: 'subsidy', meaning: 'Money granted by the government to support a business or industry.', example: 'Agricultural subsidies help small farmers compete with large corporate producers.', usageNote: 'Verb: subsidize. Often a TOEFL integrated writing topic.', difficulty: 'intermediate' },
        { word: 'entrepreneur', meaning: 'A person who organizes and runs a business, taking on financial risk for profit.', example: 'Young entrepreneurs are increasingly founding tech startups rather than joining corporations.', usageNote: 'Related: entrepreneurship, venture capital, startup.', difficulty: 'intermediate' },
        { word: 'gross domestic product', meaning: 'The total monetary value of all goods and services produced within a country in a given period.', example: 'A country\'s GDP growth is often used as a proxy for its overall economic health.', usageNote: 'Abbreviated GDP. Distinguished from GNP (Gross National Product).', difficulty: 'intermediate' },
        { word: 'tariff', meaning: 'A tax or duty imposed on imported or exported goods.', example: 'The government imposed steep tariffs on imported steel to protect domestic manufacturers.', usageNote: 'Common in trade policy discussions. Related: quota, trade barrier.', difficulty: 'intermediate' },
        { word: 'fiscal policy', meaning: 'Government decisions on taxation and spending to influence the economy.', example: 'During the recession, expansionary fiscal policy increased government spending to stimulate growth.', usageNote: 'Distinguish from monetary policy (central bank interest rates and money supply).', difficulty: 'advanced' },
        { word: 'opportunity cost', meaning: 'The value of the next best alternative foregone when making a decision.', example: 'The opportunity cost of attending graduate school is the income foregone from full-time work.', usageNote: 'Key concept in microeconomics and decision-making.', difficulty: 'advanced' },
        { word: 'recession', meaning: 'A period of temporary economic decline with falling GDP for two or more quarters.', example: 'Unemployment rates typically surge during a recession as businesses cut staff.', usageNote: 'A prolonged severe recession is called a depression.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Astronomy & Physics',
      items: [
        { word: 'nebula', meaning: 'A giant cloud of gas and dust in space; the birthplace of stars.', example: 'The Orion Nebula is a stellar nursery where new stars are currently forming.', usageNote: 'Plural: nebulae or nebulas. From Latin: "mist, cloud."', difficulty: 'intermediate' },
        { word: 'orbit', meaning: 'The curved path of an object around a star, planet, or moon.', example: 'The Moon completes one orbit around Earth approximately every 27.3 days.', usageNote: 'As a verb: "The satellite orbits Earth." Related: elliptical, circular orbit.', difficulty: 'beginner' },
        { word: 'gravitational pull', meaning: 'The attractive force exerted by a massive body on surrounding objects.', example: 'The Sun\'s gravitational pull keeps all eight planets in their orbits.', usageNote: 'Greater mass = stronger pull. Used in TOEFL astronomy lectures.', difficulty: 'intermediate' },
        { word: 'black hole', meaning: 'A region of spacetime with gravity so strong that nothing, not even light, can escape.', example: 'The first image of a black hole was captured by the Event Horizon Telescope in 2019.', usageNote: 'Types: stellar, supermassive, primordial.', difficulty: 'intermediate' },
        { word: 'electromagnetic spectrum', meaning: 'The range of all types of electromagnetic radiation from radio waves to gamma rays.', example: 'Astronomers observe stars across the full electromagnetic spectrum, not just visible light.', usageNote: 'In order: radio, microwave, infrared, visible, UV, X-ray, gamma.', difficulty: 'advanced' },
        { word: 'hypothesis', meaning: 'A testable proposed explanation for observed phenomena.', example: 'Scientists form a hypothesis and then design experiments to test its predictions.', usageNote: 'Plural: hypotheses. A confirmed hypothesis may become a theory.', difficulty: 'intermediate' },
        { word: 'velocity', meaning: 'The speed of something in a given direction.', example: 'The escape velocity from Earth\'s surface is approximately 11.2 km per second.', usageNote: 'Distinguished from speed: velocity includes direction (vector); speed does not.', difficulty: 'intermediate' },
        { word: 'radiation', meaning: 'Energy emitted as electromagnetic waves or subatomic particles.', example: 'The Sun emits radiation across a wide spectrum, including harmful ultraviolet rays.', usageNote: 'Not inherently dangerous; depends on type and dose.', difficulty: 'intermediate' },
        { word: 'inertia', meaning: 'The tendency of an object to remain at rest or in uniform motion unless acted on by a force.', example: 'Newton\'s first law describes the principle of inertia in classical mechanics.', usageNote: 'Colloquial meaning: reluctance to change. Academic: physics concept.', difficulty: 'advanced' },
        { word: 'constellation', meaning: 'A group of stars forming a recognized pattern and named after a mythological figure or object.', example: 'Orion is one of the most recognizable constellations in the winter night sky.', usageNote: '88 official constellations recognized by the IAU.', difficulty: 'beginner' }
      ]
    },
    {
      topic: 'Academic Vocabulary (AWL)',
      items: [
        { word: 'analyze', meaning: 'To examine in detail in order to understand or explain something.', example: 'The researcher analyzed the data and identified three significant patterns.', usageNote: 'In TOEFL integrated tasks, you analyze both reading and listening content.', difficulty: 'beginner' },
        { word: 'consequence', meaning: 'A result or effect of an action or condition.', example: 'One consequence of deforestation is the loss of animal habitats.', usageNote: 'Often modified: "serious," "long-term," "unintended" consequences.', difficulty: 'beginner' },
        { word: 'evident', meaning: 'Plainly seen or understood; obvious.', example: 'It was evident from the data that temperatures had risen significantly.', usageNote: 'Related: evidence, evidently. Often used in academic argumentation.', difficulty: 'beginner' },
        { word: 'contradict', meaning: 'To say or do the opposite of what someone else has said or done.', example: 'The lecturer\'s claims often contradicted the assumptions in the reading passage.', usageNote: 'Key TOEFL skill: identifying when lecture contradicts reading.', difficulty: 'intermediate' },
        { word: 'implication', meaning: 'A likely consequence or conclusion suggested by something.', example: 'The study\'s findings have broad implications for public health policy.', usageNote: 'Related: imply (verb), implied (adjective). Distinguish from "explicit."', difficulty: 'intermediate' },
        { word: 'phenomenon', meaning: 'A fact or situation that is observed to exist, especially one whose cause is unknown.', example: 'The researchers struggled to explain the phenomenon of ball lightning.', usageNote: 'Plural: phenomena (not "phenomenons").', difficulty: 'intermediate' },
        { word: 'assume', meaning: 'To take something for granted without proof.', example: 'Many early geographers assumed that Earth was at the center of the solar system.', usageNote: 'Related: assumption, presumably. Watch for "the author assumes" in questions.', difficulty: 'beginner' },
        { word: 'incorporate', meaning: 'To include or integrate as part of a whole.', example: 'The architect incorporated sustainable design principles into the new campus buildings.', usageNote: 'Often used with "into": "incorporate X into Y."', difficulty: 'intermediate' },
        { word: 'undermine', meaning: 'To weaken or damage, especially gradually or insidiously.', example: 'New evidence undermined the previously accepted theory of dinosaur extinction.', usageNote: 'Often used in TOEFL listening to describe how lectures challenge reading passages.', difficulty: 'intermediate' },
        { word: 'coherent', meaning: 'Logical and consistent; easy to follow.', example: 'The professor praised the student for presenting a coherent and well-supported argument.', usageNote: 'Related: coherence (noun), incoherent (opposite). Important for TOEFL writing scores.', difficulty: 'intermediate' }
      ]
    },
    {
      topic: 'Conversational & Function Words',
      items: [
        { word: 'confirm', meaning: 'To establish the truth or certainty of something previously believed.', example: 'Can you confirm that the library closes at nine tonight?', usageNote: 'Common in TOEFL campus conversation dialogues. Related: confirmation.', difficulty: 'beginner' },
        { word: 'in particular', meaning: 'Especially; specifically; used to single out one item from a group.', example: 'The professor praised one paper in particular for its originality.', usageNote: 'Useful as a transition phrase in TOEFL speaking and writing.', difficulty: 'beginner' },
        { word: 'consume', meaning: 'To use up a resource; to eat or drink; to absorb someone\'s attention.', example: 'Streaming video consumes far more bandwidth than audio files.', usageNote: 'Related: consumption, consumer, consumable.', difficulty: 'beginner' },
        { word: 'unique', meaning: 'Being the only one of its kind; unlike anything else.', example: 'Stradivari\'s technique for varnishing wood remains unique and has never been replicated.', usageNote: 'Avoid "very unique" — unique is absolute. Use "highly distinctive" instead.', difficulty: 'beginner' },
        { word: 'function', meaning: 'The purpose or role that something performs; to work or operate.', example: 'The caecum functions as a fermentation chamber in the koala\'s digestive system.', usageNote: 'TOEFL question type: "What is the function of the lecture\'s third paragraph?"', difficulty: 'beginner' },
        { word: 'depend on', meaning: 'To rely on or be contingent upon something or someone.', example: 'The success of the experiment depended on maintaining a constant temperature.', usageNote: 'Related: dependent, dependency, independent. Common in academic contexts.', difficulty: 'beginner' },
        { word: 'gather', meaning: 'To collect information, data, or people; to come together.', example: 'Researchers gathered data from over 400 participants across five countries.', usageNote: 'Synonyms: collect, compile, assemble. Common in methodology sections.', difficulty: 'beginner' },
        { word: 'emotion', meaning: 'A strong mental or instinctive feeling such as love, fear, joy, or anger.', example: 'Music has a unique ability to trigger strong emotions in listeners.', usageNote: 'Related: emotional, emotionally, unemotional. Key in psychology lectures.', difficulty: 'beginner' },
        { word: 'remove', meaning: 'To take something away from a place or position.', example: 'Researchers removed the variable to isolate the cause of the observed effect.', usageNote: 'Formal alternatives: eliminate, extract, withdraw.', difficulty: 'beginner' },
        { word: 'support', meaning: 'To provide evidence for a claim; to hold something up; to help someone.', example: 'The fossil record supports the theory of gradual evolution over millions of years.', usageNote: 'TOEFL key phrase: "The lecture supports / challenges the reading."', difficulty: 'beginner' }
      ]
    }
  ]
};

write('toefl', 'vocabulary', toeflVocab);

// ─── TOEFL STRATEGIES ────────────────────────────────────────────────────────
const toeflStrategies = {
  exam: 'TOEFL iBT',
  section: 'strategies',
  lastUpdated: now,
  strategies: [
    {
      section: 'Listening – Main Topic/Purpose',
      tips: [
        'Listen carefully to the first 20–30 seconds; the topic is almost always introduced immediately.',
        'The correct answer paraphrases the main idea — avoid answers that focus on minor details.',
        'For lectures, the main purpose is often to "describe," "explain," or "discuss" a process or concept.',
        'For conversations, ask: Is the student making a request, solving a problem, or getting information?',
        'Eliminate answers that use words from the audio but misrepresent the overall meaning.',
        'Professors sometimes signal the topic explicitly: "Today I want to talk about…" — note these.',
        'The title of the lecture is never stated directly; infer it from repeated key words.',
        'Do not choose an answer simply because it sounds academic or complex.',
        'Main idea questions appear first; your answer should cover the whole listening, not part of it.',
        'Practice summarizing each listening in one sentence immediately after it ends.'
      ]
    },
    {
      section: 'Listening – Detail Questions',
      tips: [
        'Detail questions test specific facts — who, what, when, where, why, how much.',
        'Take notes using abbreviations: → (leads to), = (equals), w/ (with), b/c (because).',
        'Wrong answers often change one key word (e.g., "three times a week" → "three weeks").',
        'Review your notes before answering; do not rely on memory alone for numbers and names.',
        'If you missed a detail, use context and elimination to choose the best answer.',
        'Beware of answers that are true in general but were not stated in the listening.',
        'The answer to a detail question matches the audio almost word-for-word — look for paraphrases.',
        'Details about experiments often appear: who conducted it, what they found, what it means.',
        'Write down all numbers you hear — dates, percentages, quantities — they are frequently tested.',
        'Practice identifying the difference between what the professor states vs. what students suggest.'
      ]
    },
    {
      section: 'Listening – Function Questions',
      tips: [
        'Function questions ask: "Why does the professor say X?" Focus on purpose, not literal meaning.',
        'Common functions: to clarify, to give an example, to introduce a contrast, to express doubt.',
        'The answer usually describes what the speaker is doing, not what they are saying.',
        'Pay attention to tone and intonation — sarcasm, humor, and emphasis signal functions.',
        'Listen for discourse markers before the target segment: "for instance," "however," "actually."',
        'A professor saying "That\'s not quite right" may be diplomatically correcting a student — function: correction.',
        'An anecdote or story is usually used as an example to illustrate a broader concept.',
        'If the professor repeats something, the function is often to emphasize or clarify.',
        'Function questions often replay a short audio clip — listen for the sentence before and after.',
        'Eliminate answers that describe the literal content rather than the communicative purpose.'
      ]
    },
    {
      section: 'Listening – Attitude Questions',
      tips: [
        'Attitude questions test opinions, feelings, and certainty: "What does the professor think about X?"',
        'Key signals: hedging language (might, could, possibly) = uncertainty; strong verbs = confidence.',
        'A professor using "unfortunately" or "sadly" signals a negative attitude.',
        'Enthusiasm markers: "What\'s remarkable is…," "Interestingly…," "Remarkably…"',
        'Doubt markers: "It\'s not entirely clear…," "The evidence is mixed…," "Some argue…"',
        'Do not assume the professor agrees with the textbook view — they often present their own opinion.',
        'Listen for contrasts: "While many scientists believe X, I find it more likely that Y."',
        'Replay the audio segment in your mind; attitude is often conveyed through prosody (tone, stress).',
        'Eliminate answers with extreme certainty or extreme negativity unless clearly supported.',
        'A common trap: choosing the attitude of a researcher described in the lecture vs. the professor\'s own view.'
      ]
    },
    {
      section: 'Listening – Organization Questions',
      tips: [
        'Organization questions ask how the lecture is structured: "Why does the professor begin with X?"',
        'Common structures: problem–solution, cause–effect, compare–contrast, general–to–specific.',
        'Professors often begin with background to contextualize the main topic — answer: "to provide context."',
        'An anecdote at the start is usually used "to introduce the main topic" or "to engage the audience."',
        'Track the flow of ideas in your notes with arrows or numbered points.',
        'Transition phrases signal structure: "First… then… finally…" = sequential; "On the other hand…" = contrast.',
        'Questions may ask about the purpose of a specific section, not just the opening.',
        'Answers describing "definitions" appear when the professor stops to clarify a technical term.',
        'Listen for the professor stepping back: "So to recap…" signals the end of a main section.',
        'Practice drawing a simple outline while listening to map the lecture\'s logical flow.'
      ]
    },
    {
      section: 'Listening – Connecting Content Questions',
      tips: [
        'Connecting content questions use tables, diagrams, or matching — identify relationships between concepts.',
        'Common formats: "Does the professor indicate these statements are true, false, or not mentioned?"',
        'Take notes on comparisons: draw two columns if the professor is comparing two things.',
        'These questions test whether you understood relationships, not isolated facts.',
        'Beware of "not mentioned" — if you did not hear it, do not assume it was implied.',
        'When filling a table, ensure each item goes in the correct category from the lecture.',
        'Listen for the professor listing items in order — numbers and sequences are heavily tested here.',
        'Cause-and-effect chains are common: note what causes what and what follows from what.',
        'Eliminate answers that combine information from different parts of the lecture incorrectly.',
        'Practice recreating simple diagrams from memory after listening to science-heavy lectures.'
      ]
    },
    {
      section: 'Listening – Inference Questions',
      tips: [
        'Inference questions ask what can be concluded that was not directly stated.',
        'The correct answer is logically supported by the audio — it follows naturally from what was said.',
        'Avoid answers that go too far beyond the text or require outside knowledge.',
        'Signal phrases: "It can be inferred that…," "What does the professor imply about…?"',
        'A professor saying "Further research is needed" implies the current evidence is incomplete.',
        'If the professor describes a problem without a solution, you can infer it remains unresolved.',
        'Look for implicit comparisons: "Unlike older models, this approach…" implies the old had weaknesses.',
        'Eliminate answers that contradict anything explicitly stated in the audio.',
        'Connecting two stated facts to produce a third unstated fact is the core inference skill.',
        'Practice by pausing after each paragraph and asking: "What can I reasonably conclude from this?"'
      ]
    },
    {
      section: 'Reading – Strategies',
      tips: [
        'Read the question before reading the passage — know what to look for first.',
        'Vocabulary-in-context questions: read 2 sentences before and after the word; choose the synonym that fits.',
        'Reference questions (it, they, this): find the noun that the pronoun logically replaces.',
        'Inference questions: the answer is implied but not stated — stay close to the text.',
        'Insert-a-sentence questions: look for logical connectors (however, therefore, for example) to find the right spot.',
        'Summary questions: correct answers are main ideas; eliminate details and information not in the passage.',
        'Manage time: you have about 20 minutes per passage — do not spend more than 2 minutes on any one question.',
        'Eliminate two clearly wrong answers first, then choose between the remaining two.',
        'Do not use outside knowledge — all answers must come from the passage.',
        'Academic Reading Vocabulary List (AWL) words appear frequently — learn them systematically.'
      ]
    },
    {
      section: 'Writing – Integrated Task',
      tips: [
        'Take notes on the reading before the audio; your notes disappear but the reading returns.',
        'The lecture ALWAYS challenges, casts doubt on, or contradicts the reading — never supports it.',
        'Structure: Introduction → Point 1 (lecture vs. reading) → Point 2 → Point 3 → Conclusion.',
        'Use reporting language: "The professor argues that…," "According to the passage…"',
        'Do not give your own opinion — only summarize the relationship between the two sources.',
        'Each body paragraph should: state the reading\'s claim, then explain how the lecture challenges it.',
        'Aim for 250–350 words. Under 150 words risks a low score; over 400 risks focus issues.',
        'Use varied transitions: "Furthermore," "In contrast," "This directly undermines the claim that…"',
        'Avoid copying sentences from the reading word-for-word — paraphrase.',
        'Leave 2 minutes at the end to proofread for grammar and spelling errors.'
      ]
    },
    {
      section: 'Speaking – Independent & Integrated Tasks',
      tips: [
        'Use the 15-second preparation time to write a 3-point outline, not full sentences.',
        'Begin immediately with your position — do not waste 5 seconds with "I think that I would choose…"',
        'Structure every response: State position → Reason 1 + example → Reason 2 + example → Conclusion.',
        'Speak clearly and at a moderate pace — rushing leads to pronunciation errors and dropped endings.',
        'Connecting phrases raise your score: "Building on this point…," "This is relevant because…"',
        'For integrated speaking, cover both the reading and the lecture — the student\'s view counts too.',
        'Use specific details from the listening rather than vague paraphrases.',
        'Do not pause silently — if you lose your place, use fillers briefly: "What I mean is…"',
        'Record yourself and compare to TOEFL sample responses — identify rate, clarity, and fluency gaps.',
        'Target 130–170 words per minute: fast enough to say enough, slow enough to be understood.'
      ]
    }
  ]
};

write('toefl', 'strategies', toeflStrategies);
console.log('TOEFL done.');
