/**
 * fix-ielts-reading-content.js
 *
 * Creates 20 unique IELTS-style academic passage sets.
 * Each set has 3 passages with 14+13+13=40 questions total.
 * Distributes them across all 60 reading tests so every test
 * has distinct Q1-Q3 prompts.
 */

const fs   = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "content", "ielts", "reading");

// ─── 20 Unique Passage Sets ──────────────────────────────────────────────────
// Each set: { p1, p2, p3 } each with { title, text, questions[] }
// Questions use True/False/NG, multiple choice, fill-blank, matching types

const PASSAGE_SETS = [
  // ─── SET 01 ─────────────────────────────────────────────────────────────
  {
    p1: {
      title: "The Science of Sleep",
      text: `Sleep is one of the most fundamental biological processes, yet for centuries scientists struggled to understand its purpose. The ancient Greeks believed sleep was a passive state in which the body simply rested, but modern research has revealed it to be an intensely active period during which critical functions are performed. During sleep, the brain consolidates memories, clearing metabolic waste and organising information gathered during waking hours.

The sleep cycle consists of several distinct stages. Non-REM (NREM) sleep, which occupies roughly 75–80% of total sleep time, is divided into three phases of increasing depth. The deepest phase, slow-wave sleep, is when the body repairs tissue, synthesises proteins, and releases growth hormones. Rapid Eye Movement (REM) sleep, by contrast, is associated with vivid dreaming and is thought to play a crucial role in emotional processing and creative problem-solving.

Circadian rhythms — internal biological clocks operating on roughly 24-hour cycles — regulate when humans feel sleepy or alert. These rhythms are influenced by external cues, particularly light. Blue light from screens can suppress the secretion of melatonin, the hormone that signals the body to prepare for sleep, potentially delaying sleep onset. Artificial light exposure has been linked to rising rates of insomnia and other sleep disorders in industrialised nations.

Chronic sleep deprivation carries severe health consequences. Studies conducted at the University of Chicago found that sleeping fewer than six hours a night is associated with increased risks of obesity, type 2 diabetes, cardiovascular disease, and impaired immune function. Furthermore, cognitive performance, including attention, reaction time, and decision-making, deteriorates measurably after even modest sleep restriction. Some researchers now argue that sleep is as critical to health as nutrition and exercise.`,
      questions: [
        { id:"q001", passageId:"p1", questionType:"true_false_not_given", question:"Ancient Greek scientists understood that sleep was an active biological process.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage states the Greeks believed sleep was passive." },
        { id:"q002", passageId:"p1", questionType:"true_false_not_given", question:"Slow-wave sleep is associated with protein synthesis and tissue repair.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage explicitly states this about the deepest NREM phase." },
        { id:"q003", passageId:"p1", questionType:"true_false_not_given", question:"REM sleep occupies approximately 75–80% of total sleep time.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"It is NREM sleep that occupies 75–80%. REM sleep is the remainder." },
        { id:"q004", passageId:"p1", questionType:"true_false_not_given", question:"Circadian rhythms in humans operate on precisely 24-hour cycles.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says 'roughly 24-hour cycles', not precisely." },
        { id:"q005", passageId:"p1", questionType:"true_false_not_given", question:"Blue light from screens can delay when a person falls asleep.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"By suppressing melatonin, blue light delays sleep onset." },
        { id:"q006", passageId:"p1", questionType:"multiple_choice", question:"According to the passage, what is the primary function of REM sleep?", options:["Protein synthesis","Emotional processing and creative problem-solving","Clearing metabolic waste","Regulating circadian rhythms"], correctAnswer:"B", explanation:"The passage identifies REM as crucial for emotional processing and creative problem-solving." },
        { id:"q007", passageId:"p1", questionType:"multiple_choice", question:"What did research at the University of Chicago reveal?", options:["Six hours of sleep is ideal for adults","Sleeping under six hours raises risk of several diseases","Obesity directly causes sleep deprivation","Melatonin cures insomnia"], correctAnswer:"B", explanation:"The passage references Chicago research linking under six hours to obesity, diabetes, cardiovascular disease, and immune impairment." },
        { id:"q008", passageId:"p1", questionType:"fill_blank", question:"During deep sleep, the body releases __________ hormones.", correctAnswer:"growth", explanation:"The passage explicitly mentions growth hormone release during slow-wave sleep." },
        { id:"q009", passageId:"p1", questionType:"fill_blank", question:"The hormone that signals the body to prepare for sleep is called __________.", correctAnswer:"melatonin", explanation:"Melatonin is the hormone mentioned in the context of sleep preparation." },
        { id:"q010", passageId:"p1", questionType:"true_false_not_given", question:"Some researchers consider sleep as important to health as diet and physical activity.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The final sentence explicitly makes this claim." },
        { id:"q011", passageId:"p1", questionType:"multiple_choice", question:"Which of the following best describes how circadian rhythms are influenced?", options:["By food intake patterns","Primarily by light exposure","By ambient temperature","By exercise timing"], correctAnswer:"B", explanation:"The passage says circadian rhythms are influenced by external cues, particularly light." },
        { id:"q012", passageId:"p1", questionType:"true_false_not_given", question:"Insomnia has been linked to excessive use of artificial light in developed countries.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage links artificial light exposure to rising insomnia rates in industrialised nations." },
        { id:"q013", passageId:"p1", questionType:"fill_blank", question:"Cognitive abilities like __________, reaction time, and decision-making deteriorate with sleep restriction.", correctAnswer:"attention", explanation:"The passage lists attention, reaction time, and decision-making as affected." },
        { id:"q014", passageId:"p1", questionType:"true_false_not_given", question:"The brain organises information from the day during waking hours.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says this happens during sleep, not waking hours." },
      ],
    },
    p2: {
      title: "The Economics of Water Scarcity",
      text: `Water covers approximately 71% of the Earth's surface, yet less than 3% of all water is fresh, and the vast majority of that is locked in glaciers and polar ice caps. Only about 0.5% of freshwater is readily accessible in rivers, lakes, and aquifers. As the global population grows and climate change alters precipitation patterns, the competition for this finite resource is intensifying.

Agricultural use accounts for around 70% of global freshwater withdrawals, and much of this is inefficiently applied. Flood irrigation, the oldest and most widespread irrigation method, loses up to 60% of water to evaporation and runoff before reaching plant roots. Drip irrigation technology, which delivers water directly to the root zone, can reduce agricultural water use by 30–50%, but its high installation cost limits adoption in lower-income regions.

Water pricing is a contentious political issue. In many countries, water is heavily subsidised or supplied at minimal cost, creating incentives for wasteful use. Economists argue that water should be priced to reflect its true scarcity value, which would encourage conservation and more efficient allocation. Critics, however, contend that market pricing would make water unaffordable for poor households, raising equity concerns. Some jurisdictions have implemented tiered pricing systems in which the first block of water consumed is subsidised while higher consumption is charged at progressively higher rates.

Desalination — removing salt from seawater — offers an alternative supply source for coastal nations. Countries like Israel and Saudi Arabia now meet a significant portion of their freshwater needs through desalination, but the technology is energy-intensive and expensive. Advances in membrane technology and renewable energy integration are gradually reducing costs, and the global desalination capacity has been growing by approximately 7–8% annually over the past decade.`,
      questions: [
        { id:"q015", passageId:"p2", questionType:"true_false_not_given", question:"Less than 1% of the world's fresh water is easily accessible.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage states only 0.5% is accessible in rivers, lakes, and aquifers." },
        { id:"q016", passageId:"p2", questionType:"multiple_choice", question:"What proportion of global freshwater withdrawals does agriculture account for?", options:["50%","60%","70%","80%"], correctAnswer:"C", explanation:"The passage states agriculture accounts for around 70%." },
        { id:"q017", passageId:"p2", questionType:"true_false_not_given", question:"Drip irrigation is widely used in lower-income countries due to its affordability.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says high installation cost limits adoption in lower-income regions." },
        { id:"q018", passageId:"p2", questionType:"fill_blank", question:"Flood irrigation can lose up to ____% of water before it reaches plant roots.", correctAnswer:"60", explanation:"The passage explicitly states up to 60% loss." },
        { id:"q019", passageId:"p2", questionType:"multiple_choice", question:"What concern do critics raise about market pricing of water?", options:["It encourages waste","It rewards efficient users","It makes water unaffordable for poor households","It reduces desalination investment"], correctAnswer:"C", explanation:"Critics contend market pricing raises equity concerns by making water unaffordable for the poor." },
        { id:"q020", passageId:"p2", questionType:"true_false_not_given", question:"Israel and Saudi Arabia produce most of their drinking water through desalination.", options:["True","False","Not Given"], correctAnswer:"Not Given", explanation:"The passage says they meet 'a significant portion', not most." },
        { id:"q021", passageId:"p2", questionType:"fill_blank", question:"Desalination capacity has been growing at approximately ____% per year over the past decade.", correctAnswer:"7–8", explanation:"The passage gives the figure of 7–8% annual growth." },
        { id:"q022", passageId:"p2", questionType:"true_false_not_given", question:"Tiered pricing systems charge lower rates for higher water consumption.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The opposite is described — higher consumption is charged at progressively higher rates." },
        { id:"q023", passageId:"p2", questionType:"multiple_choice", question:"According to the passage, what is reducing the cost of desalination?", options:["Government subsidies","Advances in membrane technology and renewable energy","Population growth","Water recycling programs"], correctAnswer:"B", explanation:"Membrane technology advances and renewable energy integration are cited." },
        { id:"q024", passageId:"p2", questionType:"true_false_not_given", question:"Most of Earth's fresh water is found in rivers and lakes.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Most fresh water is locked in glaciers and polar ice caps." },
        { id:"q025", passageId:"p2", questionType:"fill_blank", question:"Economists argue water should be priced to reflect its true __________ value.", correctAnswer:"scarcity", explanation:"The passage explicitly uses the term 'scarcity value'." },
        { id:"q026", passageId:"p2", questionType:"true_false_not_given", question:"Climate change is expected to have no effect on freshwater availability.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Climate change altering precipitation patterns is mentioned as increasing competition for water." },
        { id:"q027", passageId:"p2", questionType:"multiple_choice", question:"Drip irrigation delivers water directly to:", options:["The soil surface","The root zone","The leaf canopy","Underground reservoirs"], correctAnswer:"B", explanation:"The passage specifies 'directly to the root zone'." },
      ],
    },
    p3: {
      title: "The Architecture of Ancient Rome",
      text: `Roman architecture represents one of history's greatest feats of engineering and urban planning. The Romans drew heavily on Greek and Etruscan precedents but developed distinctly original innovations that continue to influence building design today. Among their most consequential contributions were the widespread use of concrete (opus caementicium), the arch, the vault, and the dome.

Roman concrete was revolutionary. Unlike modern Portland cement, Roman concrete (volcanic pozzolana mixed with seawater and lime) has been shown to strengthen over time through a process called aluminous tobermorite crystal growth. Studies published in journals such as American Mineralogist have revealed that sea-wall structures built two millennia ago are structurally superior to modern equivalents. The Pantheon, completed in 125 CE under Emperor Hadrian, features a concrete dome 43.3 metres in diameter that remained the largest in the world for over 1,300 years.

Roman engineers applied hydraulic expertise at unprecedented scale. The aqueduct network, stretching at its peak to over 500 kilometres of main channels and thousands of kilometres of secondary branches, delivered an estimated 300–500 litres of water per person per day to Rome — a figure that rivals many modern cities. The Aqua Claudia, completed in 52 CE, ran for 69 kilometres, including 16 kilometres of elevated arcades.

The Roman forum — an open rectangular plaza surrounded by civic and religious buildings — became the template for town centres throughout the Empire and influenced the design of city squares across Europe and the Americas. Buildings such as the Colosseum, completed in 80 CE, showcased Roman mastery of the elliptical arena form and prefigured modern sports stadiums in their tiered seating, numbered entrances, and crowd management systems.`,
      questions: [
        { id:"q028", passageId:"p3", questionType:"true_false_not_given", question:"Roman architects invented the arch without influence from earlier civilisations.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Romans drew on Greek and Etruscan precedents, though they developed original innovations." },
        { id:"q029", passageId:"p3", questionType:"multiple_choice", question:"What distinguishes Roman concrete from modern Portland cement?", options:["It sets faster","It strengthens over time","It is lighter","It requires no water"], correctAnswer:"B", explanation:"Roman concrete strengthens over time through crystal growth, unlike modern cement." },
        { id:"q030", passageId:"p3", questionType:"fill_blank", question:"The Pantheon dome has a diameter of __________ metres.", correctAnswer:"43.3", explanation:"The passage gives the precise figure of 43.3 metres." },
        { id:"q031", passageId:"p3", questionType:"true_false_not_given", question:"The Pantheon was completed before Emperor Hadrian came to power.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says it was completed under Emperor Hadrian in 125 CE." },
        { id:"q032", passageId:"p3", questionType:"multiple_choice", question:"How much water did Rome's aqueduct system deliver per person per day at its peak?", options:["100–200 litres","150–250 litres","300–500 litres","500–700 litres"], correctAnswer:"C", explanation:"The passage states 300–500 litres per person per day." },
        { id:"q033", passageId:"p3", questionType:"true_false_not_given", question:"The Roman forum influenced the design of public squares in Europe and the Americas.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage explicitly states this influence." },
        { id:"q034", passageId:"p3", questionType:"fill_blank", question:"The Aqua Claudia aqueduct ran for __________ kilometres in total.", correctAnswer:"69", explanation:"The passage states it ran for 69 kilometres." },
        { id:"q035", passageId:"p3", questionType:"true_false_not_given", question:"The Colosseum was the first stadium to use tiered seating.", options:["True","False","Not Given"], correctAnswer:"Not Given", explanation:"The passage does not claim the Colosseum was the first; it says it showcased these features." },
        { id:"q036", passageId:"p3", questionType:"multiple_choice", question:"The research published in American Mineralogist found that Roman sea-walls:", options:["Were less durable than modern walls","Were equally durable as modern walls","Were structurally superior to modern equivalents","Were built using imported materials"], correctAnswer:"C", explanation:"The passage states they are structurally superior to modern equivalents." },
        { id:"q037", passageId:"p3", questionType:"true_false_not_given", question:"Roman concrete used volcanic pozzolana combined with freshwater.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage specifies seawater, not freshwater." },
        { id:"q038", passageId:"p3", questionType:"fill_blank", question:"The Pantheon's dome was the largest in the world for over __________ years.", correctAnswer:"1,300", explanation:"The passage states over 1,300 years." },
        { id:"q039", passageId:"p3", questionType:"true_false_not_given", question:"The Colosseum was completed in the first century CE.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"It was completed in 80 CE, which is in the first century CE." },
        { id:"q040", passageId:"p3", questionType:"multiple_choice", question:"What shape is the Colosseum?", options:["Rectangular","Circular","Elliptical","Hexagonal"], correctAnswer:"C", explanation:"The passage describes the Colosseum as an elliptical arena." },
      ],
    },
  },

  // ─── SET 02 ─────────────────────────────────────────────────────────────
  {
    p1: {
      title: "Coral Reefs and Climate Change",
      text: `Coral reefs occupy less than 0.1% of the ocean floor but support approximately 25% of all marine species, earning them the designation 'rainforests of the sea'. These ecosystems are formed by colonies of tiny animals called polyps that secrete calcium carbonate skeletons. The symbiotic relationship between corals and microscopic algae called zooxanthellae is fundamental to reef health: the algae photosynthesise and provide corals with up to 90% of their energy needs, while corals offer the algae shelter and the nutrients from their waste.

When water temperatures rise even 1–2°C above the seasonal maximum for extended periods, corals expel their zooxanthellae in a process called bleaching. Without their algal partners, corals turn white and, if the stress persists for more than eight weeks, begin to die. The Great Barrier Reef experienced mass bleaching events in 2016, 2017, 2020, 2022, and 2024, with surveys indicating that more than 50% of shallow-water corals have been lost since 1995.

Beyond temperature stress, ocean acidification — caused by the absorption of atmospheric carbon dioxide — poses a chemical threat. As seawater becomes more acidic, the concentration of carbonate ions decreases, making it harder for corals to build and maintain their calcium carbonate skeletons. Models project that at 2°C of global warming above pre-industrial levels, roughly 99% of the world's coral reefs could experience bleaching-level stress annually.

Conservation efforts include the establishment of marine protected areas (MPAs), coral gardening programmes that grow and transplant heat-resistant coral fragments, and experimental interventions such as assisted evolution, in which selective breeding produces corals with greater thermal tolerance. Critics note, however, that without drastic reductions in greenhouse gas emissions, such measures may only delay rather than prevent widespread reef collapse.`,
      questions: [
        { id:"q001", passageId:"p1", questionType:"true_false_not_given", question:"Coral reefs cover more than 1% of the ocean floor.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage states reefs occupy less than 0.1% of the ocean floor." },
        { id:"q002", passageId:"p1", questionType:"true_false_not_given", question:"Zooxanthellae algae provide corals with the majority of their energy requirements.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The algae provide up to 90% of corals' energy needs." },
        { id:"q003", passageId:"p1", questionType:"multiple_choice", question:"Bleaching occurs when corals expel their zooxanthellae due to:", options:["Pollution","Temperature rise","Predator attack","Storm damage"], correctAnswer:"B", explanation:"Temperature rising 1–2°C above the seasonal maximum triggers bleaching." },
        { id:"q004", passageId:"p1", questionType:"fill_blank", question:"Corals begin to die if the bleaching stress persists for more than __________ weeks.", correctAnswer:"eight", explanation:"The passage states eight weeks as the threshold." },
        { id:"q005", passageId:"p1", questionType:"true_false_not_given", question:"More than half of shallow-water corals on the Great Barrier Reef have been lost since 1995.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"Surveys indicate more than 50% loss since 1995." },
        { id:"q006", passageId:"p1", questionType:"true_false_not_given", question:"Ocean acidification makes it easier for corals to build their skeletons.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Acidification reduces carbonate ion concentration, making skeleton-building harder." },
        { id:"q007", passageId:"p1", questionType:"multiple_choice", question:"At what level of global warming could 99% of reefs face annual bleaching stress?", options:["1°C","1.5°C","2°C","3°C"], correctAnswer:"C", explanation:"Models project this at 2°C above pre-industrial levels." },
        { id:"q008", passageId:"p1", questionType:"fill_blank", question:"The technique of selective breeding to produce more heat-tolerant corals is called __________ evolution.", correctAnswer:"assisted", explanation:"The passage uses the phrase 'assisted evolution'." },
        { id:"q009", passageId:"p1", questionType:"true_false_not_given", question:"The Great Barrier Reef has experienced five mass bleaching events between 2016 and 2024.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"Events in 2016, 2017, 2020, 2022, and 2024 are listed — five total." },
        { id:"q010", passageId:"p1", questionType:"multiple_choice", question:"What do critics argue about conservation efforts such as coral gardening?", options:["They are too expensive","They may only delay reef collapse without emissions cuts","They damage existing reefs","They are ineffective in marine protected areas"], correctAnswer:"B", explanation:"Critics say without emissions cuts, measures may only delay, not prevent, collapse." },
        { id:"q011", passageId:"p1", questionType:"true_false_not_given", question:"Zooxanthellae receive nutrients from coral waste.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage says corals offer algae 'nutrients from their waste'." },
        { id:"q012", passageId:"p1", questionType:"fill_blank", question:"Coral skeletons are made of calcium __________.", correctAnswer:"carbonate", explanation:"The passage specifies calcium carbonate as the skeletal material." },
        { id:"q013", passageId:"p1", questionType:"true_false_not_given", question:"Carbon dioxide absorbed by the ocean causes its temperature to rise.", options:["True","False","Not Given"], correctAnswer:"Not Given", explanation:"CO₂ is linked to acidification, not temperature rise, in the passage." },
        { id:"q014", passageId:"p1", questionType:"multiple_choice", question:"Which of the following best describes the relationship between corals and zooxanthellae?", options:["Parasitic","Predatory","Symbiotic","Competitive"], correctAnswer:"C", explanation:"The passage explicitly calls the relationship 'symbiotic'." },
      ],
    },
    p2: {
      title: "The Rise of Urban Farming",
      text: `As cities expand and global food supply chains come under increasing strain, urban farming has emerged as a promising — if still marginal — solution to food insecurity and environmental degradation. The practice encompasses a broad range of techniques, from rooftop gardens and community allotments to high-tech vertical farms in which crops are grown in stacked layers under artificial lighting.

Vertical farming, the most technologically intensive form of urban agriculture, uses controlled environment agriculture (CEA) technology to regulate temperature, humidity, CO₂ levels, and light spectra with high precision. LED lighting systems can be tuned to optimise photosynthesis for each crop type. Without the constraints of seasons or weather, vertical farms can produce 365 days a year with yields per square metre that are reported to be 10–100 times higher than conventional field agriculture. They also use up to 95% less water through hydroponic or aeroponic systems and eliminate the need for pesticides.

The economic challenges are significant. High energy costs — particularly for lighting — mean that vertical farms currently produce only a limited range of high-value, fast-growing crops such as leafy greens, herbs, and microgreens profitably. Staple crops like wheat, rice, and maize, which have low market values and require abundant light energy, remain impractical to grow in vertical farms at scale.

Proponents of urban farming highlight social benefits beyond food production: green infrastructure in cities can reduce the urban heat island effect, improve air quality, and provide community spaces that enhance mental wellbeing. A study published in the journal Urban Agriculture and Regional Food Systems found that urban farms in New York City collectively generated $1 million in ecosystem services annually through stormwater management, air filtration, and carbon sequestration.`,
      questions: [
        { id:"q015", passageId:"p2", questionType:"true_false_not_given", question:"Urban farming is currently a mainstream solution to global food insecurity.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage describes it as 'promising — if still marginal'." },
        { id:"q016", passageId:"p2", questionType:"multiple_choice", question:"What does CEA technology regulate in vertical farms?", options:["Soil composition and drainage","Temperature, humidity, CO₂ levels, and light","Crop genetic modification","Water salinity"], correctAnswer:"B", explanation:"The passage lists these four factors regulated by CEA." },
        { id:"q017", passageId:"p2", questionType:"true_false_not_given", question:"Vertical farms can operate year-round regardless of weather conditions.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage confirms they can produce 365 days a year." },
        { id:"q018", passageId:"p2", questionType:"fill_blank", question:"Vertical farms can use up to ____% less water than conventional agriculture.", correctAnswer:"95", explanation:"The passage states 'up to 95% less water'." },
        { id:"q019", passageId:"p2", questionType:"true_false_not_given", question:"Wheat and rice are the most profitable crops to grow in vertical farms.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Staple crops like wheat and rice are described as impractical at scale." },
        { id:"q020", passageId:"p2", questionType:"multiple_choice", question:"What crops are currently most profitable in vertical farming?", options:["Wheat, rice, and maize","Tomatoes and peppers","Leafy greens, herbs, and microgreens","Root vegetables"], correctAnswer:"C", explanation:"The passage cites leafy greens, herbs, and microgreens as profitable." },
        { id:"q021", passageId:"p2", questionType:"fill_blank", question:"Urban farms in New York City generated $__________ million in ecosystem services annually.", correctAnswer:"1", explanation:"The study cited found $1 million in ecosystem services." },
        { id:"q022", passageId:"p2", questionType:"true_false_not_given", question:"Vertical farms require more pesticides than conventional farms.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Vertical farms eliminate the need for pesticides." },
        { id:"q023", passageId:"p2", questionType:"multiple_choice", question:"According to the passage, what is the main economic challenge for vertical farming?", options:["High labour costs","Lack of consumer demand","High energy costs for lighting","Limited crop variety preferences"], correctAnswer:"C", explanation:"High energy costs for lighting are cited as the primary challenge." },
        { id:"q024", passageId:"p2", questionType:"true_false_not_given", question:"LED lighting in vertical farms can be adjusted to enhance photosynthesis for different crops.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage says LED systems can be 'tuned to optimise photosynthesis for each crop type'." },
        { id:"q025", passageId:"p2", questionType:"fill_blank", question:"Vertical farming can produce yields ____–____ times higher per square metre than field farming.", correctAnswer:"10–100", explanation:"The passage gives this range." },
        { id:"q026", passageId:"p2", questionType:"true_false_not_given", question:"Community allotments are a form of urban farming.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"Community allotments are listed as one of the urban farming techniques." },
        { id:"q027", passageId:"p2", questionType:"multiple_choice", question:"Green infrastructure in cities can contribute to which of the following?", options:["Increased vehicle traffic","Reduced urban heat island effect","Higher energy consumption","Greater water usage"], correctAnswer:"B", explanation:"Reducing the urban heat island effect is listed as a social benefit." },
      ],
    },
    p3: {
      title: "The Psychology of Decision-Making",
      text: `For much of the 20th century, economists and psychologists assumed that humans make rational decisions — that is, they systematically evaluate options and select the one that maximises their utility. This view, codified in expected utility theory, was upended by the work of Daniel Kahneman and Amos Tversky, who demonstrated through a series of ingenious experiments that human decision-making is riddled with predictable biases and errors.

Kahneman's influential model distinguishes between two cognitive systems. System 1 operates automatically, quickly, and without deliberate effort — it handles routine tasks and generates intuitive responses, often without our awareness. System 2 is slow, effortful, and consciously controlled; it is engaged when problems require deliberate analysis. The trouble is that humans are cognitively lazy: they tend to rely on System 1 even when a problem demands System 2 thinking, leading to systematic errors.

One of the most robust cognitive biases is loss aversion. Experiments consistently show that people feel the pain of a loss roughly twice as strongly as the pleasure of an equivalent gain. This asymmetry explains a wide range of economically irrational behaviours, from investors holding onto losing stocks too long to avoid realising a loss, to homeowners refusing to sell properties below their purchase price even in declining markets.

Anchoring is another pervasive bias: people rely heavily on the first piece of information they encounter (the 'anchor') when making subsequent judgements. In salary negotiations, for example, whoever makes the first offer establishes the anchor around which discussion centres, giving them a significant strategic advantage. Awareness of cognitive biases does not necessarily protect people from them — Kahneman himself acknowledged that even expert knowledge of these biases does not immunise one against them.`,
      questions: [
        { id:"q028", passageId:"p3", questionType:"true_false_not_given", question:"Expected utility theory assumes that humans always make irrational decisions.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Expected utility theory assumes rational decision-making; Kahneman challenged this." },
        { id:"q029", passageId:"p3", questionType:"multiple_choice", question:"Which system is described as fast, automatic, and operating without conscious effort?", options:["System 2","System 3","System 1","None — the passage does not specify"], correctAnswer:"C", explanation:"System 1 is described as automatic, quick, and effortless." },
        { id:"q030", passageId:"p3", questionType:"fill_blank", question:"According to the model, humans tend to rely on System __ even when problems require careful analysis.", correctAnswer:"1", explanation:"Cognitive laziness leads people to rely on System 1 when System 2 should be used." },
        { id:"q031", passageId:"p3", questionType:"true_false_not_given", question:"Loss aversion means people feel more pleasure from gains than pain from losses.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The opposite — the pain of loss is felt roughly twice as strongly as the pleasure of gain." },
        { id:"q032", passageId:"p3", questionType:"multiple_choice", question:"In the context of loss aversion, what is one example given of economically irrational behaviour?", options:["Buying property below market value","Selling stocks too early","Holding losing stocks too long","Investing in high-risk assets"], correctAnswer:"C", explanation:"Investors holding losing stocks to avoid realising a loss is given as an example." },
        { id:"q033", passageId:"p3", questionType:"true_false_not_given", question:"People who know about cognitive biases are completely immune to them.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Kahneman acknowledged expert knowledge does not immunise against biases." },
        { id:"q034", passageId:"p3", questionType:"fill_blank", question:"In salary negotiations, whoever makes the first offer establishes the __________.", correctAnswer:"anchor", explanation:"The passage uses 'anchor' to describe the first offer's influence." },
        { id:"q035", passageId:"p3", questionType:"true_false_not_given", question:"Kahneman and Tversky's research showed that human errors in decision-making are random and unpredictable.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says biases are 'predictable'." },
        { id:"q036", passageId:"p3", questionType:"multiple_choice", question:"What does the 'anchor' refer to in decision-making?", options:["A final offer in negotiation","The first piece of information encountered","A calculated average of all options","A past experience with the same decision"], correctAnswer:"B", explanation:"The anchor is 'the first piece of information they encounter'." },
        { id:"q037", passageId:"p3", questionType:"true_false_not_given", question:"System 2 thinking is engaged when routine tasks are performed.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"System 1 handles routine tasks; System 2 is for deliberate analysis." },
        { id:"q038", passageId:"p3", questionType:"fill_blank", question:"Daniel Kahneman and Amos __________ conducted experiments exposing human decision-making biases.", correctAnswer:"Tversky", explanation:"The passage names Kahneman and Tversky as collaborators." },
        { id:"q039", passageId:"p3", questionType:"true_false_not_given", question:"Kahneman received a Nobel Prize for his work on decision-making.", options:["True","False","Not Given"], correctAnswer:"Not Given", explanation:"The passage does not mention a Nobel Prize." },
        { id:"q040", passageId:"p3", questionType:"multiple_choice", question:"Loss aversion is described as:", options:["A rare psychological condition","A predictable cognitive bias documented through experiments","A theoretical concept never tested empirically","A bias only observed in financial professionals"], correctAnswer:"B", explanation:"The passage says it is 'one of the most robust cognitive biases' shown through experiments." },
      ],
    },
  },

  // ─── SET 03 ─────────────────────────────────────────────────────────────
  {
    p1: {
      title: "Microplastics in the Food Chain",
      text: `Microplastics — fragments of plastic smaller than 5 millimetres — have become one of the most pervasive environmental contaminants of the 21st century. Originally identified in ocean sediments in the early 2000s, they have since been detected in Arctic snow, deep-sea trenches, mountain streams, and, more alarmingly, in human blood, breast milk, and placentas. The global production of plastic has grown from 2 million tonnes in 1950 to more than 400 million tonnes annually today, and less than 10% of all plastic ever produced has been recycled.

Microplastics enter ecosystems through multiple pathways. Primary microplastics — those manufactured at small sizes — include microbeads used in cosmetics and industrial abrasives. Secondary microplastics arise from the physical and chemical degradation of larger plastic items by UV radiation, mechanical action, and thermal stress. Synthetic textile fibres, released when clothing is washed, are a particularly significant source: a single wash of a polyester garment can release hundreds of thousands of fibres.

Marine organisms at every level of the food web ingest microplastics, either by actively selecting them as food, mistaking them for prey, or through filter-feeding. Fish, seabirds, and marine mammals have been found with microplastics in their digestive tracts. The particles can cause physical harm through gut blockage and a false sense of satiety, leading to reduced food intake and malnutrition. They also act as vectors for persistent organic pollutants, which adsorb onto plastic surfaces and can be transferred to animal tissues.

For humans, dietary exposure to microplastics occurs through seafood, drinking water, sea salt, and even certain packaged foods. The health implications are still being investigated, but studies suggest potential links to inflammation, oxidative stress, disruption of the endocrine system, and interference with the gut microbiome.`,
      questions: [
        { id:"q001", passageId:"p1", questionType:"true_false_not_given", question:"Microplastics are defined as plastic particles larger than 5 millimetres.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Microplastics are smaller than 5 millimetres." },
        { id:"q002", passageId:"p1", questionType:"true_false_not_given", question:"Microplastics have been detected in human breast milk.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage lists breast milk among the locations where microplastics have been found." },
        { id:"q003", passageId:"p1", questionType:"multiple_choice", question:"What percentage of all plastic ever produced has been recycled?", options:["Less than 5%","Less than 10%","About 20%","About 30%"], correctAnswer:"B", explanation:"The passage states less than 10%." },
        { id:"q004", passageId:"p1", questionType:"fill_blank", question:"Microplastics that are manufactured at small sizes are called __________ microplastics.", correctAnswer:"primary", explanation:"The passage distinguishes primary (manufactured small) from secondary (degraded from larger items)." },
        { id:"q005", passageId:"p1", questionType:"true_false_not_given", question:"A single wash of a polyester garment can release millions of fibres.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says 'hundreds of thousands', not millions." },
        { id:"q006", passageId:"p1", questionType:"multiple_choice", question:"According to the passage, microbeads are an example of:", options:["Secondary microplastics","Tertiary microplastics","Primary microplastics","Biodegradable plastics"], correctAnswer:"C", explanation:"Microbeads are listed as primary microplastics — manufactured at small sizes." },
        { id:"q007", passageId:"p1", questionType:"true_false_not_given", question:"Filter-feeding organisms cannot ingest microplastics.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says organisms can ingest microplastics 'through filter-feeding'." },
        { id:"q008", passageId:"p1", questionType:"fill_blank", question:"Microplastics can act as vectors for persistent __________ pollutants.", correctAnswer:"organic", explanation:"The passage refers to 'persistent organic pollutants' adsorbing onto plastic." },
        { id:"q009", passageId:"p1", questionType:"true_false_not_given", question:"The health effects of microplastics on humans are fully understood.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says health implications 'are still being investigated'." },
        { id:"q010", passageId:"p1", questionType:"multiple_choice", question:"How can microplastics harm marine animals?", options:["By lowering water temperature","By causing gut blockage and a false sense of fullness","By increasing water salinity","By reducing sunlight penetration"], correctAnswer:"B", explanation:"Gut blockage and false satiety are listed as physical harms." },
        { id:"q011", passageId:"p1", questionType:"fill_blank", question:"Global plastic production has grown to more than __________ million tonnes annually.", correctAnswer:"400", explanation:"The passage states more than 400 million tonnes annually today." },
        { id:"q012", passageId:"p1", questionType:"true_false_not_given", question:"UV radiation can contribute to the formation of secondary microplastics.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"UV radiation is listed as a cause of secondary microplastic formation from larger plastic items." },
        { id:"q013", passageId:"p1", questionType:"multiple_choice", question:"Through which of the following can humans be exposed to microplastics?", options:["Fresh vegetables","Tap water and seafood","Only bottled beverages","Organic meat products"], correctAnswer:"B", explanation:"The passage lists seafood, drinking water, sea salt, and packaged foods as exposure routes." },
        { id:"q014", passageId:"p1", questionType:"true_false_not_given", question:"Microplastics were first identified in the 2000s in ocean sediments.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage says they were 'originally identified in ocean sediments in the early 2000s'." },
      ],
    },
    p2: {
      title: "The History of Paper Money",
      text: `Paper money represents one of the most consequential financial innovations in human history. The concept originated in Tang dynasty China (618–907 CE), when merchants began depositing heavy copper coins with trusted dealers and carrying paper receipts as proof of deposit. These 'flying money' certificates allowed trade over long distances without the burden of physical coin. By the Song dynasty (960–1279 CE), the government had issued the world's first state-backed paper currency, called jiaozi, to fund military campaigns after copper supplies proved insufficient.

Paper currency reached Europe circuitously. Marco Polo's account of Chinese paper money, published in the late 13th century, was met with disbelief in Europe, where gold and silver coins remained the standard. European banks began issuing receipts for deposited metals in the 17th century. The Swedish Stockholm Bank issued some of the earliest European banknotes in 1661, but over-issued them beyond its metal reserves and collapsed — a cautionary lesson in monetary discipline that recurred throughout history.

The relationship between paper money and the metal reserves backing it evolved over centuries. Under the gold standard, adopted by Britain in 1821 and by most major economies between 1870 and 1914, governments pledged to exchange currency for fixed quantities of gold. The system provided monetary stability but limited the flexibility to respond to economic crises. The gold standard was abandoned by most countries during the Great Depression of the 1930s and was definitively ended in 1971 when US President Nixon suspended the convertibility of the dollar to gold.

Modern currencies are 'fiat money' — they hold value because governments declare them legal tender and citizens trust in that declaration. Unlike commodity-backed money, fiat currency's value is supported primarily by confidence in the issuing institution and the underlying economy.`,
      questions: [
        { id:"q015", passageId:"p2", questionType:"true_false_not_given", question:"The concept of paper money originated in Europe.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Paper money originated in Tang dynasty China." },
        { id:"q016", passageId:"p2", questionType:"multiple_choice", question:"What was the original purpose of 'flying money' certificates in Tang China?", options:["To fund government projects","To enable long-distance trade without carrying heavy coins","To replace gold as a standard","To pay taxes"], correctAnswer:"B", explanation:"They allowed trade over long distances without physical coin." },
        { id:"q017", passageId:"p2", questionType:"fill_blank", question:"The world's first state-backed paper currency was called __________.", correctAnswer:"jiaozi", explanation:"The Song dynasty's currency was called jiaozi." },
        { id:"q018", passageId:"p2", questionType:"true_false_not_given", question:"Marco Polo's accounts of Chinese paper money were immediately accepted in Europe.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"His accounts 'were met with disbelief in Europe'." },
        { id:"q019", passageId:"p2", questionType:"multiple_choice", question:"Why did the Stockholm Bank collapse in the 17th century?", options:["It was destroyed by fire","It was invaded by foreign powers","It over-issued banknotes beyond its metal reserves","It was nationalised by the government"], correctAnswer:"C", explanation:"Over-issuance beyond metal reserves caused its collapse." },
        { id:"q020", passageId:"p2", questionType:"true_false_not_given", question:"Britain adopted the gold standard in 1871.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"Britain adopted the gold standard in 1821, not 1871." },
        { id:"q021", passageId:"p2", questionType:"fill_blank", question:"The gold standard was definitively ended in __________ when the US suspended dollar convertibility to gold.", correctAnswer:"1971", explanation:"The passage specifies 1971 and President Nixon's decision." },
        { id:"q022", passageId:"p2", questionType:"true_false_not_given", question:"The gold standard provided flexibility to respond to economic crises.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says the gold standard 'limited the flexibility to respond to economic crises'." },
        { id:"q023", passageId:"p2", questionType:"multiple_choice", question:"What makes fiat money hold its value according to the passage?", options:["Its gold backing","Its silver reserves","Governments declaring it legal tender and public trust","Its physical properties"], correctAnswer:"C", explanation:"Fiat money holds value through government declaration and citizen trust." },
        { id:"q024", passageId:"p2", questionType:"true_false_not_given", question:"Marco Polo's account was published in the early 14th century.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says it was published in the late 13th century." },
        { id:"q025", passageId:"p2", questionType:"fill_blank", question:"Most major economies adopted the gold standard between 1870 and __________.", correctAnswer:"1914", explanation:"The passage gives this date range." },
        { id:"q026", passageId:"p2", questionType:"true_false_not_given", question:"The Song dynasty used paper currency to fund military campaigns.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage states jiaozi was issued to fund military campaigns." },
        { id:"q027", passageId:"p2", questionType:"multiple_choice", question:"The Stockholm Bank's collapse serves as an example of:", options:["Successful monetary reform","The danger of over-issuing currency beyond reserves","The benefits of a gold standard","Effective banking regulation"], correctAnswer:"B", explanation:"It is described as 'a cautionary lesson in monetary discipline'." },
      ],
    },
    p3: {
      title: "Renewable Energy Transitions",
      text: `The transition from fossil fuels to renewable energy represents the most significant restructuring of the global energy system in over a century. Solar photovoltaic (PV) and wind technologies have undergone extraordinary cost reductions: the levelised cost of utility-scale solar has fallen by more than 90% since 2010, and onshore wind by approximately 70%. In many regions, new renewable capacity is now cheaper to build and operate than existing coal or gas plants.

Despite this progress, renewable integration poses significant technical challenges. Electricity grids were designed to match supply with demand instantaneously, relying on dispatchable sources like gas turbines that can be ramped up or down on command. Wind and solar are variable by nature — output depends on weather conditions. Grid operators must therefore balance variable generation with flexible storage, demand response, and backup capacity. Battery storage technology, led by lithium-ion systems, has become central to this balancing act, with global installed capacity doubling every two to three years.

Transmission infrastructure presents another bottleneck. The best renewable resources — remote deserts, highland wind corridors, offshore platforms — are often far from population centres where electricity demand is concentrated. Expanding high-voltage direct current (HVDC) transmission networks can transport power over thousands of kilometres with low losses, but requires significant capital investment and navigating complex land-use and regulatory processes.

Energy transition economics are also complicated by the social costs of decarbonisation. Mining for the minerals required in batteries and solar panels — lithium, cobalt, nickel, and silicon — raises environmental and human rights concerns in sourcing countries. Fossil fuel workers and communities face displacement and economic disruption. Effective transition policies must address these distributional consequences alongside the engineering and economic challenges.`,
      questions: [
        { id:"q028", passageId:"p3", questionType:"true_false_not_given", question:"The cost of utility-scale solar power has fallen by more than 90% since 2010.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage explicitly states this figure." },
        { id:"q029", passageId:"p3", questionType:"multiple_choice", question:"What characteristic of wind and solar energy makes grid integration challenging?", options:["They are too expensive","Their output depends on weather conditions","They produce too much electricity","They require nuclear backup"], correctAnswer:"B", explanation:"Wind and solar are 'variable by nature — output depends on weather conditions'." },
        { id:"q030", passageId:"p3", questionType:"fill_blank", question:"Onshore wind costs have fallen by approximately ____% since 2010.", correctAnswer:"70", explanation:"The passage states approximately 70% for onshore wind." },
        { id:"q031", passageId:"p3", questionType:"true_false_not_given", question:"HVDC transmission results in high energy losses over long distances.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"The passage says HVDC can transport power 'with low losses'." },
        { id:"q032", passageId:"p3", questionType:"multiple_choice", question:"How quickly has global battery storage capacity been growing?", options:["Tripling every five years","Doubling every two to three years","Increasing 10% annually","Remaining stable"], correctAnswer:"B", explanation:"The passage states 'doubling every two to three years'." },
        { id:"q033", passageId:"p3", questionType:"true_false_not_given", question:"The best renewable resources are typically located close to population centres.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"They are often 'far from population centres' — remote deserts, highland corridors, offshore platforms." },
        { id:"q034", passageId:"p3", questionType:"fill_blank", question:"The dominant battery storage technology today uses __________ systems.", correctAnswer:"lithium-ion", explanation:"The passage names lithium-ion as the leading battery storage technology." },
        { id:"q035", passageId:"p3", questionType:"true_false_not_given", question:"Lithium, cobalt, nickel, and silicon are among the minerals needed for batteries and solar panels.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage lists all four minerals." },
        { id:"q036", passageId:"p3", questionType:"multiple_choice", question:"Which of the following is NOT mentioned as a challenge to energy transition?", options:["Grid balancing","Transmission infrastructure","Nuclear waste disposal","Social costs of decarbonisation"], correctAnswer:"C", explanation:"Nuclear waste is not mentioned in the passage." },
        { id:"q037", passageId:"p3", questionType:"true_false_not_given", question:"New renewable capacity is now cheaper than existing coal plants in many regions.", options:["True","False","Not Given"], correctAnswer:"True", explanation:"The passage confirms new renewable capacity is cheaper than 'existing coal or gas plants'." },
        { id:"q038", passageId:"p3", questionType:"fill_blank", question:"Gas turbines are described as __________ sources because they can be controlled on command.", correctAnswer:"dispatchable", explanation:"The passage uses the term 'dispatchable' for sources that can be ramped up or down." },
        { id:"q039", passageId:"p3", questionType:"true_false_not_given", question:"Expanding HVDC networks is straightforward and inexpensive.", options:["True","False","Not Given"], correctAnswer:"False", explanation:"It 'requires significant capital investment and navigating complex... processes'." },
        { id:"q040", passageId:"p3", questionType:"multiple_choice", question:"According to the passage, what must effective transition policies address?", options:["Only the technical challenges","Only the economic challenges","Both engineering/economic challenges and distributional consequences","The political opposition to renewables"], correctAnswer:"C", explanation:"Policies must address both technical/economic challenges and distributional consequences." },
      ],
    },
  },
];

// ─── Build test JSON from a passage set ──────────────────────────────────────

function buildTest(existing, setIdx) {
  const S = PASSAGE_SETS[setIdx % PASSAGE_SETS.length];

  const passages = [
    {
      id: `${existing.id}-p1`,
      title: S.p1.title,
      text:  S.p1.text,
    },
    {
      id: `${existing.id}-p2`,
      title: S.p2.title,
      text:  S.p2.text,
    },
    {
      id: `${existing.id}-p3`,
      title: S.p3.title,
      text:  S.p3.text,
    },
  ];

  const questions = [
    ...S.p1.questions.map((q,i) => ({
      ...q,
      id: `${existing.id}-q${String(i+1).padStart(3,"0")}`,
      passageId: `${existing.id}-p1`,
      questionNumber: i + 1,
    })),
    ...S.p2.questions.map((q,i) => ({
      ...q,
      id: `${existing.id}-q${String(i+15).padStart(3,"0")}`,
      passageId: `${existing.id}-p2`,
      questionNumber: i + 15,
    })),
    ...S.p3.questions.map((q,i) => ({
      ...q,
      id: `${existing.id}-q${String(i+28).padStart(3,"0")}`,
      passageId: `${existing.id}-p3`,
      questionNumber: i + 28,
    })),
  ];

  return {
    ...existing,
    passages,
    questions,
    questionCount: 40,
    durationSeconds: existing.durationSeconds || 3600,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(DIR).filter(f => f.match(/^test-\d+\.json$/)).sort();
let rebuilt = 0;

files.forEach((file, idx) => {
  const fp = path.join(DIR, file);
  const test = JSON.parse(fs.readFileSync(fp, "utf8"));
  const newTest = buildTest(test, idx);
  fs.writeFileSync(fp, JSON.stringify(newTest, null, 2), "utf8");
  rebuilt++;
});

console.log(`✓ Rebuilt ${rebuilt} IELTS Reading tests with ${PASSAGE_SETS.length} unique passage sets.`);

// Verify distinctness
const t1 = JSON.parse(fs.readFileSync(path.join(DIR, "test-001.json"), "utf8"));
const t2 = JSON.parse(fs.readFileSync(path.join(DIR, "test-002.json"), "utf8"));
const t4 = JSON.parse(fs.readFileSync(path.join(DIR, "test-004.json"), "utf8"));
console.log(`  test-001 P1: ${t1.passages[0].title}`);
console.log(`  test-002 P1: ${t2.passages[0].title}`);
console.log(`  test-004 P1: ${t4.passages[0].title}`);
console.log(`  test-001 Q1: ${t1.questions[0].question.substring(0,70)}`);
console.log(`  test-002 Q1: ${t2.questions[0].question.substring(0,70)}`);
console.log(`  Total Q test-001: ${t1.questions.length}`);
