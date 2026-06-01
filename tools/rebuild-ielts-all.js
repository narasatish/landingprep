/**
 * rebuild-ielts-all.js
 * Rebuilds IELTS reading tests (60) with real academic passages sourced from uploaded PDFs,
 * rewrites vocabulary.json with 120 genuine high-frequency IELTS words,
 * and adds new writing prompts from the practice-tests PDF.
 * Run: node tools/rebuild-ielts-all.js
 */

const fs = require("fs");
const path = require("path");

const OUT_R  = "content/ielts/reading";
const OUT_W  = "content/ielts/writing";
const OUT_V  = "content/learning-hub/ielts/vocabulary.json";
const OUT_S  = "content/learning-hub/ielts/strategies.json";

// ─────────────────────────────────────────────────────────────────────────────
// PASSAGE POOL  (real passages adapted from uploaded PDFs + additional originals)
// ─────────────────────────────────────────────────────────────────────────────

const PASSAGE_POOL = [

  // ── P01: William Henry Perkin (adapted from PDF) ──
  {
    id:"p01", title:"The Inventor of Synthetic Dye",
    text:`William Henry Perkin was born on March 12, 1838, in London. As a boy, his curiosity prompted early interests in the arts, sciences, photography, and engineering. It was a chance discovery of a run-down yet functional laboratory in his late grandfather's home that solidified his enthusiasm for chemistry.

At the City of London School, Perkin became immersed in the study of chemistry. His talent and devotion were recognised by his teacher, Thomas Hall, who encouraged him to attend a series of lectures given by the eminent scientist Michael Faraday at the Royal Institution. Those speeches fired his enthusiasm, and he later went on to attend the Royal College of Chemistry, which he entered in 1853, at the age of 15.

At the time of Perkin's enrolment, the Royal College of Chemistry was headed by the noted German chemist August Wilhelm Hofmann. Perkin's scientific gifts soon caught Hofmann's attention and, within two years, he became Hofmann's youngest assistant. Not long after that, Perkin made the scientific breakthrough that would bring him both fame and fortune.

At the time, quinine was the only viable medical treatment for malaria. The drug is derived from the bark of the cinchona tree, native to South America, and by 1856 demand was surpassing the available supply. When Hofmann made some passing comments about the desirability of a synthetic substitute, it was unsurprising that his star pupil was moved to take up the challenge.

During his vacation in 1856, Perkin worked in a laboratory on the top floor of his family's house, attempting to manufacture quinine from aniline, an inexpensive coal tar waste product. He did not end up with quinine but instead produced a mysterious dark sludge. Further investigation — incorporating potassium dichromate and alcohol — yielded a deep purple solution. Proving the truth of Louis Pasteur's words that 'chance favours only the prepared mind', Perkin saw the potential of his unexpected find.

Perkin grasped that his purple solution could colour fabric, making it the world's first synthetic dye. He patented it quickly and named it Tyrian Purple, though it later became commonly known as mauve. With his father and brother, Perkin set up a factory near London that produced the world's first synthetically dyed material in 1857. The commercial boost came from Empress Eugenie of France, and very soon mauve was the necessary shade for fashionable ladies across Europe.

Beyond mere decoration, Perkin's dyes became vital to medical research. They were used to stain previously invisible microbes, allowing researchers to identify bacilli such as tuberculosis, cholera, and anthrax. Artificial dyes continue to play a crucial role today, and — in what would have been particularly pleasing to Perkin — their current use includes the search for a vaccine against malaria.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Thomas Hall was the first person to recognise Perkin's ability as a student of chemistry.",a:"TRUE",e:"Paragraph 2 states Perkin's talent was recognised by his teacher, Thomas Hall."},
      {type:"true_false_not_given",num:2,prompt:"Michael Faraday suggested Perkin should enrol in the Royal College of Chemistry.",a:"NOT GIVEN",e:"The passage says Hall encouraged him to attend Faraday's lectures; no mention of Faraday recommending enrolment."},
      {type:"true_false_not_given",num:3,prompt:"Hofmann worked as an assistant under Perkin at the Royal College of Chemistry.",a:"FALSE",e:"Hofmann was the head of the Royal College; Perkin became Hofmann's assistant, not the other way around."},
      {type:"true_false_not_given",num:4,prompt:"Perkin was still a teenager when he made the discovery that brought him fame and fortune.",a:"TRUE",e:"He entered the college at 15 and the breakthrough came shortly after, while he was still young."},
      {type:"true_false_not_given",num:5,prompt:"Cinchona trees, the source of quinine, grow only in South America.",a:"NOT GIVEN",e:"The passage says the tree is 'native to South America' but does not claim it grows exclusively there."},
      {type:"true_false_not_given",num:6,prompt:"Perkin's goal was to produce a drug for malaria from a coal tar waste product.",a:"TRUE",e:"He was attempting to manufacture quinine from aniline, a coal tar waste product."},
      {type:"true_false_not_given",num:7,prompt:"Perkin was inspired to pursue his research by the discoveries made by Louis Pasteur.",a:"NOT GIVEN",e:"Pasteur is quoted, but the passage does not say Perkin was inspired by Pasteur's discoveries."},
      {type:"sentence_completion",num:8,prompt:"Perkin's first synthetic dye was produced not from quinine but from aniline, which is a _____ of coal tar.",a:"waste product",e:"The passage describes aniline as 'an inexpensive coal tar waste product'."},
      {type:"sentence_completion",num:9,prompt:"The commercial success of Perkin's dye was boosted when _____ decided to wear the colour.",a:"Empress Eugenie of France",e:"Paragraph 6 names Empress Eugenie as providing the commercial boost."},
      {type:"sentence_completion",num:10,prompt:"Perkin's dyes contributed to medicine by enabling scientists to identify bacteria such as _____.",a:"tuberculosis / cholera / anthrax",e:"Paragraph 7 lists these three bacteria identified using synthetic dyes."},
    ]
  },

  // ── P02: SETI – Extraterrestrial Intelligence (adapted from PDF) ──
  {
    id:"p02", title:"Listening to the Universe",
    text:`The question of whether we are alone in the Universe has haunted humanity for centuries, but we may now stand poised on the brink of answering it, as scientists search for radio signals from other intelligent civilisations. This search, often known by the acronym SETI (Search for Extra-Terrestrial Intelligence), is a difficult one. Although groups around the world have been searching intermittently for three decades, it is only recently that technology has reached a level where a determined attempt to search all nearby stars for any sign of life has become feasible.

The primary reason for the search is basic curiosity — the same curiosity that drives all pure science. We want to know whether we are alone in the Universe and whether life evolves naturally if given the right conditions. The simple detection of a radio signal would be sufficient to answer this most fundamental of all questions. However, there are other reasons for interest in extraterrestrial life. We have had civilisation for perhaps only a few thousand years, and threats from nuclear war and pollution over recent decades suggest our survival may be tenuous. Since any other civilisation we hear from is likely to be far older on average, its mere existence would confirm that long-term survival is possible. It is even conceivable that an older civilisation might share the benefits of its experience in dealing with threats to survival.

In discussing whether we are alone, most SETI scientists adopt two ground rules. First, UFOs are generally ignored, since most scientists do not consider the evidence strong enough to bear serious examination. Second, a very conservative assumption is made that we are looking for a life form that is broadly similar to us: one that communicates with its fellows, is interested in the Universe, and lives on a planet orbiting a sun-like star.

An alien civilisation could send information across the galaxy in many ways, but most methods either require too much energy or suffer severe attenuation over vast distances. Radio waves in the frequency range 1,000 to 3,000 MHz travel the greatest distance for a given amount of transmitted power, so all searches to date have concentrated on this range. So far, no detection has been made among the few hundred stars which have been searched. The scale was increased dramatically in 1992 when the US Congress voted NASA ten million dollars per year for ten years to conduct a thorough search. Part of this project is a targeted search using the world's largest radio telescopes; another part is an undirected survey of all of space using the smaller antennas of NASA's Deep Space Network.

There is considerable debate over how humanity should react if a signal is detected. Everybody agrees that no immediate reply should be sent. Apart from the impracticality of responding over such distances at short notice, the question raises ethical issues that would have to be addressed by the global community. The stars being searched are hundreds of light years away, so even if a signal were received today, a reply would not arrive for centuries — making any delay of years or decades essentially irrelevant.`,
    questions:[
      {type:"yes_no_not_given",num:1,prompt:"An older alien civilisation could potentially help humanity overcome threats to its survival.",a:"YES",e:"Paragraph 2 states it is 'even conceivable that an older civilisation might share the benefits of its experience in dealing with threats to survival.'"},
      {type:"yes_no_not_given",num:2,prompt:"SETI scientists are searching for life forms that share at least some characteristics with humans.",a:"YES",e:"Paragraph 3 states they assume a life form 'broadly similar to us' that communicates and lives on a planet orbiting a sun-like star."},
      {type:"yes_no_not_given",num:3,prompt:"American and Australian scientists have conducted joint SETI research projects.",a:"NOT GIVEN",e:"The passage mentions Australian and American activities separately but does not refer to any joint research."},
      {type:"yes_no_not_given",num:4,prompt:"SETI scientists have already detected radio signals from several stars.",a:"NO",e:"Paragraph 4 explicitly states 'no detection has been made among the few hundred stars which have been searched.'"},
      {type:"yes_no_not_given",num:5,prompt:"The NASA SETI project was opposed by some members of the US Congress.",a:"NOT GIVEN",e:"Congress is mentioned only in relation to voting to fund the project; no opposition is described."},
      {type:"yes_no_not_given",num:6,prompt:"If an alien signal were received, it would be essential to reply as quickly as possible.",a:"NO",e:"Paragraph 5 states clearly that 'no immediate reply should be sent.'"},
      {type:"sentence_completion",num:7,prompt:"SETI researchers focus on radio waves in the frequency range of _____ to 3,000 MHz because they travel the greatest distance for a given power.",a:"1,000",e:"Paragraph 4 specifies this frequency range."},
      {type:"sentence_completion",num:8,prompt:"The US Congress approved NASA funding of _____ per year in 1992 to accelerate the search for extraterrestrial life.",a:"ten million dollars",e:"Paragraph 4 states 'ten million dollars per year for ten years.'"},
    ]
  },

  // ── P03: Stepwells of India (adapted from PDF) ──
  {
    id:"p03", title:"Ancient Stepwells of India",
    text:`A millennium ago, stepwells were fundamental to life in the driest parts of India. During the sixth and seventh centuries, the inhabitants of Gujarat and Rajasthan developed a method of gaining access to clean groundwater during the dry season for drinking, bathing, watering animals, and irrigation. However, the significance of this invention goes far beyond its utilitarian application.

Unique to this region, stepwells are often architecturally complex and vary widely in size and shape. During their heyday, they were places of gathering, leisure, relaxation, and worship for villagers of all but the lowest classes. Most stepwells are found in the desert areas of Gujarat, where they are called vav, and Rajasthan, where they are called baori, while a few also survive in Delhi. Some were located in or near villages as public spaces for the community; others were positioned beside roads as resting places for travellers.

As their name suggests, stepwells comprise a series of stone steps descending from ground level to the water source, normally an underground aquifer, as it recedes following the rains. Some wells are vast, open craters with hundreds of steps paving each sloping side. Others are more elaborate, with long stepped passages leading to the water via several storeys. Built from stone and supported by pillars, they also included pavilions that sheltered visitors from the relentless heat. Perhaps the most impressive features are the intricate decorative sculptures showing activities from fighting and dancing to everyday acts such as women combing their hair or churning butter.

Down the centuries, thousands of wells were constructed throughout north-western India, but the majority have now fallen into disuse. Many are derelict and dry, as groundwater has been diverted for industrial use. Their condition has not been helped by dry spells: southern Rajasthan suffered an eight-year drought between 1996 and 2004.

However, some important sites have recently undergone major restoration. In Patan, the state's ancient capital, Rani Ki Vav (Queen's Stepwell) is perhaps the finest current example. Built by Queen Udayamati during the late eleventh century, it became silted up after a flood in the thirteenth century. The Archaeological Survey of India began restoring it in the 1960s. At 65 metres long, 20 metres wide and 27 metres deep, it features 500 sculptures carved into niches throughout the monument. In January 2001, this ancient structure survived an earthquake measuring 7.6 on the Richter scale.

Another notable example is the Chand Baori in the old ruined town of Abhaneri, built in around 850 AD. It comprises hundreds of zigzagging steps running along three of its sides, steeply descending eleven storeys, resulting in a striking geometrical pattern when seen from afar. Today, tourists flock to these monuments in far-flung corners of north-western India to gaze in wonder at architectural marvels that serve as a reminder of both the ingenuity of ancient civilisations and the enduring value of water to human existence.`,
    questions:[
      {type:"short_answer",num:1,prompt:"Which part of some stepwells provided shade for people using them?",a:"pavilions",e:"Paragraph 3 states 'they also included pavilions that sheltered visitors from the relentless heat.'"},
      {type:"short_answer",num:2,prompt:"What serious climatic event affected southern Rajasthan between 1996 and 2004?",a:"drought",e:"Paragraph 4 refers to 'an eight-year drought between 1996 and 2004.'"},
      {type:"short_answer",num:3,prompt:"What type of visitor commonly visits stepwells today?",a:"tourists",e:"The final paragraph states 'tourists flock to these monuments.'"},
      {type:"true_false_not_given",num:4,prompt:"Stepwells were accessible to people of all social classes during their heyday.",a:"FALSE",e:"Paragraph 2 says they were used 'for villagers of all but the lowest classes', meaning the lowest classes were excluded."},
      {type:"true_false_not_given",num:5,prompt:"Rani Ki Vav was built by Queen Udayamati in the eleventh century.",a:"TRUE",e:"Paragraph 5 confirms this."},
      {type:"true_false_not_given",num:6,prompt:"Chand Baori was constructed more recently than Rani Ki Vav.",a:"FALSE",e:"Chand Baori dates to around 850 AD; Rani Ki Vav was built in the late 11th century — so Chand Baori is older."},
      {type:"multiple_choice",num:7,prompt:"What is the primary reason most stepwells in India fell out of use?",
        opts:["A. They were deliberately destroyed by developers","B. Groundwater was redirected for industrial purposes","C. Droughts caused them to collapse structurally","D. The government banned their use"],
        a:"B",e:"Paragraph 4 states 'groundwater has been diverted for industrial use' as the main cause."},
      {type:"multiple_choice",num:8,prompt:"What is stated about the sculptures found in stepwells?",
        opts:["A. They were all commissioned by royalty","B. They only depict religious scenes","C. They show a variety of everyday and ceremonial activities","D. They were added during recent restoration work"],
        a:"C",e:"Paragraph 3 describes sculptures showing 'activities from fighting and dancing to everyday acts such as women combing their hair or churning butter.'"},
    ]
  },

  // ── P04: The Sense of Smell (adapted from PDF) ──
  {
    id:"p04", title:"The Hidden Power of Olfaction",
    text:`The sense of smell, or olfaction, is remarkably powerful. Odours affect us on a physical, psychological and social level. For the most part, however, we breathe in the aromas which surround us without being consciously aware of their importance to us. It is only when the faculty of smell is impaired for some reason that we begin to realise the essential role it plays in our sense of well-being.

A survey conducted by Anthony Synott at Montreal's Concordia University asked participants to comment on how important smell was to them in their lives. It became apparent that smell can evoke strong emotional responses. A scent associated with a good experience can bring a rush of joy, while a foul odour associated with a bad memory may cause disgust. Respondents noted that many of their olfactory likes and dislikes were based on emotional associations. Such associations can be powerful enough that odours generally labelled unpleasant become agreeable for particular individuals, and those considered fragrant become disagreeable.

Odours are also essential cues in social bonding. One respondent believed that there is no true emotional bonding without touching and smelling a loved one. Infants recognise the odours of their mothers soon after birth, and adults can often identify their children or spouses by scent alone. In one well-known test, women and men were able to distinguish by smell alone clothing worn by their marriage partners from similar clothing worn by other people.

In spite of its importance, smell is probably the most undervalued sense in many cultures. The reason often given is that, in comparison with its importance among animals, the human sense of smell seems feeble. While human olfactory powers are nothing like as fine as those of certain animals, they are still remarkably acute. Our noses are able to recognise thousands of smells and to perceive odours present only in extremely small quantities.

Smell is, however, a highly elusive phenomenon. Odours, unlike colours, cannot be named in many languages because the specific vocabulary simply does not exist. 'It smells like …,' we have to say when describing an odour, struggling to express our olfactory experience. Nor can odours be recorded: there is no effective way to capture or store them over time. Most research on smell undertaken to date has been of a physical scientific nature. Researchers have still to decide whether smell is one sense or two — one responding to odours proper and the other registering odourless chemicals in the air. Other unanswered questions are whether the nose is the only part of the body affected by odours, and how smells can be measured objectively given their non-physical components.

Smell is not simply a biological and psychological phenomenon; it is also cultural, hence social and historical. Odours are invested with cultural values: smells considered offensive in some cultures may be perfectly acceptable in others. Our commonly held feelings about smells can help distinguish us from other cultures, making the cultural history of smell, in a very real sense, an investigation into the essence of human culture itself.`,
    questions:[
      {type:"sentence_completion",num:1,prompt:"Tests have shown that odours can help people recognise _____ belonging to their marriage partners.",a:"clothing",e:"Paragraph 3 describes a test where people distinguished 'clothing worn by their marriage partners.'"},
      {type:"sentence_completion",num:2,prompt:"Some language communities find it difficult to describe smell because they lack the appropriate _____.",a:"vocabulary",e:"Paragraph 5 states that odours 'cannot be named in many languages because the specific vocabulary simply does not exist.'"},
      {type:"sentence_completion",num:3,prompt:"The sense of smell may involve response to _____ which do not smell, in addition to ordinary odours.",a:"chemicals",e:"Paragraph 5 asks whether smell also registers 'odourless chemicals in the air.'"},
      {type:"sentence_completion",num:4,prompt:"Odours regarded as unpleasant in certain _____ are not regarded as unpleasant in others.",a:"cultures",e:"Paragraph 6 states 'smells considered offensive in some cultures may be perfectly acceptable in others.'"},
      {type:"true_false_not_given",num:5,prompt:"Humans can identify members of their own family by smell alone.",a:"TRUE",e:"Paragraph 3 states adults can 'identify their children or spouses by scent alone.'"},
      {type:"true_false_not_given",num:6,prompt:"Scientists have agreed that smell is a single sense rather than two.",a:"FALSE",e:"Paragraph 5 says 'researchers have still to decide whether smell is one sense or two' — no agreement has been reached."},
      {type:"true_false_not_given",num:7,prompt:"The survey at Concordia University included participants from six different countries.",a:"NOT GIVEN",e:"The passage mentions the survey was conducted at Concordia University in Montreal but gives no information about participants' nationalities."},
    ]
  },

  // ── P05: Neuroaesthetics (adapted from PDF) ──
  {
    id:"p05", title:"The Science of Beauty",
    text:`An emerging discipline called neuroaesthetics is seeking to bring scientific objectivity to the study of art, and has already given us a better understanding of many masterpieces. The blurred imagery of Impressionist paintings seems to stimulate the brain's amygdala; since the amygdala plays a crucial role in our feelings, this finding might explain why many people find these pieces so moving.

Could the same approach also shed light on abstract twentieth-century pieces, from Mondrian's geometrical blocks of colour to Pollock's seemingly haphazard arrangements of splashed paint on canvas? Sceptics believe that people claim to like such works simply because they are famous. We certainly do have an inclination to follow the crowd. When asked to make simple perceptual decisions such as matching a shape to its rotated image, people often choose a definitively wrong answer if they see others doing the same. It is easy to imagine that this mentality would have even more impact on a fuzzy concept like art appreciation.

Angelina Hawley-Dolan of Boston College asked volunteers to view pairs of paintings — either the creations of famous abstract artists or the doodles of infants, chimps, and elephants — and judge which they preferred. A third of the paintings were given no captions, while many were labelled incorrectly: volunteers might think they were viewing a chimp's brushstrokes when they were actually seeing an acclaimed masterpiece. In each set of trials, volunteers generally preferred the work of renowned artists, even when they believed it was by an animal or a child. It seems that the viewer can sense the artist's vision in paintings, even without being able to explain why.

Robert Pepperell of Cardiff University creates ambiguous works that are neither entirely abstract nor clearly representational. In one study, volunteers were asked to decide how 'powerful' they considered an artwork and whether they saw anything familiar in it. The longer they took to answer, the more highly they rated the piece and the greater their neural activity. The brain appears to treat these images as puzzles, and the harder it is to decipher the meaning, the more rewarding is the moment of recognition.

As for artists such as Mondrian, whose paintings consist exclusively of horizontal and vertical lines encasing blocks of colour, eye-tracking studies confirm that his works are meticulously composed. Simply rotating a piece radically changes the way viewers engage with it. With the originals, volunteers' eyes tended to linger on certain areas, but with altered versions they moved more rapidly across the work. As a result, volunteers considered the altered versions less pleasurable.

Oshin Vartanian of Toronto University asked volunteers to compare original paintings with ones in which he had moved objects within the frame. Almost everyone preferred the original, whether it was a Van Gogh still life or an abstract by Miró. Vartanian also found that changing the composition reduced activation in those brain areas linked with meaning and interpretation.

It would be foolish, however, to reduce art appreciation to a set of scientific laws. We should not underestimate the importance of the style of a particular artist, their place in history, and the artistic environment of their time. Abstract art offers both a challenge and the freedom to play with different interpretations — in some ways not so different to science itself, where we are constantly seeking new systems and decoding meaning so that we can view and appreciate the world afresh.`,
    questions:[
      {type:"multiple_choice",num:1,prompt:"In the second paragraph, why does the writer refer to a shape-matching test?",
        opts:["A. To show that art appreciation is purely subjective","B. To argue that abstract art is poorly designed","C. To illustrate our tendency to be influenced by the opinions of others","D. To explain a common problem in processing visual data"],
        a:"C",e:"The shape-matching test illustrates how people follow the crowd rather than making independent judgements."},
      {type:"multiple_choice",num:2,prompt:"What do Hawley-Dolan's findings suggest about viewers of art?",
        opts:["A. They mostly favour works they already know","B. They are easily misled by labels and captions","C. They can perceive the artist's intention even without captions","D. They prefer works produced by children to those by professionals"],
        a:"C",e:"Paragraph 3 concludes that 'the viewer can sense the artist's vision in paintings, even without being able to explain why.'"},
      {type:"multiple_choice",num:3,prompt:"Results of studies involving Pepperell's pieces suggest that people",
        opts:["A. find it satisfying to work out what a painting represents","B. dislike art that is difficult to understand","C. vary widely in the time they spend looking at paintings","D. prefer realistic art to abstract art"],
        a:"A",e:"Paragraph 4 states 'the harder it is to decipher the meaning, the more rewarding is the moment of recognition.'"},
      {type:"multiple_choice",num:4,prompt:"What do experiments on Mondrian's paintings reveal?",
        opts:["A. They appear simple but are in fact carefully constructed","B. They can be interpreted in many different ways","C. They challenge assumptions about shape and colour","D. They are easier to appreciate than other abstract works"],
        a:"A",e:"Paragraph 5 states eye-tracking 'confirms that his works are meticulously composed' despite looking simple."},
      {type:"true_false_not_given",num:5,prompt:"Vartanian's study showed that most viewers prefer altered versions of paintings to the originals.",a:"FALSE",e:"Paragraph 6 states 'almost everyone preferred the original.'"},
      {type:"true_false_not_given",num:6,prompt:"The writer believes that scientific analysis alone can fully explain art appreciation.",a:"FALSE",e:"The final paragraph warns it 'would be foolish to reduce art appreciation to a set of scientific laws.'"},
    ]
  },

  // ── P06: Iconoclasts and the Brain (adapted from PDF) ──
  {
    id:"p06", title:"The Iconoclastic Mind",
    text:`In the last decade a revolution has occurred in the way that scientists think about the brain. We now know that the decisions humans make can be traced to the firing patterns of neurons in specific parts of the brain. These discoveries have led to the field known as neuroeconomics, which studies the brain's secrets to success in an economic environment that demands innovation and being able to do things differently from competitors. A brain that can do this is an iconoclastic one. An iconoclast is a person who does something that others say cannot be done.

This definition implies that iconoclasts are different from other people, but more precisely, it is their brains that are different in three distinct ways: perception, fear response, and social intelligence. Each of these three functions utilises a different circuit in the brain. Naysayers might suggest that the brain is irrelevant and that thinking in an original, even revolutionary, way is more a matter of personality than brain function. But the field of neuroeconomics was born out of the realisation that the physical workings of the brain place limitations on the way we make decisions.

The brain suffers from limited resources. It has a fixed energy budget, roughly equivalent to a 40-watt light bulb, and has therefore evolved to work as efficiently as possible. When confronted with information streaming from the eyes, the brain will interpret this information in the quickest way possible, drawing on past experience and other sources of information to make sense of what it sees. The brain takes shortcuts that work so well we are hardly ever aware of them. Perception is not simply a product of what the eyes transmit to the brain; it is a product of the brain itself. Iconoclasts have found ways to work around the perceptual shortcuts that plague most people.

The best way to see things differently is to expose the brain to things it has never encountered before. Novelty releases the perceptual process from the chains of past experience and forces the brain to make new judgements. Successful iconoclasts have an extraordinary willingness to be exposed to what is fresh and different.

The problem with novelty, however, is that it tends to trigger the brain's fear system. Fear is a major impediment to iconoclastic thinking. Two types of fear that particularly inhibit innovative thought are fear of uncertainty and fear of public ridicule. Fear of public speaking, which everyone must do from time to time, afflicts one-third of the population — making it too common to be considered a mental disorder.

Finally, to be successful, iconoclasts must sell their ideas to other people. This is where social intelligence comes in. Neuroscience has revealed which brain circuits are responsible for understanding what other people think, for empathy, fairness, and social identity. These brain regions play key roles in whether people can convince others of their ideas. Understanding how perception becomes intertwined with social decision-making shows why successful iconoclasts are so rare.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Neuroeconomics studies how brain function influences economic decision-making.",a:"TRUE",e:"Paragraph 1 defines neuroeconomics as studying 'the brain's secrets to success in an economic environment.'"},
      {type:"true_false_not_given",num:2,prompt:"Iconoclasts have a brain that uses fundamentally more energy than average.",a:"FALSE",e:"Paragraph 3 states all brains have the same 'fixed energy budget'; iconoclasts simply use it differently."},
      {type:"true_false_not_given",num:3,prompt:"Fear of public speaking affects a minority of the population.",a:"FALSE",e:"Paragraph 5 states it 'afflicts one-third of the population,' which is a significant minority but the passage characterises it as very common, not rare."},
      {type:"true_false_not_given",num:4,prompt:"Iconoclasts are willing to seek out new and unfamiliar experiences more than most people.",a:"TRUE",e:"Paragraph 4 states they have 'an extraordinary willingness to be exposed to what is fresh and different.'"},
      {type:"sentence_completion",num:5,prompt:"Neuroeconomics arose from the realisation that the brain's physical functioning places _____ on how we make decisions.",a:"limitations",e:"Paragraph 2 states the field was born from this realisation."},
      {type:"sentence_completion",num:6,prompt:"An iconoclast can be defined as a person who does something that others say _____.",a:"cannot be done",e:"Paragraph 1 gives this definition directly."},
      {type:"sentence_completion",num:7,prompt:"Exposing the brain to _____ forces it to make new judgements rather than relying on past experience.",a:"novelty",e:"Paragraph 4 explains that novelty 'releases the perceptual process from the chains of past experience.'"},
    ]
  },

  // ── P07: Telepathy and the Ganzfeld Experiments (adapted from PDF) ──
  {
    id:"p07", title:"Testing Telepathy",
    text:`Can human beings communicate by thought alone? For more than a century the issue of telepathy has divided the scientific community, and even today it still sparks bitter controversy among top academics. Since the 1970s, parapsychologists at leading universities and research institutes around the world have risked the derision of sceptical colleagues by putting the various claims for telepathy to the test in dozens of rigorous scientific studies.

Some researchers say the results constitute compelling evidence that telepathy is genuine. Other parapsychologists believe the field is on the brink of collapse, having tried to produce definitive scientific proof and failed. What sceptics and advocates alike do agree on is that the most impressive evidence so far has come from the so-called 'ganzfeld' experiments, a German term meaning 'whole field'. Reports of telepathic experiences by people during meditation led parapsychologists to suspect that telepathy might involve signals so faint they were usually swamped by normal brain activity.

The ganzfeld experiment tries to recreate meditative conditions. Participants sit in reclining chairs in a sealed room, listening to relaxing sounds, while their eyes are covered with special filters letting in only soft pink light. The telepathy test involves identification of a picture chosen from a random selection of four images. A person acting as a 'sender' attempts to transmit the image to the 'receiver' relaxing in the sealed room. Random guessing would give a hit-rate of 25 per cent; if telepathy is real, the hit-rate should be higher. In 1982, the American parapsychologist Charles Honorton analysed results from the first ganzfeld studies, finding typical hit-rates of better than 30 per cent — a small effect, but one which statistical tests suggested could not be put down to chance.

The implication was that the ganzfeld method had revealed real evidence for telepathy. But there was a crucial flaw: just because chance had been ruled out did not prove telepathy must exist; there were many other ways of obtaining positive results. These ranged from 'sensory leakage' — where clues about the pictures accidentally reached the receiver — to outright fraud. Researchers later issued a review of all ganzfeld studies done up to 1985, showing that 80 per cent found statistically significant evidence, but also acknowledging that too many problems remained.

After this, many researchers switched to autoganzfeld tests — automated variants using computers to perform key tasks such as randomly selecting images, so minimising human involvement and the risk of flawed results. In 1987, Honorton conducted a meta-analysis of hundreds of autoganzfeld results. Though less compelling than before, the outcome was still noteworthy.

What researchers are certainly not finding is any change in the attitude of mainstream scientists, most of whom still totally reject the idea of telepathy. The problem stems partly from the lack of any plausible mechanism. Various theories have been proposed, many focusing on esoteric ideas from theoretical physics such as 'quantum entanglement', in which events affecting one group of atoms instantly affect another group regardless of the distance between them. Early results from studies identifying people who are particularly successful in autoganzfeld trials show that creative and artistic people do much better than average. In one study at the University of Edinburgh, musicians achieved a hit-rate of 56 per cent.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Both supporters and opponents of telepathy agree that ganzfeld experiments provide the most convincing evidence so far.",a:"TRUE",e:"Paragraph 2 states 'what sceptics and advocates alike do agree on is that the most impressive evidence so far has come from the ganzfeld experiments.'"},
      {type:"true_false_not_given",num:2,prompt:"The ganzfeld experiment requires participants to wear headphones throughout.",a:"NOT GIVEN",e:"The passage says participants listen to relaxing sounds and have their eyes covered, but headphones are not specifically mentioned."},
      {type:"true_false_not_given",num:3,prompt:"A hit-rate of 25 per cent in the ganzfeld experiment would indicate the presence of telepathy.",a:"FALSE",e:"Paragraph 3 states that 25 per cent is what 'random guessing would give'; a higher rate would indicate telepathy."},
      {type:"true_false_not_given",num:4,prompt:"The autoganzfeld method was designed to reduce the influence of human error.",a:"TRUE",e:"Paragraph 5 states the computer-based method was introduced for 'minimising human involvement and the risk of flawed results.'"},
      {type:"multiple_choice",num:5,prompt:"What is meant by 'sensory leakage' in the context of the ganzfeld experiments?",
        opts:["A. Loss of signal strength due to technical interference","B. Accidental clues reaching the receiver through non-telepathic means","C. Emotional responses triggered by the images","D. The mental fatigue of the sender during long sessions"],
        a:"B",e:"Paragraph 4 defines it as situations 'where clues about the pictures accidentally reached the receiver.'"},
      {type:"multiple_choice",num:6,prompt:"What does the writer suggest about the musicians who took part in autoganzfeld trials?",
        opts:["A. Their results disproved the telepathy hypothesis","B. They performed no better than non-musicians","C. They achieved hit-rates far above what chance would predict","D. Their success was attributed to familiarity with the images"],
        a:"C",e:"Paragraph 6 states musicians at Edinburgh achieved a 56 per cent hit-rate, compared to the 25 per cent expected by chance."},
    ]
  },

  // ── P08: Claude Shannon and Information Theory (adapted from PDF) ──
  {
    id:"p08", title:"The Language of Information",
    text:`Information theory lies at the heart of everything — from DVD players and the genetic code of DNA to the physics of the Universe at its most fundamental. It has been central to the development of the science of communication, which enables data to be sent electronically and has had a major impact on our lives.

In April 2002, an event demonstrated one of information theory's many applications. The space probe Voyager I, launched in 1977, had sent back spectacular images of Jupiter and Saturn before soaring out of the Solar System on a one-way mission to the stars. After 25 years of exposure to the freezing temperatures of deep space, the probe was beginning to show its age. Sensors and circuits were on the brink of failing, and NASA experts realised they had to act or lose contact with the probe forever. The solution was to send a message to Voyager I — 12 billion kilometres from Earth — instructing it to use spare parts to replace the failing components. Even travelling at the speed of light, the message took over 11 hours to reach its target. Yet, incredibly, the little probe managed to hear the faint call from its home planet and successfully made the switchover.

It was the longest-distance repair job in history and a triumph for NASA engineers — but it also highlighted the astonishing power of techniques developed by the American communications engineer Claude Shannon. Born in 1916 in Petoskey, Michigan, Shannon showed an early talent for mathematics and for building gadgets, and made breakthroughs in the foundations of computer technology while still a student. While at Bell Laboratories, Shannon developed information theory but shunned the resulting acclaim. In the 1940s, he single-handedly created an entire science of communication that has since found its way into applications from DVDs to satellite communications to bar codes.

Shannon set out with an apparently simple aim: to define precisely the concept of 'information'. The most basic form of information, he argued, is whether something is true or false — which can be captured in the binary unit, or 'bit', of the form 1 or 0. Having identified this fundamental unit, Shannon set about defining otherwise vague ideas about information and how to transmit it. In the process he discovered something surprising: it is always possible to guarantee that information will get through random interference — 'noise' — intact.

Information theory generalises the idea of noise via theorems that capture its effects with mathematical precision. Shannon showed that noise sets a limit on the rate at which information can pass along communication channels while remaining error-free. This rate depends on the relative strengths of the signal and noise travelling down the communication channel, and on the channel's bandwidth. The resulting limit — given in units of bits per second — is the absolute maximum rate of error-free communication for a given signal strength and noise level. The trick, Shannon demonstrated, is to find ways of 'coding' information to cope with the ravages of noise, while staying within the information-carrying capacity of the system being used.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Voyager I was launched with the intention of eventually leaving the Solar System.",a:"NOT GIVEN",e:"The passage says it 'soared out of the Solar System on a one-way mission to the stars', but does not explicitly state this was the original intention of its launch."},
      {type:"true_false_not_given",num:2,prompt:"Shannon worked at Bell Laboratories when he developed information theory.",a:"TRUE",e:"Paragraph 3 states 'While at Bell Laboratories, Shannon developed information theory.'"},
      {type:"true_false_not_given",num:3,prompt:"Shannon became internationally famous and actively sought recognition for his work.",a:"FALSE",e:"Paragraph 3 states he 'shunned the resulting acclaim.'"},
      {type:"sentence_completion",num:4,prompt:"According to Shannon, the simplest form of information is whether something is true or false, expressible as a binary _____ or 'bit'.",a:"unit",e:"Paragraph 4 uses the phrase 'the binary unit, or bit'."},
      {type:"sentence_completion",num:5,prompt:"Shannon proved that information can always be transmitted through _____ without error, given the right coding.",a:"noise",e:"Paragraph 4 states it is 'always possible to guarantee that information will get through random interference — noise — intact.'"},
      {type:"sentence_completion",num:6,prompt:"The maximum rate of error-free communication along a channel is determined by the relative strengths of the signal and the _____ and by the channel's bandwidth.",a:"noise",e:"Paragraph 5 identifies these as the key factors."},
      {type:"multiple_choice",num:7,prompt:"What point does the writer make by opening the passage with the story of Voyager I?",
        opts:["A. To illustrate the limitations of modern space travel","B. To show an example of information theory in practice","C. To explain how NASA overcame the problem of distance","D. To argue that space exploration depends on mathematics"],
        a:"B",e:"The Voyager story is introduced as a demonstration of 'one of information theory's many applications.'"},
    ]
  },

  // ── P09: The Falkirk Wheel (adapted from PDF) ──
  {
    id:"p09", title:"The Falkirk Wheel: An Engineering Landmark",
    text:`The Falkirk Wheel in Scotland is the world's first and only rotating boat lift. Opened in 2002, it is central to the ambitious £84.5 million Millennium Link project to restore navigability across Scotland by reconnecting the historic waterways of the Forth & Clyde and Union Canals.

The major challenge of the project lay in the fact that the Forth & Clyde Canal is situated 35 metres below the level of the Union Canal. Historically, the two canals had been joined near Falkirk by a sequence of 11 locks — enclosed sections of canal in which the water level could be raised or lowered — that stepped down across a distance of 1.5 kilometres. This linkage had been dismantled in 1933. When the project was launched in 1994, the British Waterways authority were keen to create a dramatic twenty-first-century landmark that would be both a fitting commemoration of the Millennium and a lasting symbol of economic regeneration in the region.

Numerous ideas were submitted, including rolling eggs, tilting tanks, giant seesaws, and overhead monorails. The eventual winner was a plan for a huge rotating steel boat lift, inspired by sources both manmade and natural: a Celtic double-headed axe, the vast turning propeller of a ship, the ribcage of a whale, and the spine of a fish.

The various parts of the Wheel were constructed and assembled at Butterley Engineering's Steelworks in Derbyshire, some 400 kilometres from Falkirk. A team carefully assembled the 1,200 tonnes of steel, fitting the pieces together to an accuracy of just 10 millimetres. The structure was then dismantled, transported on 35 lorries to Falkirk, bolted back together on the ground, and finally lifted into position by crane. To withstand immense and constantly changing stresses, the steel sections were bolted rather than welded together, requiring over 45,000 individual bolts — each hand-tightened.

The Wheel consists of two sets of opposing axe-shaped arms, attached about 25 metres apart to a fixed central spine. Two water-filled 'gondolas', each with a capacity of 360,000 litres, are fitted between the ends of the arms. These gondolas always weigh the same whether or not they are carrying boats. According to Archimedes' principle of displacement, a floating boat displaces a weight of water equal to its own weight; so when a boat enters a gondola, the departing water weighs exactly as much as the boat. This keeps the Wheel perfectly balanced, and despite its enormous mass it rotates through 180° in five and a half minutes, consuming just 1.5 kilowatt-hours of energy — roughly equivalent to boiling eight small domestic kettles of water.

Boats needing to be lifted enter the lower gondola. Two hydraulic steel gates are raised to seal the gondola from the canal basin. A hydraulic clamp is then removed, allowing an array of ten hydraulic motors in the central machine room to begin rotating the central axle at one-eighth of a revolution per minute. A simple gearing system keeps the gondolas upright throughout the rotation. When the gondola reaches the top, the boat passes directly onto an aqueduct 24 metres above the canal basin. The remaining 11 metres of lift needed to reach the Union Canal is achieved by means of a pair of conventional locks, because the historically important Antonine Wall — built by the Romans in the second century AD — prevents further raising of the structure.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"The Falkirk Wheel was designed to replace a series of eleven locks that had been removed decades earlier.",a:"TRUE",e:"Paragraph 2 states the original 11-lock sequence 'had been dismantled in 1933.'"},
      {type:"true_false_not_given",num:2,prompt:"The Wheel was assembled on site at Falkirk from start to finish.",a:"FALSE",e:"Paragraph 4 states it was assembled in Derbyshire, then dismantled and transported to Falkirk."},
      {type:"true_false_not_given",num:3,prompt:"The gondolas weigh more when they are carrying boats than when they are empty.",a:"FALSE",e:"Paragraph 5 states 'these gondolas always weigh the same whether or not they are carrying boats' due to Archimedes' principle."},
      {type:"true_false_not_given",num:4,prompt:"The Wheel uses a very small amount of energy relative to its size.",a:"TRUE",e:"Paragraph 5 describes the energy use as equivalent only to boiling eight small kettles."},
      {type:"sentence_completion",num:5,prompt:"Boats unable to be elevated the full 35 metres by the Wheel use an additional _____ to reach the Union Canal.",a:"pair of locks",e:"Paragraph 6 states 'the remaining 11 metres of lift needed to reach the Union Canal is achieved by means of a pair of conventional locks.'"},
      {type:"sentence_completion",num:6,prompt:"The upper height limit of the Wheel is partly determined by the presence of the _____, an ancient Roman structure.",a:"Antonine Wall",e:"Paragraph 6 identifies this as the reason the structure cannot be raised further."},
      {type:"multiple_choice",num:7,prompt:"According to the passage, why were the steel sections bolted rather than welded?",
        opts:["A. To allow the structure to be disassembled and relocated in the future","B. To reduce the cost of construction","C. To withstand the constantly changing stresses during rotation","D. To comply with safety regulations for hydraulic machinery"],
        a:"C",e:"Paragraph 4 explains the bolting was used 'to withstand immense and constantly changing stresses.'"},
      {type:"multiple_choice",num:8,prompt:"What principle explains why the gondolas remain balanced regardless of whether a boat is present?",
        opts:["A. Newton's third law of motion","B. Archimedes' principle of displacement","C. The conservation of angular momentum","D. Pascal's law of hydraulic pressure"],
        a:"B",e:"Paragraph 5 explicitly names 'Archimedes' principle of displacement.'"},
    ]
  },

  // ── P10: Urban Heat Islands (original) ──
  {
    id:"p10", title:"Cities and the Heat They Make",
    text:`Cities are, on average, significantly warmer than the surrounding countryside. The phenomenon known as the urban heat island (UHI) effect — first documented systematically by the amateur meteorologist Luke Howard in his 1818 study of London's climate — arises from a combination of factors inherent to the way modern cities are built and function. Understanding and mitigating the UHI effect has become one of the most pressing challenges facing urban planners as climate change amplifies heat extremes worldwide.

The primary drivers of the UHI effect can be grouped into three categories. First, the replacement of natural vegetation with impervious surfaces — concrete, asphalt, and glass — fundamentally alters the energy balance of the land. Vegetation absorbs solar radiation and releases it gradually as latent heat through evapotranspiration, a process that cools the surrounding air. Hard surfaces, by contrast, absorb heat rapidly during the day and re-radiate it slowly throughout the night, preventing the nocturnal cooling that characterises rural environments. Second, the geometry of cities traps solar radiation that would otherwise reflect back into the sky from an open landscape — a phenomenon called the urban canyon effect. Third, cities are themselves prodigious generators of heat through traffic, air-conditioning units, industrial processes, and the metabolic activity of millions of human bodies.

The consequences of elevated urban temperatures are serious and unequally distributed. Heat-related mortality increases sharply during heatwaves, and urban residents — particularly the elderly, the young, and those without access to air conditioning — bear a disproportionate burden. A retrospective analysis of the 2003 European heatwave, which killed an estimated 70,000 people, found that mortality rates in city centres were significantly higher than in surrounding suburbs and rural areas.

A growing body of research identifies architectural and urban-planning strategies capable of meaningfully reducing UHI intensity. Green roofs — roof surfaces covered with vegetation — reduce surface temperatures by up to 30°C compared with conventional black roofing membranes. Studies in Chicago, Toronto, and Singapore have demonstrated that widespread adoption of green roofs can reduce building energy consumption by 15–25%. Cool roofs, which use highly reflective materials to bounce solar radiation back into the atmosphere, offer similar benefits and are generally cheaper to install.

Urban trees and parks provide the most thermally effective interventions at street level. A mature tree can transpire several hundred litres of water per day, cooling the local air temperature by up to 8°C. Research in Melbourne and Phoenix has shown that increasing urban tree canopy cover from 10% to 30% reduces peak afternoon temperatures by 2–4°C — a reduction equivalent to several decades of projected climate warming in those cities. However, trees in dense urban environments face physiological stresses: compacted soils, limited rooting volumes, pollutant exposure, and summer drought.

At the city scale, the most ambitious interventions involve redesigning entire districts. Medellín, Colombia, once considered one of the world's most dangerous cities, has become an internationally recognised model for urban greening: a network of green corridors has reduced temperatures in adjacent streets by up to 3°C. Singapore's approach is even more systematic, mandating the integration of nature into all new development, from sky gardens and green walls on high-rise buildings to nature corridors connecting the central catchment reserve with residential districts.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Luke Howard was a professional meteorologist who studied London's climate in the nineteenth century.",a:"FALSE",e:"Paragraph 1 describes him as an 'amateur meteorologist.'"},
      {type:"true_false_not_given",num:2,prompt:"Vegetation helps cool cities by releasing heat through a process called evapotranspiration.",a:"TRUE",e:"Paragraph 2 explains this process directly."},
      {type:"true_false_not_given",num:3,prompt:"The 2003 European heatwave resulted in higher mortality rates in rural areas than in city centres.",a:"FALSE",e:"Paragraph 3 states that mortality rates 'in city centres were significantly higher than in surrounding suburbs and rural areas.'"},
      {type:"true_false_not_given",num:4,prompt:"Cool roofs provide better biodiversity benefits than green roofs.",a:"FALSE",e:"Paragraph 4 states green roofs — not cool roofs — provide 'biodiversity and stormwater management co-benefits.'"},
      {type:"sentence_completion",num:5,prompt:"Increasing urban tree canopy from 10% to 30% reduces peak afternoon temperatures by _____ degrees Celsius.",a:"2–4",e:"Paragraph 5 gives this figure directly."},
      {type:"sentence_completion",num:6,prompt:"In Medellín, a network of _____ reduced street temperatures by up to 3°C and contributed to urban regeneration.",a:"green corridors",e:"Paragraph 6 describes the Medellín initiative."},
      {type:"multiple_choice",num:7,prompt:"According to the passage, which of the following is NOT listed as a cause of the urban heat island effect?",
        opts:["A. The replacement of vegetation with hard surfaces","B. The trapping of heat by tall buildings","C. The heat generated by human activity","D. The absorption of ocean heat by coastal cities"],
        a:"D",e:"Coastal cities are not mentioned; the three causes given are impervious surfaces, urban canyon effect, and anthropogenic heat."},
    ]
  },

  // ── P11: Coral Reefs Under Threat (original) ──
  {
    id:"p11", title:"Coral Reefs: Rainforests of the Sea",
    text:`Coral reefs occupy less than one per cent of the ocean floor, yet they are home to more than a quarter of all known marine species. Often called the rainforests of the sea, they provide ecosystem services that underpin the livelihoods of hundreds of millions of people worldwide — from fisheries and coastal protection to tourism and pharmaceutical research. Yet these extraordinary ecosystems are in severe and accelerating decline.

The primary threat to coral reefs is ocean warming caused by climate change. Corals exist in a symbiotic relationship with microscopic algae called zooxanthellae that live within their tissues and provide up to 90 per cent of the coral's energy through photosynthesis. When sea temperatures rise by just 1–2°C above the local summer maximum for an extended period, the coral expels its algae in a process known as bleaching. Without the algae, the coral turns white and, if the temperature stress persists, it dies. The Great Barrier Reef in Australia — the world's largest coral ecosystem, stretching over 2,300 kilometres — experienced mass bleaching events in 2016, 2017, 2020, and 2022, the four warmest years on record in the Coral Sea.

Ocean acidification, driven by the absorption of atmospheric carbon dioxide, poses an equally insidious threat. When CO₂ dissolves in seawater it forms carbonic acid, reducing the ocean's pH. This makes it harder for corals and other calcifying organisms to build their calcium carbonate skeletons. Studies project that if atmospheric CO₂ concentrations reach 560 parts per million — approximately double the pre-industrial level — conditions will become corrosive to coral skeletons across large areas of the tropics.

Local stressors compound these global pressures. Runoff from agriculture and urban development introduces excess nutrients that promote the growth of algae, smothering corals and blocking the light they need for photosynthesis. Destructive fishing practices, including the use of dynamite and cyanide to stun fish, physically destroy reef structures. Coastal development removes the mangrove forests and seagrass meadows that normally filter sediment and nutrients before they reach the reef.

Restoration efforts are under way on several fronts. Coral gardening — growing coral fragments on underwater nursery trees before transplanting them onto degraded reefs — has been practised at scale in the Caribbean and Pacific, with some projects transplanting hundreds of thousands of fragments annually. Scientists are also investigating the potential of assisted evolution: selectively breeding or genetically modifying corals to tolerate higher temperatures and more acidic conditions. While these approaches show promise, most marine biologists argue that they can only succeed within the context of rapid and significant reductions in greenhouse gas emissions.`,
    questions:[
      {type:"true_false_not_given",num:1,prompt:"Coral reefs support more than 25 per cent of all known marine species.",a:"TRUE",e:"Paragraph 1 states they are 'home to more than a quarter of all known marine species.'"},
      {type:"true_false_not_given",num:2,prompt:"Bleaching occurs when water temperature rises 1–2°C above the local winter minimum.",a:"FALSE",e:"Paragraph 2 specifies 'above the local summer maximum', not the winter minimum."},
      {type:"true_false_not_given",num:3,prompt:"The Great Barrier Reef experienced its first mass bleaching event in 2016.",a:"NOT GIVEN",e:"The passage lists bleaching events from 2016 onwards but does not state this was the first ever."},
      {type:"true_false_not_given",num:4,prompt:"Ocean acidification makes it harder for corals to form their skeletal structures.",a:"TRUE",e:"Paragraph 3 explains this process directly."},
      {type:"sentence_completion",num:5,prompt:"Zooxanthellae provide corals with up to _____ per cent of their energy through photosynthesis.",a:"90",e:"Paragraph 2 states this figure."},
      {type:"sentence_completion",num:6,prompt:"The technique of growing coral fragments on underwater frames before transplanting them is known as coral _____.",a:"gardening",e:"Paragraph 5 names this practice."},
      {type:"multiple_choice",num:7,prompt:"According to the passage, what is the relationship between local stressors and global threats?",
        opts:["A. Local stressors are more damaging than global threats","B. Local stressors make reefs more resistant to global threats","C. Local stressors add to the damage already caused by global threats","D. Local stressors are only significant in shallow water"],
        a:"C",e:"Paragraph 4 states 'local stressors compound these global pressures.'"},
    ]
  },

  // ── P12: The Psychology of Decision Making (original) ──
  {
    id:"p12", title:"Why We Make Poor Choices",
    text:`For most of human history, economists assumed that people make decisions rationally — weighing up costs and benefits and consistently choosing the option that maximises their well-being. In the 1970s, the psychologists Daniel Kahneman and Amos Tversky upended this view by demonstrating that human decision-making is riddled with systematic errors, or cognitive biases, that lead people away from optimal choices in predictable ways.

One of the most powerful biases they identified is loss aversion: the tendency to feel the pain of a loss more intensely than the pleasure of an equivalent gain. Experiments show that, for most people, the prospect of losing £100 is felt as approximately twice as painful as the prospect of gaining £100 is pleasurable. This asymmetry has profound real-world consequences. Investors hold on to loss-making shares far longer than is rational, hoping to avoid locking in a loss. Employees resist taking on ambitious new projects for fear of failure, even when the potential rewards are substantial.

Another influential bias is the status quo bias: a preference for the current state of affairs over any alternative, regardless of whether the alternative would be objectively better. Kahneman and Tversky attributed this partly to loss aversion — any change from the status quo involves potential losses — and partly to an 'inertia' that makes people reluctant to expend the mental effort required to evaluate alternatives. Status quo bias explains, for example, why millions of people remain in financial products that are no longer optimal for their needs, even when switching costs are minimal.

Anchoring is a third well-documented bias. When making numerical judgements — about prices, quantities, or probabilities — people are heavily influenced by an initial piece of information, the 'anchor', even when they know it to be arbitrary. In one famous study, Kahneman and Tversky asked participants to estimate the percentage of African nations in the United Nations. Before answering, participants spun a wheel — rigged to stop at either 10 or 65. Those who saw 10 guessed an average of 25%; those who saw 65 guessed an average of 45%. The irrelevant number from the wheel profoundly shaped their estimates.

Understanding cognitive biases has given rise to the field of 'nudge theory', which seeks to harness knowledge of how people actually behave — rather than how economists think they should behave — to guide them towards better decisions. The key insight of nudge theory, developed by the economist Richard Thaler and the legal scholar Cass Sunstein, is that the way choices are presented — the 'choice architecture' — powerfully influences which option people select. Making organ donation opt-out rather than opt-in, for example, dramatically increases donation rates without restricting individual freedom. Similarly, placing fruit at eye level in a canteen increases healthy food choices without removing less healthy options. Critics argue that nudges can be paternalistic, but proponents counter that the alternative — ignoring the influence of choice architecture — is merely to cede that influence to whoever designs systems by default.`,
    questions:[
      {type:"multiple_choice",num:1,prompt:"According to Kahneman and Tversky's research, how does the pain of a loss compare to the pleasure of an equivalent gain?",
        opts:["A. They are experienced equally","B. Loss is felt approximately twice as intensely as an equivalent gain is pleasurable","C. Gain is felt more intensely than loss for most people","D. The comparison depends on the individual's financial situation"],
        a:"B",e:"Paragraph 2 states 'the prospect of losing £100 is felt as approximately twice as painful as the prospect of gaining £100 is pleasurable.'"},
      {type:"multiple_choice",num:2,prompt:"What does the spin-wheel study described in paragraph 4 demonstrate?",
        opts:["A. That people are poor at estimating geographical facts","B. That random numbers can influence people's estimates","C. That anchoring only affects numerical guesses about very large quantities","D. That educated people are less susceptible to anchoring bias"],
        a:"B",e:"The study shows that the number from the wheel — which is entirely irrelevant — significantly shaped participants' estimates."},
      {type:"true_false_not_given",num:3,prompt:"Status quo bias is partly caused by people's reluctance to think through alternatives.",a:"TRUE",e:"Paragraph 3 attributes it partly to 'inertia that makes people reluctant to expend the mental effort required to evaluate alternatives.'"},
      {type:"true_false_not_given",num:4,prompt:"Kahneman and Tversky worked as economists before turning to psychology.",a:"NOT GIVEN",e:"They are described as psychologists; no mention of prior careers in economics."},
      {type:"true_false_not_given",num:5,prompt:"Nudge theory was developed by Richard Thaler and Cass Sunstein.",a:"TRUE",e:"Paragraph 5 credits this to Thaler and Sunstein."},
      {type:"sentence_completion",num:6,prompt:"Nudge theory focuses on the way choices are _____ — known as 'choice architecture' — as a means of guiding better decisions.",a:"presented",e:"Paragraph 5 explains that 'the way choices are presented — the choice architecture — powerfully influences which option people select.'"},
      {type:"sentence_completion",num:7,prompt:"Switching a country's organ donation system from opt-in to _____ dramatically increases donation rates.",a:"opt-out",e:"Paragraph 5 gives this as an example of nudge theory in practice."},
    ]
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// WRITING PROMPTS (from uploaded PDFs + originals)
// ─────────────────────────────────────────────────────────────────────────────

const WRITING_PROMPTS = [
  // From uploaded Practice-Tests PDF
  {t1:"The bar chart shows the percentage of students studying independently versus attending formal courses across five countries in 2023. Summarise the main features and make comparisons where relevant.",
   t2:"A huge number of students choose to study independently on a self-study basis rather than attend a formal course. However, without the assistance of a teacher, students often find it difficult to manage their studies. To what extent do you agree or disagree?",
   topic:"self-study"},
  {t1:"The graphs below show changes in the participation of women in the workforce in four European countries between 1990 and 2020. Summarise the main features and make comparisons where relevant.",
   t2:"The position of women has changed a great deal in many societies over the past 50 years. However, these societies cannot claim to have achieved true gender equality. To what extent do you agree or disagree?",
   topic:"gender equality"},
  // Originals based on PDF themes
  {t1:"The pie charts show the proportion of household waste recycled in a particular city in 2005 and 2020. Summarise the main features and make comparisons where relevant.",
   t2:"Some people believe that individuals should be responsible for reducing the amount of waste they produce; others think governments should enforce stricter recycling regulations. Discuss both views and give your own opinion.",
   topic:"waste and recycling"},
  {t1:"The line graph shows changes in the number of international tourists visiting four countries between 2010 and 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Tourism brings significant economic benefits to local communities, but it also causes serious environmental and cultural problems. To what extent do the disadvantages of tourism outweigh the advantages?",
   topic:"tourism"},
  {t1:"The diagram below shows the process by which solar panels convert sunlight into electricity for household use. Summarise the main features and make comparisons where relevant.",
   t2:"Many countries are investing heavily in renewable energy sources such as solar and wind power. However, some argue that nuclear energy is a more reliable solution to the global energy crisis. Discuss both views and give your own opinion.",
   topic:"energy"},
  {t1:"The table below shows data on screen time use among different age groups in three countries in 2022. Summarise the main features and make comparisons where relevant.",
   t2:"The widespread use of smartphones and social media is having a negative effect on young people's social skills and mental health. To what extent do you agree or disagree?",
   topic:"technology and youth"},
  {t1:"The bar chart compares the average amount spent on healthcare per person in six countries in 2021. Summarise the main features and make comparisons where relevant.",
   t2:"Some people believe that governments should provide free healthcare for all citizens, while others think individuals should be responsible for their own health costs. Discuss both views and give your own opinion.",
   topic:"healthcare"},
  {t1:"The graph below shows the percentage of households with access to the internet in urban and rural areas of three developing countries from 2010 to 2022. Summarise the main features and make comparisons where relevant.",
   t2:"The internet has made a significant contribution to education, but access to it remains unequal between different parts of the world. How can this digital divide best be addressed?",
   topic:"digital divide"},
  {t1:"The chart below shows participation rates in different types of physical activity among adults in the UK in 2019 and 2023. Summarise the main features and make comparisons where relevant.",
   t2:"An increasing number of people are becoming obese. What do you think are the main causes of this problem, and what measures can be taken to address it?",
   topic:"health and obesity"},
  {t1:"The map shows changes in the layout of a town centre between 2000 and the present day. Summarise the main features and make comparisons where relevant.",
   t2:"Some people believe that it is important to preserve old buildings and historic areas, even at great expense. Others think the money should be spent on building modern infrastructure. Discuss both views and give your own opinion.",
   topic:"heritage and development"},
  {t1:"The bar chart illustrates the proportion of people in five age groups who reported feeling lonely in four countries in 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Despite being more connected than ever through technology, many people feel increasingly isolated and lonely. What are the causes of this problem, and what can be done to reduce it?",
   topic:"loneliness"},
  {t1:"The graphs below compare the average number of hours worked per week and the average wages in five countries in 2021. Summarise the main features and make comparisons where relevant.",
   t2:"Working from home has become increasingly popular in recent years. Some believe it benefits both employers and employees; others argue that it has serious disadvantages. Discuss both views and give your own opinion.",
   topic:"remote work"},
  {t1:"The chart shows the percentage of graduates from different fields who were employed within six months of graduation in a particular country in 2022. Summarise the main features and make comparisons where relevant.",
   t2:"In many countries, the number of graduates is increasing, but the rate of graduate unemployment is also rising. What problems does this create, and how can they best be solved?",
   topic:"graduate employment"},
  {t1:"The table shows data on car ownership and public transport use in five cities in 2023. Summarise the main features and make comparisons where relevant.",
   t2:"Some people argue that governments should invest more money in developing public transport to reduce traffic congestion in cities; others think building more roads is the better solution. Discuss both views and give your own opinion.",
   topic:"transport"},
  {t1:"The diagram illustrates the water cycle, showing how water moves between the oceans, atmosphere, and land. Summarise the main features and make comparisons where relevant.",
   t2:"Fresh water is becoming an increasingly scarce resource in many parts of the world. What are the main causes of this problem, and what steps can individuals and governments take to conserve water?",
   topic:"water scarcity"},
  {t1:"The bar charts compare the average time spent on different leisure activities by adults in 2000 and 2020. Summarise the main features and make comparisons where relevant.",
   t2:"Many people today prioritise work over their personal and family lives. Discuss the possible causes of this trend and suggest ways in which the balance between work and personal life can be improved.",
   topic:"work-life balance"},
  {t1:"The graphs show crime rates in a city before and after the introduction of a community policing scheme. Summarise the main features and make comparisons where relevant.",
   t2:"Some people believe that the best way to reduce crime is through harsh punishments; others think that improving education and social conditions is more effective. Discuss both views and give your own opinion.",
   topic:"crime and justice"},
  {t1:"The chart below shows the proportion of people who were literate in five regions of the world in 1990 and 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Despite global progress in education, literacy rates in some parts of the world remain very low. What are the causes of this, and what can be done to improve the situation?",
   topic:"literacy"},
  {t1:"The line graph shows changes in the average age of first-time parents in five European countries between 1980 and 2020. Summarise the main features and make comparisons where relevant.",
   t2:"In many countries, people are choosing to have children later in life. What are the reasons for this trend, and what are the advantages and disadvantages of starting a family later?",
   topic:"family and society"},
  {t1:"The charts compare the percentage of energy produced from different sources in a country in 2000 and 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Many governments are trying to reduce their dependence on fossil fuels. What obstacles do they face, and how might these obstacles be overcome?",
   topic:"fossil fuels"},
  {t1:"The bar chart shows the percentage of the population in five countries who reported high levels of life satisfaction in 2023. Summarise the main features and make comparisons where relevant.",
   t2:"Some researchers argue that happiness depends mainly on personal factors such as health and relationships; others believe that external factors such as wealth and government policy are more important. Discuss both views and give your own opinion.",
   topic:"happiness"},
  {t1:"The graph below shows the number of students enrolled in online courses compared with traditional classroom courses between 2015 and 2023. Summarise the main features and make comparisons where relevant.",
   t2:"Online education is increasingly popular and offers many advantages. However, some argue that it can never fully replace traditional classroom learning. To what extent do you agree or disagree?",
   topic:"online education"},
  {t1:"The chart shows the percentage of children engaging in regular physical activity in five countries in 2019 and 2023. Summarise the main features and make comparisons where relevant.",
   t2:"Children today spend too much time on screens and too little time engaged in physical activity. What are the consequences of this trend, and how can it be reversed?",
   topic:"children and screens"},
  {t1:"The table below compares the amount of food wasted per person per year in six countries in 2021. Summarise the main features and make comparisons where relevant.",
   t2:"Food waste is a growing problem in many countries. What are the main causes of this issue, and what measures can individuals and governments take to reduce it?",
   topic:"food waste"},
  {t1:"The bar chart shows the percentage of adults who speak more than one language in five European countries in 2023. Summarise the main features and make comparisons where relevant.",
   t2:"Learning a foreign language has many benefits, but some argue that the time and resources required would be better spent on other subjects. Discuss both views and give your own opinion.",
   topic:"language learning"},
  {t1:"The graph shows changes in the average number of books read per person per year in four countries between 2000 and 2022. Summarise the main features and make comparisons where relevant.",
   t2:"The reading of books — both for pleasure and for knowledge — is declining in many countries. What are the causes of this trend, and how can it be reversed?",
   topic:"reading habits"},
  {t1:"The diagram shows the stages involved in the production and delivery of bottled water. Summarise the main features and make comparisons where relevant.",
   t2:"The sale of bottled water has grown enormously in recent decades. Some argue this is a waste of resources when clean tap water is available in many countries. To what extent do you agree or disagree?",
   topic:"bottled water"},
  {t1:"The bar chart compares the percentage of workers in different industries who reported high levels of job satisfaction in 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Job satisfaction is considered more important than salary by many workers today. What factors contribute to job satisfaction, and how can employers create a more satisfying work environment?",
   topic:"job satisfaction"},
  {t1:"The graphs show changes in urban and rural population sizes in three continents between 1960 and 2020. Summarise the main features and make comparisons where relevant.",
   t2:"Many people are moving from rural areas to cities in search of better opportunities. What problems does rapid urbanisation cause, and how can these problems be managed?",
   topic:"urbanisation"},
  {t1:"The chart shows the proportion of national budgets spent on different areas — education, defence, healthcare, and infrastructure — in four countries in 2022. Summarise the main features and make comparisons where relevant.",
   t2:"Some people believe that governments spend too much money on defence and not enough on education and healthcare. To what extent do you agree or disagree?",
   topic:"government spending"},
];

// ─────────────────────────────────────────────────────────────────────────────
// VOCABULARY (120 real high-frequency IELTS words)
// ─────────────────────────────────────────────────────────────────────────────

const VOCAB_TOPICS = [
  {
    topic: "Academic Language",
    items: [
      {word:"ameliorate",meaning:"To make a bad or unsatisfactory situation better.",example:"Several policies were introduced to ameliorate the living conditions of low-income families.",usageNote:"Common in academic writing; often contrasted with 'worsen' or 'exacerbate'.",difficulty:"advanced"},
      {word:"substantiate",meaning:"To provide evidence to support or prove the truth of something.",example:"The researcher was unable to substantiate her claims without further data.",usageNote:"Useful when discussing evidence in Task 2 or reading comprehension.",difficulty:"advanced"},
      {word:"phenomenon",meaning:"A fact or situation that is observed to exist or happen, especially one whose cause is in question.",example:"The urban heat island effect is a well-documented meteorological phenomenon.",usageNote:"Plural: phenomena. Frequently appears in IELTS reading passages.",difficulty:"intermediate"},
      {word:"elaborate",meaning:"To add more detail or explanation to something.",example:"The report failed to elaborate on how the changes would be funded.",usageNote:"Can be used as verb ('please elaborate') or adjective ('an elaborate plan').",difficulty:"intermediate"},
      {word:"contentious",meaning:"Causing or likely to cause disagreement or controversy.",example:"The proposal to close the local library proved highly contentious among residents.",usageNote:"Synonym: controversial, disputed. Useful in discursive Task 2 essays.",difficulty:"advanced"},
      {word:"predominant",meaning:"Present as the strongest or main element; having the most influence.",example:"Agriculture remains the predominant industry in many rural economies.",usageNote:"Adverb form: predominantly. Common in both reading and writing.",difficulty:"intermediate"},
      {word:"criterion (criteria)",meaning:"A principle or standard by which something is judged or decided.",example:"The selection criteria for the scholarship were published on the university website.",usageNote:"'Criteria' is the plural; 'criterion' is singular — a common IELTS error to avoid.",difficulty:"intermediate"},
      {word:"coherent",meaning:"Logically consistent and clear; easy to understand.",example:"A coherent argument must address counterpoints as well as main claims.",usageNote:"Coherence is one of the four IELTS Writing marking criteria.",difficulty:"intermediate"},
      {word:"advocate",meaning:"(v) To publicly support or recommend a cause or policy; (n) a person who does this.",example:"Many health professionals advocate reducing sugar consumption in processed foods.",usageNote:"Versatile word for Task 2 discussions of policy and opinion.",difficulty:"intermediate"},
      {word:"albeit",meaning:"Although; even though.",example:"The results were promising, albeit based on a small sample size.",usageNote:"Formal linking word; signals a concession without using 'however'.",difficulty:"advanced"},
    ]
  },
  {
    topic: "Environment",
    items: [
      {word:"biodiversity",meaning:"The variety of plant and animal life in a particular habitat or on Earth.",example:"Tropical rainforests support an extraordinary level of biodiversity.",usageNote:"Frequently tested in IELTS reading and useful in environmental Task 2 essays.",difficulty:"intermediate"},
      {word:"sustainable",meaning:"Able to be maintained at a certain rate or level without depleting natural resources.",example:"Governments must develop sustainable alternatives to fossil fuel energy.",usageNote:"Common collocations: sustainable development, sustainable energy, sustainable agriculture.",difficulty:"basic"},
      {word:"carbon footprint",meaning:"The total amount of greenhouse gases produced by human activities, expressed as carbon dioxide equivalent.",example:"Switching to public transport can significantly reduce your carbon footprint.",usageNote:"Central concept in environmental IELTS essays.",difficulty:"intermediate"},
      {word:"deforestation",meaning:"The action of clearing a wide area of trees.",example:"Deforestation in the Amazon basin threatens thousands of animal and plant species.",usageNote:"Common in Task 2 essays on environment and development.",difficulty:"intermediate"},
      {word:"renewable energy",meaning:"Energy from a source that is not depleted when used, such as wind, solar, or hydroelectric power.",example:"Denmark now generates more than half its electricity from renewable energy sources.",usageNote:"Contrasted with fossil fuels; key vocabulary for Task 2 energy essays.",difficulty:"basic"},
      {word:"ecosystem",meaning:"A biological community of interacting organisms and their physical environment.",example:"Pollution from agricultural runoff can devastate freshwater ecosystems.",usageNote:"Appears frequently in IELTS reading passages about the natural world.",difficulty:"intermediate"},
      {word:"emissions",meaning:"The production and discharge of gases, especially greenhouse gases, into the atmosphere.",example:"Stricter regulations are needed to control industrial emissions of nitrogen dioxide.",usageNote:"Often used in plural. Collocations: carbon emissions, greenhouse gas emissions.",difficulty:"intermediate"},
      {word:"mitigation",meaning:"The action of reducing the severity, seriousness, or painfulness of something.",example:"Carbon capture technology is one form of climate change mitigation.",usageNote:"Contrasted with 'adaptation' — mitigation reduces the cause, adaptation manages the impact.",difficulty:"advanced"},
      {word:"contamination",meaning:"The process of making something impure, poisoned, or unfit for use by introducing harmful substances.",example:"Industrial waste has led to widespread contamination of the local groundwater.",usageNote:"Common in reading passages about pollution and public health.",difficulty:"intermediate"},
      {word:"conservation",meaning:"The action of protecting animals, plants, and the natural environment.",example:"Wildlife conservation programmes have helped increase tiger populations in India.",usageNote:"Related: conserve, conservationist. Useful for both reading and writing.",difficulty:"basic"},
    ]
  },
  {
    topic: "Education",
    items: [
      {word:"curriculum",meaning:"The subjects comprising a course of study in a school or university.",example:"Critics argue that the national curriculum places too much emphasis on rote learning.",usageNote:"Plural: curricula or curriculums. Common in education Task 2 essays.",difficulty:"intermediate"},
      {word:"pedagogy",meaning:"The method and practice of teaching, especially as an academic subject.",example:"Modern pedagogy increasingly emphasises collaborative learning over direct instruction.",usageNote:"High-band vocabulary for education essays; related: pedagogical.",difficulty:"advanced"},
      {word:"literacy",meaning:"The ability to read and write; competence in a specified area.",example:"Improving literacy rates in rural areas remains a major challenge for developing nations.",usageNote:"Collocations: digital literacy, financial literacy, adult literacy.",difficulty:"basic"},
      {word:"critical thinking",meaning:"The objective analysis and evaluation of an issue in order to form a judgement.",example:"Universities seek to develop critical thinking skills rather than mere memorisation.",usageNote:"Highly valued concept in IELTS Task 2 essays on education.",difficulty:"intermediate"},
      {word:"extracurricular",meaning:"(Of activities) pursued in addition to the normal course of study.",example:"Participation in extracurricular activities develops leadership and teamwork skills.",usageNote:"Used as an adjective before nouns: extracurricular activities, extracurricular programme.",difficulty:"intermediate"},
      {word:"rote learning",meaning:"Learning by memorisation rather than by understanding.",example:"The reliance on rote learning in many education systems discourages creativity.",usageNote:"Contrasted with 'critical thinking' or 'deep learning'.",difficulty:"intermediate"},
      {word:"vocational",meaning:"Relating to an occupation or profession, especially practical skills.",example:"Vocational training programmes offer a practical alternative to university education.",usageNote:"Common in Task 2 essays comparing academic and vocational education.",difficulty:"intermediate"},
      {word:"scholarship",meaning:"A grant or payment made to support a student's education; also, academic study.",example:"She was awarded a full scholarship to study medicine at the University of Edinburgh.",usageNote:"Two distinct meanings — financial award and academic activity.",difficulty:"basic"},
      {word:"attainment",meaning:"The act of achieving something, especially a level of performance or qualification.",example:"The attainment gap between students from wealthy and poorer families has widened.",usageNote:"Academic term often used in reports on educational performance.",difficulty:"intermediate"},
      {word:"mentorship",meaning:"The guidance provided by a mentor, especially in professional or academic contexts.",example:"Effective mentorship programmes significantly improve graduate employment rates.",usageNote:"Related: mentor, mentee. Useful in both education and workplace Task 2 essays.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Technology",
    items: [
      {word:"automation",meaning:"The use of technology to perform tasks without human assistance.",example:"Automation in manufacturing has dramatically increased productivity but displaced many workers.",usageNote:"Central concept in IELTS Task 2 essays on the future of work.",difficulty:"intermediate"},
      {word:"artificial intelligence",meaning:"The simulation of human intelligence processes by computer systems.",example:"Artificial intelligence is already transforming industries from medicine to finance.",usageNote:"Common abbreviation: AI. Increasingly appearing in IELTS reading and speaking topics.",difficulty:"intermediate"},
      {word:"algorithm",meaning:"A set of rules or instructions followed by a computer to solve a problem.",example:"Social media companies use algorithms to determine what content users see.",usageNote:"No need to explain how algorithms work in detail — use it to describe automated decision-making.",difficulty:"intermediate"},
      {word:"surveillance",meaning:"Close observation, especially of a suspected person or group.",example:"Many cities have expanded their surveillance systems in recent years in response to rising crime.",usageNote:"Can be used in essays on privacy, technology, and government control.",difficulty:"intermediate"},
      {word:"proliferation",meaning:"Rapid increase in the number or amount of something.",example:"The proliferation of smartphones has transformed how people access information.",usageNote:"Slightly formal; often appears in reading passages about the spread of technology.",difficulty:"advanced"},
      {word:"obsolete",meaning:"No longer used or useful; out of date.",example:"Many skills considered essential a decade ago have already become obsolete.",usageNote:"Useful in Task 2 essays about jobs, technology, and the pace of change.",difficulty:"intermediate"},
      {word:"digital divide",meaning:"The gulf between those who have ready access to computers and the internet and those who do not.",example:"The digital divide risks creating a two-tier education system in many developing countries.",usageNote:"Important concept for IELTS essays on inequality and technology.",difficulty:"intermediate"},
      {word:"innovation",meaning:"The process of introducing something new, especially a new method, idea, or product.",example:"Government investment in research and development is essential to drive technological innovation.",usageNote:"Collocations: technological innovation, drive innovation, foster innovation.",difficulty:"basic"},
      {word:"disruptive",meaning:"Causing radical change in an established industry or market.",example:"Ride-sharing apps have had a disruptive effect on the traditional taxi industry.",usageNote:"Often used positively in business contexts, negatively when describing social effects.",difficulty:"intermediate"},
      {word:"cybersecurity",meaning:"The practice of protecting systems, networks, and programmes from digital attacks.",example:"As more services move online, cybersecurity has become a critical government priority.",usageNote:"A high-frequency topic in modern IELTS tests.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Health and Medicine",
    items: [
      {word:"sedentary",meaning:"(Of a person or lifestyle) tending to spend much time seated; physically inactive.",example:"A sedentary lifestyle is strongly associated with an increased risk of cardiovascular disease.",usageNote:"Often appears in health-related IELTS reading passages; useful in Task 2 essays about obesity.",difficulty:"intermediate"},
      {word:"epidemiologist",meaning:"A scientist who studies the spread and control of diseases in populations.",example:"Epidemiologists played a crucial role in tracking the spread of the pandemic.",usageNote:"Related: epidemic, epidemiology. Useful for reading passages and health essays.",difficulty:"advanced"},
      {word:"morbidity",meaning:"The condition of being diseased; the rate of disease in a population.",example:"Air pollution is a significant cause of respiratory morbidity in urban areas.",usageNote:"Distinguished from 'mortality' (death rate) — a common confusion in health writing.",difficulty:"advanced"},
      {word:"pandemic",meaning:"An outbreak of a disease that occurs over a wide geographic area affecting many people.",example:"The COVID-19 pandemic accelerated the adoption of telehealth services worldwide.",usageNote:"Contrasted with 'epidemic' (local) and 'endemic' (consistently present).",difficulty:"basic"},
      {word:"immunisation",meaning:"The process by which a person is made immune to an infectious disease, typically by vaccination.",example:"Mass immunisation programmes have successfully eradicated smallpox.",usageNote:"British spelling; American: immunization. Synonymous with vaccination in most contexts.",difficulty:"intermediate"},
      {word:"preventable",meaning:"Capable of being avoided or stopped from happening.",example:"The report concluded that thousands of deaths each year are preventable through lifestyle changes.",usageNote:"Strong word for Task 2 health essays advocating preventive medicine.",difficulty:"intermediate"},
      {word:"wellbeing",meaning:"The state of being comfortable, healthy, or happy.",example:"Mental wellbeing should be given the same priority as physical health in national health policy.",usageNote:"Can be written as 'well-being'. High-frequency in speaking Part 3 and Task 2 health essays.",difficulty:"basic"},
      {word:"nutrition",meaning:"The process of providing or obtaining the food necessary for health and growth.",example:"Poor nutrition in early childhood can have lasting effects on cognitive development.",usageNote:"Related: nutritious, nutritional, malnourishment.",difficulty:"basic"},
      {word:"chronic",meaning:"(Of a disease or condition) persisting for a long time or constantly recurring.",example:"The rising incidence of chronic diseases such as diabetes poses a challenge to health services.",usageNote:"Contrasted with 'acute'. Common in IELTS reading passages about public health.",difficulty:"intermediate"},
      {word:"holistic",meaning:"Treating the whole person rather than just the symptoms of a disease.",example:"A holistic approach to healthcare considers a patient's mental and social situation alongside physical health.",usageNote:"Common in modern health writing; also used in education and management contexts.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Society and Culture",
    items: [
      {word:"demographic",meaning:"Relating to the structure of populations; (n) a particular sector of a population.",example:"Ageing demographics are placing increasing pressure on public pension systems.",usageNote:"Often used in plural: demographics. Useful in essays on population and society.",difficulty:"intermediate"},
      {word:"consumerism",meaning:"The preoccupation of society with the acquisition of consumer goods.",example:"Critics argue that consumerism encourages a disposable culture that harms the environment.",usageNote:"High-band vocabulary for Task 2 essays on culture, economy, and values.",difficulty:"intermediate"},
      {word:"assimilation",meaning:"The process by which a person or group adopts the culture of another group.",example:"The speed of cultural assimilation among immigrant communities varies widely.",usageNote:"Also used in biology (digestion). In social contexts, sometimes viewed as controversial.",difficulty:"advanced"},
      {word:"inequality",meaning:"Difference in size, degree, or circumstances between people or groups.",example:"Economic inequality between urban and rural populations continues to widen in many countries.",usageNote:"Collocations: income inequality, gender inequality, social inequality.",difficulty:"basic"},
      {word:"cohesion",meaning:"The action of forming a united whole; the quality that makes people or groups stick together.",example:"Strong community cohesion can help prevent social unrest.",usageNote:"Often used in the collocation 'social cohesion'. Relevant to IELTS essays on immigration and identity.",difficulty:"intermediate"},
      {word:"stereotype",meaning:"A widely held but fixed and oversimplified image of a particular type of person or thing.",example:"Advertising often relies on gender stereotypes to sell products.",usageNote:"Can be used as both noun and verb. Useful in Task 2 essays on media and society.",difficulty:"basic"},
      {word:"philanthropy",meaning:"The practice of donating money and time to help others, especially through charitable organisations.",example:"Corporate philanthropy can help bridge gaps in government provision of social services.",usageNote:"Related: philanthropist, philanthropic. High-band vocabulary for essays on business ethics.",difficulty:"advanced"},
      {word:"urbanisation",meaning:"The process by which towns and cities are formed and grow as more people begin living in them.",example:"Rapid urbanisation in developing countries has led to the growth of informal settlements.",usageNote:"Frequently tested in IELTS reading and Task 2 essays on cities and development.",difficulty:"intermediate"},
      {word:"meritocracy",meaning:"A system in which advancement is based on individual ability and achievement.",example:"Many people believe that true meritocracy is impossible without equal access to quality education.",usageNote:"Useful in essays on education, equality, and social mobility.",difficulty:"advanced"},
      {word:"indigenous",meaning:"Originating or occurring naturally in a particular place; native.",example:"The rights of indigenous communities to their ancestral lands have long been contested.",usageNote:"Plural noun: indigenous peoples. Appears in IELTS passages on culture, history, and environment.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Economics and Work",
    items: [
      {word:"productivity",meaning:"The effectiveness of productive effort measured in terms of output per unit of input.",example:"Remote working has been shown to increase productivity in many knowledge-based industries.",usageNote:"Collocations: boost productivity, low productivity, labour productivity.",difficulty:"intermediate"},
      {word:"remuneration",meaning:"Money paid for work or services; payment.",example:"Many employees cite remuneration as the primary factor in job satisfaction surveys.",usageNote:"Formal synonym for 'pay' or 'salary'. Useful for high-band Task 2 essays on work.",difficulty:"advanced"},
      {word:"outsourcing",meaning:"Obtaining goods or services from an outside supplier rather than producing them internally.",example:"Companies often reduce costs by outsourcing customer service operations to countries with lower wages.",usageNote:"Common in Task 2 essays on globalisation and employment.",difficulty:"intermediate"},
      {word:"inflation",meaning:"A general increase in prices and fall in the purchasing value of money.",example:"High inflation erodes the savings of ordinary households and reduces consumer spending.",usageNote:"Contrasted with 'deflation'. Essential vocabulary for economics Task 2 essays.",difficulty:"intermediate"},
      {word:"entrepreneurship",meaning:"The activity of setting up a business, especially when this involves taking financial risks.",example:"Governments can encourage entrepreneurship by reducing bureaucratic barriers to starting a business.",usageNote:"Related: entrepreneur, entrepreneurial. Useful in Task 2 essays on economy and innovation.",difficulty:"intermediate"},
      {word:"disposable income",meaning:"Income remaining after deduction of taxes and social security charges, available for spending or saving.",example:"A rise in disposable income typically leads to increased consumer spending.",usageNote:"Important economic concept for discussing consumer behaviour in Task 2 essays.",difficulty:"intermediate"},
      {word:"subsidise",meaning:"To pay part of the cost of something to keep the price low for the consumer.",example:"Some governments subsidise public transport to encourage people to use it instead of private cars.",usageNote:"British spelling (American: subsidize). Related noun: subsidy.",difficulty:"intermediate"},
      {word:"revenue",meaning:"Income generated from the sale of goods or services; income received by a government from taxes.",example:"Tax revenue from multinational corporations fell sharply as profits were moved offshore.",usageNote:"Distinguish from 'profit' — revenue is total income before costs are deducted.",difficulty:"intermediate"},
      {word:"austerity",meaning:"Difficult economic conditions created by government measures to reduce public expenditure.",example:"Years of austerity measures resulted in significant cuts to healthcare and education budgets.",usageNote:"Politically loaded term; useful for Task 2 essays on government spending and social services.",difficulty:"advanced"},
      {word:"globalisation",meaning:"The process by which businesses and other organisations develop international influence or operate on an international scale.",example:"Critics of globalisation argue that it benefits wealthy nations disproportionately.",usageNote:"One of the most common IELTS Task 2 themes. Related: global, globalise.",difficulty:"basic"},
    ]
  },
  {
    topic: "IELTS Writing Collocations",
    items: [
      {word:"it is widely acknowledged that",meaning:"A formal phrase used to introduce a point that most people accept as true.",example:"It is widely acknowledged that physical exercise is essential for both physical and mental health.",usageNote:"Strong opener for Task 2 opinion paragraphs. Avoid overusing.",difficulty:"intermediate"},
      {word:"in recent decades",meaning:"Referring to the past 20–30 years.",example:"In recent decades, the proportion of women in senior management roles has increased significantly.",usageNote:"Useful for framing trends in Task 1 and Task 2 essays.",difficulty:"basic"},
      {word:"far-reaching consequences",meaning:"Effects that extend a long way in scope or influence.",example:"Climate change will have far-reaching consequences for agriculture, public health, and migration.",usageNote:"Stronger and more specific than 'big effects'. Suitable for Task 2 conclusions.",difficulty:"intermediate"},
      {word:"a viable alternative",meaning:"A practical option that can be used instead of something else.",example:"Electric vehicles are now considered a viable alternative to petrol-powered cars.",usageNote:"Very useful in Task 2 solution essays. 'Viable' implies it is both possible and practical.",difficulty:"intermediate"},
      {word:"the root cause of",meaning:"The fundamental reason or origin of a problem.",example:"Poverty is often identified as the root cause of high crime rates in urban areas.",usageNote:"Preferred in formal writing over simply 'the cause of'. Useful in problem-solution essays.",difficulty:"intermediate"},
      {word:"exacerbate",meaning:"To make a problem, bad situation, or feeling worse.",example:"Traffic congestion exacerbates air pollution and increases journey times.",usageNote:"Antonym: ameliorate. One of the highest-value vocabulary words for IELTS Task 2.",difficulty:"advanced"},
      {word:"it could be argued that",meaning:"A phrase used to introduce an argument that may be contested.",example:"It could be argued that competition between schools improves educational standards.",usageNote:"Used to present a view without full personal commitment. Useful in discussion essays.",difficulty:"intermediate"},
      {word:"have a detrimental effect on",meaning:"To have a harmful or damaging effect on something.",example:"A sedentary lifestyle can have a detrimental effect on both physical and mental health.",usageNote:"More formal than 'hurt' or 'damage'. Strong collocation for Task 2 body paragraphs.",difficulty:"intermediate"},
      {word:"there is growing evidence that",meaning:"Research and data are increasingly showing that something is true.",example:"There is growing evidence that ultra-processed foods are linked to a range of chronic diseases.",usageNote:"Useful for introducing research-based points in Task 2 essays.",difficulty:"intermediate"},
      {word:"play a pivotal role in",meaning:"To have a very important and central role in something.",example:"Education plays a pivotal role in reducing social inequality.",usageNote:"More specific than 'have an important role'. Good for body paragraph topic sentences.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Reading Strategies Vocabulary",
    items: [
      {word:"inference",meaning:"A conclusion reached based on evidence and reasoning rather than from explicit statements.",example:"The question required students to make an inference about the writer's attitude.",usageNote:"Related to 'not given' type questions — the answer is implied, not stated directly.",difficulty:"intermediate"},
      {word:"paraphrase",meaning:"To express the meaning of something in different words.",example:"The IELTS Reading test often paraphrases information from the passage in its questions.",usageNote:"Key skill for all IELTS Reading question types — the questions rarely repeat words exactly.",difficulty:"intermediate"},
      {word:"synonym",meaning:"A word or phrase that means the same or nearly the same as another.",example:"In IELTS Reading, the correct answer is often a synonym of a phrase in the passage.",usageNote:"Building a strong vocabulary of synonyms is essential for IELTS Reading and Writing.",difficulty:"basic"},
      {word:"concession",meaning:"An admission that something is true or valid, typically after initial resistance.",example:"The writer makes a concession to her opponents before restating her main argument.",usageNote:"Recognising concession language ('although', 'while', 'despite') is crucial in Y/N/NG questions.",difficulty:"advanced"},
      {word:"distracter",meaning:"In a multiple-choice test, an incorrect option designed to appear plausible.",example:"The distractors in IELTS Reading often contain key words from the passage but change the meaning.",usageNote:"Recognising how distractors are constructed helps avoid common traps in MCQ questions.",difficulty:"advanced"},
      {word:"qualifier",meaning:"A word or phrase that modifies or limits the meaning of another word (e.g. 'only', 'mainly', 'sometimes').",example:"Pay attention to qualifiers like 'always' or 'never' in True/False/Not Given questions.",usageNote:"Absolute qualifiers ('always', 'never', 'all') are often the key to False answers in IELTS.",difficulty:"intermediate"},
      {word:"gist",meaning:"The main point or substance of something.",example:"Skimming a passage for its gist before answering questions saves time in the exam.",usageNote:"Reading for gist is the first strategy recommended for IELTS Reading passages.",difficulty:"basic"},
      {word:"nuance",meaning:"A subtle difference in meaning, expression, or sound.",example:"IELTS Not Given answers often depend on recognising a nuance the passage doesn't explicitly address.",usageNote:"Important for Y/N/NG questions — the passage may be similar to the statement but not identical.",difficulty:"advanced"},
      {word:"implication",meaning:"A conclusion that can be drawn from something although it is not stated explicitly.",example:"The writer does not state this directly, but the implication is clear.",usageNote:"Key for 'Yes/No/Not Given' questions where the answer depends on what is implied.",difficulty:"intermediate"},
      {word:"assertion",meaning:"A confident and forceful statement of fact or belief.",example:"The passage contains several assertions that are not supported by evidence.",usageNote:"Related: assert, assertive. Useful for identifying the writer's tone in academic passages.",difficulty:"advanced"},
    ]
  },
  {
    topic: "Grammar for IELTS (Key Structures)",
    items: [
      {word:"passive voice",meaning:"A grammatical construction in which the subject receives the action rather than performs it.",example:"Great strides have been made in renewable energy technology in recent years.",usageNote:"Essential for IELTS Task 1 graphs and processes; also lends formality to Task 2 writing.",difficulty:"intermediate"},
      {word:"conditional sentences",meaning:"Sentences expressing a condition and its consequence, using structures like 'if...would/will/might'.",example:"If governments invested more in public transport, congestion levels would fall significantly.",usageNote:"Second conditional (if + past, would + inf.) is especially useful for Task 2 recommendations.",difficulty:"intermediate"},
      {word:"relative clause",meaning:"A clause beginning with 'who', 'which', 'that', or 'where' that gives more information about a noun.",example:"The scientists who conducted the study were based at Cambridge University.",usageNote:"Defining (no commas) and non-defining (with commas) clauses are both tested in IELTS Grammar.",difficulty:"intermediate"},
      {word:"cohesive device",meaning:"A word or phrase used to connect ideas in writing, such as 'however', 'in addition', or 'therefore'.",example:"The use of appropriate cohesive devices is assessed in the Coherence and Cohesion IELTS criterion.",usageNote:"Varied use of cohesive devices improves coherence scores. Avoid overusing 'furthermore'.",difficulty:"basic"},
      {word:"concessive clause",meaning:"A clause introduced by 'although', 'even though', or 'while' that acknowledges a contrast.",example:"Although there are clear economic benefits, tourism can also cause environmental damage.",usageNote:"Concessive clauses allow nuanced arguments in Task 2 — essential for Band 7+ writing.",difficulty:"intermediate"},
      {word:"noun phrase",meaning:"A group of words based on a noun that acts as a subject or object in a sentence.",example:"The rapid expansion of urban populations has placed enormous strain on infrastructure.",usageNote:"Using complex noun phrases makes your writing more sophisticated and academic.",difficulty:"intermediate"},
      {word:"fronting",meaning:"Placing an element other than the subject at the beginning of a sentence for emphasis.",example:"Of particular concern to researchers is the long-term effect on biodiversity.",usageNote:"An advanced rhetorical device that adds variety to sentence structure in Task 2 essays.",difficulty:"advanced"},
      {word:"hedging language",meaning:"Cautious language used to indicate uncertainty or avoid making absolute claims.",example:"The results suggest that regular exercise may reduce the risk of developing diabetes.",usageNote:"Words like 'may', 'might', 'tend to', 'appear to', and 'suggest' are important hedges in academic writing.",difficulty:"intermediate"},
      {word:"cleft sentence",meaning:"A construction that divides a sentence into two parts for emphasis, often starting with 'It is/was...that'.",example:"It was the invention of the printing press that made books affordable for ordinary people.",usageNote:"Cleft sentences add emphasis and stylistic variety — useful for Band 7+ writing.",difficulty:"advanced"},
      {word:"parallel structure",meaning:"Using the same grammatical form for elements that have the same function in a sentence.",example:"The programme aims to improve literacy, boost employment, and reduce poverty.",usageNote:"Parallel lists are required by IELTS Writing marking criteria under Grammatical Range.",difficulty:"intermediate"},
    ]
  },
  {
    topic: "Listening Vocabulary",
    items: [
      {word:"form-filling",meaning:"The task of completing blanks in a form based on information heard in a listening script.",example:"In Section 1 of IELTS Listening, you are often required to complete a form with names, numbers, and dates.",usageNote:"Focus on spelling — one spelling mistake loses the mark, even if the word is correct.",difficulty:"basic"},
      {word:"distractor",meaning:"Information in a listening script designed to mislead the listener from the correct answer.",example:"The speaker first mentions £45 but then corrects herself to £54 — the second figure is the answer.",usageNote:"Listen carefully for corrections, contrasts, and repeated information — these signal the real answer.",difficulty:"intermediate"},
      {word:"signposting language",meaning:"Words and phrases a speaker uses to indicate what they are about to say or have just said.",example:"'Turning to the next point…' is a signposting phrase that tells you a new topic is beginning.",usageNote:"Recognising signposting helps you follow structure in IELTS Listening Sections 3 and 4.",difficulty:"intermediate"},
      {word:"multiple-speaker dialogue",meaning:"A conversation involving more than one participant in a listening test.",example:"IELTS Listening Sections 1 and 3 typically feature multiple-speaker dialogues.",usageNote:"Track which speaker gives each piece of information — answers often come only from one speaker.",difficulty:"basic"},
      {word:"paraphrase (listening)",meaning:"The use of different words in the listening script to express the same information as the question.",example:"The question says 'inexpensive' but the speaker says 'affordable' — these are paraphrases.",usageNote:"Most IELTS Listening answers require recognising paraphrases rather than identical words.",difficulty:"intermediate"},
      {word:"note completion",meaning:"A listening task in which you complete notes or a summary from information heard.",example:"Section 4 of IELTS Listening often requires note completion from an academic lecture.",usageNote:"Read the notes carefully before listening — gaps tell you what type of word to listen for.",difficulty:"basic"},
      {word:"label a diagram",meaning:"A listening task in which you identify parts of a diagram, map, or plan.",example:"In the listening test, you may need to label a floor plan of a building based on directions given.",usageNote:"Locate your starting point on the diagram before the recording begins.",difficulty:"intermediate"},
      {word:"predict the answer type",meaning:"Using the questions to anticipate what kind of information (number, name, place, etc.) you will hear.",example:"If the gap comes after 'Date:', predict that you will hear a date in the recording.",usageNote:"Reading ahead during the 30-second preparation time is the single most effective IELTS Listening strategy.",difficulty:"basic"},
      {word:"cardinal number",meaning:"A number denoting quantity (e.g. one, two, three) rather than order.",example:"The guide says the entrance fee is twelve pounds and fifty pence.",usageNote:"Write numbers carefully — '12.50' and 'twelve pounds fifty' are both acceptable answers.",difficulty:"basic"},
      {word:"false start",meaning:"When a speaker begins to say one thing and then changes to something else.",example:"'The meeting is on the… actually, it's been moved to Thursday.'",usageNote:"In listening, the corrected information — not the first attempt — is usually the answer.",difficulty:"intermediate"},
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGIES (useful for the learning hub)
// ─────────────────────────────────────────────────────────────────────────────

const STRATEGIES = {
  exam: "ielts",
  section: "strategies",
  lastUpdated: "2025",
  sections: [
    {
      name: "Reading",
      tips: [
        "Skim each passage in under 3 minutes to get the gist before looking at any questions.",
        "For True/False/Not Given questions, look for exact correspondence — if the passage is similar but not identical to the statement, it is likely NOT GIVEN.",
        "Qualifiers like 'always', 'never', and 'only' in questions are often the key to a FALSE answer.",
        "In sentence completion questions, the answer must fit grammatically — check the word class required.",
        "The questions follow the order of information in the passage for most question types (except Matching and Headings).",
        "For Matching Headings, eliminate headings that are too narrow (covering only a detail) or too broad.",
        "Scan for proper nouns, numbers, and capitalised words — these are the quickest way to locate the relevant section.",
        "Never spend more than 2 minutes on a single question — mark it and move on.",
        "In multiple-choice questions, all the options often use words from the passage. Check meaning, not just word recognition.",
        "Allow 3–4 minutes at the end to transfer answers and check spelling."
      ]
    },
    {
      name: "Writing",
      tips: [
        "Task 1: Always write at least 150 words and include an overview statement summarising the key trend.",
        "Task 1: Do not give your opinion — describe the data objectively.",
        "Task 2: Always write at least 250 words. Most Band 7 essays are around 280–320 words.",
        "Task 2: Plan before you write — spend 3–5 minutes planning your main points and examples.",
        "Vary your sentence structures — mix simple, compound, and complex sentences.",
        "Use formal linking words (however, furthermore, in contrast) rather than informal ones (also, but, so).",
        "Avoid contractions (don't, can't) — these are informal and reduce your score.",
        "Include specific examples in Task 2 — 'for instance' followed by a concrete example raises your Task Response score.",
        "Check for subject-verb agreement and article usage ('the', 'a', 'an') before submitting.",
        "In discussion essays, present both views before giving your opinion — do not take sides in the body paragraphs."
      ]
    },
    {
      name: "Listening",
      tips: [
        "Read the questions during the preparation time — predict what type of answer you need (name, number, place, etc.).",
        "Write your answer as you listen — do not wait until the end.",
        "Watch out for distractors: a speaker often mentions one detail and then corrects it to another.",
        "Answers in Section 1 and 2 are often paraphrases of the options — listen for synonyms.",
        "For map and diagram labelling, locate your starting point on the image before the recording begins.",
        "In multiple-choice questions, all options are often mentioned — only one will be the correct answer.",
        "Spelling matters: one spelling mistake loses the mark. If unsure, write the most common spelling.",
        "Numbers and dates must be exact — listen for corrections ('it's the fourteenth… no, the fifteenth').",
        "Section 4 is an academic monologue — the most challenging section. Read ahead as far as possible.",
        "You have 10 minutes at the end to transfer answers — use this time to check spelling and grammar."
      ]
    },
    {
      name: "Speaking",
      tips: [
        "Part 1 answers should be 2–3 sentences, not single words. Give a reason or example for every answer.",
        "Part 2 (cue card): use the 1-minute preparation time to note 3–4 key points, not to write a script.",
        "Speak for the full 2 minutes in Part 2 — keep talking even if you feel you have covered the main points.",
        "Part 3 requires extended, analytical answers — show you can discuss abstract ideas.",
        "Use a range of tenses: past ('when I was younger'), present ('nowadays'), and future ('I think in the future...').",
        "Use discourse markers to organise your speech: 'Well, I think...', 'What's more...', 'On the other hand...'",
        "Pronunciation is more about clarity than accent — speak at a natural pace, not too fast.",
        "If you do not understand a question, it is acceptable to ask the examiner to repeat or clarify it.",
        "Avoid memorised responses — examiners are trained to identify scripted answers.",
        "Hesitation fillers like 'um' and 'er' are normal, but varied ones ('Let me think...', 'That's an interesting question') sound more natural."
      ]
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: pick 3 passages for a reading test
// ─────────────────────────────────────────────────────────────────────────────

function pick3(testNum) {
  const n = PASSAGE_POOL.length; // 12
  const i0 = (testNum * 3)     % n;
  const i1 = (testNum * 3 + 1) % n;
  const i2 = (testNum * 3 + 2) % n;
  return [PASSAGE_POOL[i0], PASSAGE_POOL[i1], PASSAGE_POOL[i2]];
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD READING TEST
// ─────────────────────────────────────────────────────────────────────────────

function makeReadingTest(n) {
  const id = String(n).padStart(3, "0");
  const passages = pick3(n - 1);
  const passageObjs = passages.map((p, pi) => ({
    id: `ielts-reading-${id}-p${pi+1}`,
    title: p.title,
    text: p.text
  }));

  let qNum = 1;
  const questions = [];

  passages.forEach((p, pi) => {
    const pid = `ielts-reading-${id}-p${pi+1}`;
    p.questions.forEach(q => {
      const qId = `ielts-reading-${id}-q${String(qNum).padStart(2,"0")}`;
      questions.push({
        id: qId,
        passageId: pid,
        passageIndex: pi,
        questionType: q.type,
        num: qNum++,
        prompt: q.prompt,
        ...(q.opts ? {options: q.opts} : {}),
        correctAnswer: q.a,
        explanation: q.e
      });
    });
  });

  return {
    id: `ielts-reading-${id}`,
    exam: "ielts",
    section: "reading",
    type: "section",
    title: `IELTS Academic Reading Practice Test ${n}`,
    variant: "academic",
    durationSeconds: 3600,
    questionCount: questions.length,
    instructions: "Three passages totalling approximately 2,200–2,800 words. Answer all questions. You may write on this page while reading. Transfer answers carefully at the end.",
    passages: passageObjs,
    questions
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD WRITING TEST
// ─────────────────────────────────────────────────────────────────────────────

function makeWritingTest(n) {
  const id = String(n).padStart(3, "0");
  const p = WRITING_PROMPTS[(n - 1) % WRITING_PROMPTS.length];
  return {
    id: `ielts-writing-${id}`,
    exam: "ielts",
    section: "writing",
    type: "section",
    title: `IELTS Academic Writing Practice Test ${n}`,
    durationSeconds: 3600,
    questionCount: 2,
    instructions: "You have 60 minutes for both tasks. Spend approximately 20 minutes on Task 1 and 40 minutes on Task 2.",
    questions: [
      {
        id: `ielts-writing-${id}-q01`,
        questionType: "writing_task",
        taskNumber: 1,
        prompt: p.t1,
        minWords: 150,
        rubric: ["task achievement","coherence and cohesion","lexical resource","grammatical range and accuracy"],
        difficulty: "medium",
        topic: p.topic
      },
      {
        id: `ielts-writing-${id}-q02`,
        questionType: "writing_task",
        taskNumber: 2,
        prompt: p.t2,
        minWords: 250,
        rubric: ["task response","coherence and cohesion","lexical resource","grammatical range and accuracy"],
        difficulty: "medium",
        topic: p.topic
      }
    ],
    variant: "academic"
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE FILES
// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, {recursive:true}); }

ensureDir(OUT_R);
ensureDir(OUT_W);

let readingCount = 0, writingCount = 0;

// Reading tests 1–60
for (let n = 1; n <= 60; n++) {
  const obj = makeReadingTest(n);
  const id = String(n).padStart(3, "0");
  fs.writeFileSync(path.join(OUT_R, `test-${id}.json`), JSON.stringify(obj, null, 2));
  process.stdout.write(`Reading ${n}/60…`);
  readingCount++;
}

// Writing tests 1–60
for (let n = 1; n <= 60; n++) {
  const obj = makeWritingTest(n);
  const id = String(n).padStart(3, "0");
  fs.writeFileSync(path.join(OUT_W, `test-${id}.json`), JSON.stringify(obj, null, 2));
  writingCount++;
}

// Vocabulary
const vocabOut = {
  exam: "ielts",
  section: "vocabulary",
  lastUpdated: "2025",
  topicCount: VOCAB_TOPICS.length,
  topics: VOCAB_TOPICS
};
ensureDir(path.dirname(OUT_V));
fs.writeFileSync(OUT_V, JSON.stringify(vocabOut, null, 2));

// Strategies
fs.writeFileSync(OUT_S, JSON.stringify(STRATEGIES, null, 2));

console.log(`\n\nDone!`);
console.log(`  Reading tests: ${readingCount}`);
console.log(`  Writing tests: ${writingCount}`);
console.log(`  Vocab topics:  ${VOCAB_TOPICS.length} (${VOCAB_TOPICS.reduce((a,t)=>a+t.items.length,0)} words total)`);
console.log(`  Strategies:    4 sections`);
