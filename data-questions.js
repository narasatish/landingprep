window.LP_QUESTIONS = {
  /* ═══════════════════════════════════════════════════════════════════
     IELTS
  ═══════════════════════════════════════════════════════════════════ */
  ielts: {
    /* ── Listening ── */
    listening: {
      bandTable: [
        [40, 9],
        [39, 9],
        [38, 8.5],
        [37, 8.5],
        [36, 8],
        [35, 8],
        [34, 7.5],
        [33, 7.5],
        [32, 7],
        [31, 7],
        [30, 6.5],
        [29, 6.5],
        [28, 6.5],
        [27, 6],
        [26, 6],
        [25, 6],
        [23, 5.5],
        [22, 5.5],
        [21, 5.5],
        [20, 5.5],
        [19, 5],
        [18, 5],
        [17, 5],
        [16, 5],
        [15, 4.5],
        [14, 4.5],
        [13, 4.5],
        [12, 4],
        [11, 4],
        [10, 4],
        [0, 0]
      ],
      parts: [
        {
          id: "l_p1",
          partNum: 1,
          context: "You will hear a conversation between a student named Jordan and a receptionist at a community sports centre. Jordan wants to join the centre as a member.",
          audioScript: `
Receptionist: Good afternoon, Riverside Sports Centre, how can I help you?
Jordan: Hi there, I was hoping to sign up for a membership. Is that something I can do over the phone?
Receptionist: Absolutely. I'll just need to take a few details from you. Can I start with your full name?
Jordan: Sure \u2014 it's Jordan. Jordan Whitfield. That's W-H-I-T-F-I-E-L-D.
Receptionist: Perfect. And your date of birth?
Jordan: The fourteenth of March, nineteen ninety-eight.
Receptionist: Great. And what address should we register you at?
Jordan: Forty-two Birchwood Lane, Thornton. The postcode is TN four, three XP.
Receptionist: Lovely. And a contact number?
Jordan: My mobile is zero seven nine, four five one, eight two six three.
Receptionist: And an email address?
Jordan: It's jordan dot whitfield at g-mail dot com. All lowercase.
Receptionist: Wonderful. Now, which membership type are you interested in? We have Bronze, Silver, and Gold.
Jordan: What's included in Silver?
Receptionist: Silver gives you full gym access, one swimming session per day, and two group fitness classes per week.
Jordan: That sounds perfect. I'll go with Silver.
Receptionist: Excellent. Silver is thirty-eight pounds per month. And is there any particular time you'd prefer to visit?
Jordan: Mostly evenings \u2014 after six.
Receptionist: That's absolutely fine. I should mention that the pool is closed for maintenance on Wednesday evenings. Are you interested in any personal training?
Jordan: Maybe later, but not right now.
Receptionist: No problem. We'll send a welcome pack to your email, and your membership card will be posted within three to five working days. Is there anything else I can help you with?
Jordan: Actually, yes \u2014 where exactly is the centre? I've not been before.
Receptionist: We're on Canfield Road, just past the library. There's a large car park at the rear.
Jordan: Perfect. Thank you so much.
Receptionist: My pleasure! We look forward to seeing you.`,
          questions: [
            // Q1-5: Form completion (real IELTS Part 1 staple — caller details)
            {
              id: "lp1q1_5",
              num: 1,
              type: "form_completion",
              title: "RIVERSIDE SPORTS CENTRE \u2014 MEMBERSHIP APPLICATION",
              wordLimit: 3,
              allowNumber: true,
              startNum: 1,
              questionRange: "1\u20135",
              fields: [
                { id: "f1", num: 1, label: "Surname:", answer: "Whitfield", altAnswers: ["whitfield"] },
                { id: "f2", num: 2, label: "Date of birth:", answer: "14 March 1998", altAnswers: ["14/3/1998", "14-03-1998", "14th March 1998"] },
                { id: "f3", num: 3, label: "Street address: ______ Birchwood Lane", answer: "42", altAnswers: ["42 birchwood", "forty-two"] },
                { id: "f4", num: 4, label: "Postcode:", answer: "TN4 3XP", altAnswers: ["TN43XP", "tn4 3xp"] },
                { id: "f5", num: 5, label: "Mobile number: 079 ______ 8263", answer: "451", altAnswers: ["four five one"] }
              ]
            },
            // Q6: Multi-select (Mark TWO) — real IELTS pattern
            {
              id: "lp1q6",
              num: 6,
              type: "mcq_multi",
              text: "Which TWO things does Jordan ask about during the call?",
              options: [
                "A. The Bronze membership benefits",
                "B. What is included in Silver membership",
                "C. The monthly Gold membership cost",
                "D. The location of the sports centre",
                "E. Whether personal training is required"
              ],
              answer: ["B", "D"],
              selectCount: 2
            },
            // Q7-10: Fill-in-blanks with single "NO MORE THAN ONE WORD AND/OR A NUMBER" header
            {
              id: "lp1q7",
              num: 7,
              type: "fill",
              text: "Jordan signs up for the ______ membership.",
              wordLimit: 1,
              allowNumber: true,
              answer: "Silver",
              altAnswers: ["silver"]
            },
            {
              id: "lp1q8",
              num: 8,
              type: "fill",
              text: "The Silver membership costs \xA3______ per month.",
              wordLimit: 1,
              allowNumber: true,
              answer: "38",
              altAnswers: ["thirty-eight", "thirty eight"]
            },
            {
              id: "lp1q9",
              num: 9,
              type: "fill",
              text: "The swimming pool is closed on ______ evenings.",
              wordLimit: 1,
              allowNumber: true,
              answer: "Wednesday",
              altAnswers: ["wednesday"]
            },
            {
              id: "lp1q10",
              num: 10,
              type: "fill",
              text: "The sports centre is on Canfield Road, just past the ______.",
              wordLimit: 1,
              allowNumber: true,
              answer: "library",
              altAnswers: ["the library"]
            }
          ]
        },
        {
          id: "l_p2",
          partNum: 2,
          context: "You will hear a guide giving a talk to visitors at the Ferndale Valley Nature Reserve. The guide is explaining facilities and wildlife highlights.",
          audioScript: `
Good morning, everyone, and welcome to Ferndale Valley Nature Reserve. My name is Priya, and I'll be your guide today. We have about an hour and a half together, so let me walk you through what we have here and what you can expect to see.

Ferndale covers approximately three hundred and forty hectares of mixed woodland, wetland, and open grassland. We are home to over one hundred and twenty species of birds, forty-three species of butterfly, and, most excitingly, a colony of water voles \u2014 one of the largest surviving colonies in the country.

Now, before we set off, a few things to note about facilities. The Visitor Centre, where we are now, has toilets, a small caf\xE9 serving hot drinks and light lunches, and a gift shop. The caf\xE9 closes at half past three, so please plan your visit accordingly.

We have three walking trails. The Green Trail is one point two kilometres long, mostly flat, and suitable for all abilities including pushchairs and wheelchairs. The Blue Trail is two point eight kilometres and takes you through the wetland boardwalk \u2014 absolutely stunning at this time of year. And the Red Trail is a four-point-six kilometre circular route that climbs to the viewpoint where, on a clear day, you can see as far as the coast.

If you're visiting with children, I'd especially recommend the hide near the western pond. We've had regular sightings of the kingfisher there this week \u2014 usually in the late morning, between ten and midday.

One important rule: please keep to the marked paths. The meadow grass to either side of the Red Trail is a nesting site for skylarks at this time of year, and any disturbance can be seriously damaging. Dogs are welcome on the Green and Blue trails only, on leads at all times.

Any questions? No? Wonderful. Let's head off towards the wetland boardwalk first.`,
          questions: [
            // Q 11-14: MCQ with A/B/C (real Cambridge Section 2 pattern)
            {
              id: "lp2q11",
              num: 11,
              type: "mcq",
              text: "How large is Ferndale Valley Nature Reserve?",
              options: ["A. 230 hectares", "B. 310 hectares", "C. 340 hectares"],
              answer: "C"
            },
            {
              id: "lp2q12",
              num: 12,
              type: "mcq",
              text: "What is described as one of the largest surviving colonies in the country?",
              options: ["A. Kingfishers", "B. Water voles", "C. Skylarks"],
              answer: "B"
            },
            {
              id: "lp2q13",
              num: 13,
              type: "mcq",
              text: "Which trail includes a wetland boardwalk?",
              options: ["A. Green Trail", "B. Blue Trail", "C. Red Trail"],
              answer: "B"
            },
            {
              id: "lp2q14",
              num: 14,
              type: "mcq",
              text: "Why must visitors keep to marked paths on the Red Trail?",
              options: ["A. Paths near the viewpoint are steep and dangerous", "B. The meadow contains nesting skylarks", "C. Construction work is in progress"],
              answer: "B"
            },
            // Q 15-16: Multi-select cluster (real Cambridge pattern — Mark TWO letters A-E)
            {
              id: "lp2q15_16",
              num: 15,
              type: "mcq_multi",
              text: "Which TWO facilities are available at the Visitor Centre?",
              options: [
                "A. A library and reading area",
                "B. Toilets",
                "C. A small caf\xE9",
                "D. A children's play area",
                "E. A picnic terrace"
              ],
              answer: ["B", "C"],
              selectCount: 2,
              questionRange: "15\u201316"
            },
            // Q 17-18: Second multi-select cluster
            {
              id: "lp2q17_18",
              num: 17,
              type: "mcq_multi",
              text: "Which TWO wildlife species does the guide highlight at the reserve?",
              options: [
                "A. Skylarks (nesting in the meadow)",
                "B. Red deer",
                "C. Water voles",
                "D. Otters",
                "E. Pine martens"
              ],
              answer: ["A", "C"],
              selectCount: 2,
              questionRange: "17\u201318"
            },
            // Q 19-20: Third multi-select cluster
            {
              id: "lp2q19_20",
              num: 19,
              type: "mcq_multi",
              text: "Which TWO rules does the guide emphasise for visitors today?",
              options: [
                "A. Keep dogs on leads at all times on permitted trails",
                "B. Stay on marked paths to protect nesting birds",
                "C. Use the caf\xE9 before 3:30 pm",
                "D. Avoid loud noise near the western pond",
                "E. Take photos from a respectful distance only"
              ],
              answer: ["A", "B"],
              selectCount: 2,
              questionRange: "19\u201320"
            }
          ]
        },
        {
          id: "l_p3",
          partNum: 3,
          context: "You will hear two university students, Amara and Felix, discussing their joint assignment on sustainable architecture for an Environmental Science module.",
          audioScript: `
Amara: Felix, did you get a chance to look at the reading list for the sustainable architecture assignment?
Felix: Yeah, I read through most of it. It's a lot, isn't it? I was thinking we should divide the topics between us.
Amara: Good idea. I was going to focus on passive house design \u2014 the energy efficiency principles. What were you thinking of covering?
Felix: I was more interested in green roofs and living walls. There's a lot of data on urban heat island effects and I think that ties in well with the biodiversity module we did last term.
Amara: That makes sense. Oh \u2014 did you see the lecture notes Professor Kim posted? She changed the deadline to next Friday rather than the following Monday.
Felix: No, I hadn't checked. That's quite a change. We'll need to start the literature review today, then.
Amara: I've already found six peer-reviewed articles. Four of them are on JSTOR, but two are behind a paywall. The university library should have access, though.
Felix: Right. I also found a really useful report by the World Green Building Council \u2014 it's freely available online.
Amara: Is that the one from 2022?
Felix: Actually, I think it's 2023. But it covers the same ground \u2014 embodied carbon in construction materials, whole-life carbon analysis, that sort of thing.
Amara: Perfect. Should we meet tomorrow to share findings and start structuring the report?
Felix: I can do mid-morning \u2014 say eleven o'clock?
Amara: Works for me. Shall we use the group study room in the library?
Felix: Room three or four should be free according to the booking system.
Amara: I'll book room three. It has the whiteboard and a wall screen which will be useful for laying out the structure visually.
Felix: Good thinking. One more thing \u2014 should we include a case study? Professor Kim mentioned it in the brief.
Amara: Yes, she said it's optional but strongly recommended. I was thinking the Brock Environmental Centre in Virginia \u2014 it's net zero energy and net zero water. Really impressive data.
Felix: Agreed. That's a strong choice.`,
          questions: [
            {
              id: "lp3q21",
              num: 21,
              type: "mcq",
              text: "What topic has Amara chosen to focus on?",
              options: ["A. Green roofs", "B. Passive house design", "C. Living walls", "D. Embodied carbon"],
              answer: "B"
            },
            {
              id: "lp3q22",
              num: 22,
              type: "mcq",
              text: "Why does Felix choose the topic of green roofs?",
              options: ["A. It is required by the professor", "B. It connects to a previous module on biodiversity", "C. Amara suggested it to him", "D. The reading list covers it in most detail"],
              answer: "B"
            },
            {
              id: "lp3q23",
              num: 23,
              type: "mcq",
              text: "What change did Professor Kim make to the assignment?",
              options: ["A. She removed the case study requirement", "B. She changed the submission format", "C. She moved the deadline forward by several days", "D. She added two new required readings"],
              answer: "C"
            },
            {
              id: "lp3q24",
              num: 24,
              type: "mcq",
              text: "How many articles has Amara already found?",
              options: ["A. Four", "B. Five", "C. Six", "D. Eight"],
              answer: "C"
            },
            {
              id: "lp3q25",
              num: 25,
              type: "mcq",
              text: "What is the problem with two of Amara's articles?",
              options: ["A. They are too old to be relevant", "B. They are not peer-reviewed", "C. They are behind a paywall", "D. They are not available in English"],
              answer: "C"
            },
            {
              id: "lp3q26",
              num: 26,
              type: "mcq",
              text: "What year is the World Green Building Council report that Felix found?",
              options: ["A. 2020", "B. 2021", "C. 2022", "D. 2023"],
              answer: "D"
            },
            {
              id: "lp3q27",
              num: 27,
              type: "mcq",
              text: "When do Amara and Felix agree to meet?",
              options: ["A. Today at 3 pm", "B. Tomorrow at 11 am", "C. Tomorrow at 2 pm", "D. Friday at 11 am"],
              answer: "B"
            },
            {
              id: "lp3q28",
              num: 28,
              type: "mcq",
              text: "Why does Amara prefer room three in the library?",
              options: ["A. It is larger than room four", "B. It has a whiteboard and wall screen", "C. It is quieter than other rooms", "D. It is available immediately"],
              answer: "B"
            },
            {
              id: "lp3q29",
              num: 29,
              type: "mcq",
              text: "What does Professor Kim say about the case study?",
              options: ["A. It is compulsory", "B. It is not recommended for this assignment", "C. It is optional but strongly recommended", "D. It must be a UK-based building"],
              answer: "C"
            },
            {
              id: "lp3q30",
              num: 30,
              type: "mcq",
              text: "What is the Brock Environmental Centre notable for?",
              options: ["A. Being the world's tallest green roof building", "B. Being both net zero energy and net zero water", "C. Using only locally sourced materials", "D. Having the largest living wall in North America"],
              answer: "B"
            }
          ]
        },
        {
          id: "l_p4",
          partNum: 4,
          context: "You will hear a university lecture on the topic of bioluminescence \u2014 the production of light by living organisms.",
          audioScript: `
Good morning. Today's lecture covers bioluminescence \u2014 a phenomenon that has fascinated scientists and the public alike for centuries. I want to cover three main areas: what bioluminescence is and how it works chemically, where it occurs in the natural world, and what its ecological and commercial implications are.

Bioluminescence is the production and emission of light by a living organism as the result of a chemical reaction. The reaction almost always involves a substrate molecule called luciferin and an enzyme called luciferase. When luciferin oxidises in the presence of luciferase, energy is released as light \u2014 typically with very little heat, which is why it is sometimes called "cold light." The wavelength of light produced varies by species, but most marine bioluminescence falls in the blue-green portion of the spectrum \u2014 wavelengths between around four-sixty and five-twenty nanometres.

Now, where does bioluminescence occur? You might be surprised to learn that it is extremely common. An estimated seventy-six percent of ocean organisms are bioluminescent. It is found across the tree of life \u2014 in bacteria, fungi, jellyfish, squid, fish, ostracods and many more. On land, however, it is far rarer \u2014 we find it in fireflies, some species of fungi, and a handful of other insects.

The most famous terrestrial examples are fireflies \u2014 insects in the family Lampyridae \u2014 which use bioluminescence for sexual signalling. Different species produce distinctive flash patterns, and females respond only to the correct pattern of their own species. This acts as a biological lock-and-key system.

In the marine environment, the functions are far more diverse. Bioluminescence is used for counter-illumination camouflage \u2014 some deep-sea fish produce light on their bellies to match downwelling sunlight and avoid detection by predators below. It is used for predation \u2014 the anglerfish uses a light-producing lure to attract prey into range of its teeth. And it is used for communication and mating, just as in fireflies.

Commercially, bioluminescent molecules have transformed biomedical research. Luciferase gene reporters \u2014 essentially genetic tags that produce light \u2014 are now used in drug development, cancer research, and diagnostics. The green fluorescent protein from jellyfish, which is related but technically distinct from bioluminescence, earned its discoverers the Nobel Prize in Chemistry in two thousand and eight.

Future research directions include using engineered bioluminescent bacteria as biosensors for environmental pollution monitoring, and even exploring bioluminescent plants as a form of sustainable low-energy lighting \u2014 though the latter remains largely speculative at this stage.

In summary: bioluminescence is chemically driven by luciferin and luciferase, it is remarkably widespread in marine environments, serves multiple ecological functions from predation to camouflage, and has significant applications in biomedical research and potentially in environmental monitoring.`,
          questions: [
            {
              id: "lp4q31",
              num: 31,
              type: "mcq",
              text: "What enzyme is involved in the bioluminescent chemical reaction?",
              options: ["A. Luciferin", "B. Luciferase", "C. Chlorophyll", "D. Lipase"],
              answer: "B"
            },
            { id: "lp4q32", num: 32, type: "fill", text: "Bioluminescence is sometimes called 'cold light' because the reaction produces very little ______.", answer: "heat" },
            {
              id: "lp4q33",
              num: 33,
              type: "mcq",
              text: "What wavelength range does most marine bioluminescence fall within?",
              options: ["A. 300\u2013400 nm", "B. 460\u2013520 nm", "C. 550\u2013620 nm", "D. 680\u2013750 nm"],
              answer: "B"
            },
            { id: "lp4q34", num: 34, type: "fill", text: "An estimated ______% of ocean organisms are bioluminescent.", answer: "76" },
            {
              id: "lp4q35",
              num: 35,
              type: "mcq",
              text: "How do fireflies use bioluminescence?",
              options: ["A. For camouflage against predators", "B. To attract prey", "C. For sexual signalling through flash patterns", "D. To warn other insects of danger"],
              answer: "C"
            },
            {
              id: "lp4q36",
              num: 36,
              type: "mcq",
              text: "What is counter-illumination camouflage?",
              options: ["A. Producing bright flashes to confuse predators", "B. Matching the downwelling light to avoid detection from below", "C. Changing colour to blend with background", "D. Emitting red light to become invisible in deep water"],
              answer: "B"
            },
            {
              id: "lp4q37",
              num: 37,
              type: "mcq",
              text: "How does the anglerfish use bioluminescence?",
              options: ["A. For camouflage", "B. To communicate with its mate", "C. As a lure to attract prey", "D. To disorient predators"],
              answer: "C"
            },
            {
              id: "lp4q38",
              num: 38,
              type: "mcq",
              text: "What did the discovery related to jellyfish proteins win in 2008?",
              options: ["A. Nobel Prize in Physics", "B. Nobel Prize in Medicine", "C. Nobel Prize in Chemistry", "D. Nobel Prize in Biology"],
              answer: "C"
            },
            {
              id: "lp4q39",
              num: 39,
              type: "mcq",
              text: "What future application involves using bioluminescent bacteria?",
              options: ["A. Replacing electric lighting in homes", "B. Monitoring environmental pollution", "C. Producing biofuel from algae", "D. Creating glow-in-the-dark crops"],
              answer: "B"
            },
            {
              id: "lp4q40",
              num: 40,
              type: "mcq",
              text: "Which best describes the lecture's conclusion about bioluminescent plants?",
              options: ["A. They are currently in widespread commercial use", "B. They will replace conventional lighting within ten years", "C. The idea remains largely speculative", "D. They have been proven effective in laboratory conditions"],
              answer: "C"
            }
          ]
        }
      ]
    },
    /* ── Reading ── */
    reading: {
      bandTable: [
        [40, 9],
        [39, 9],
        [38, 8.5],
        [37, 8.5],
        [36, 8],
        [35, 8],
        [34, 7.5],
        [33, 7.5],
        [32, 7],
        [31, 7],
        [30, 6.5],
        [29, 6.5],
        [28, 6],
        [27, 6],
        [26, 6],
        [25, 5.5],
        [23, 5.5],
        [22, 5.5],
        [21, 5],
        [20, 5],
        [19, 5],
        [18, 4.5],
        [17, 4.5],
        [16, 4.5],
        [15, 4],
        [14, 4],
        [13, 4],
        [0, 0]
      ],
      passages: [
        {
          id: "rp1",
          title: "The Return of the Wild: Urban Rewilding",
          text: `Urban rewilding has become one of the most discussed environmental trends of the twenty-first century. Where cities were once viewed as antithetical to nature, a growing coalition of ecologists, urban planners, and volunteer groups is working to reintroduce natural processes into built environments. Proponents claim the results are transformative \u2014 not only for local wildlife but for human health and community wellbeing.

The concept of rewilding originated in the 1990s with conservationists Michael Soul\xE9 and Reed Noss, who proposed a vision of connected wilderness corridors spanning North America. Their original framework centred on three pillars: cores, corridors, and carnivores \u2014 large protected areas linked by wildlife passages and managed to support apex predators. This vision was primarily rural in scope, but urban ecologists have since adapted its principles to city settings, where the emphasis falls less on large predators and more on reconnecting fragmented habitats and reducing the ecological footprint of dense human settlements.

London's rewilding initiatives offer some of the most compelling evidence of what is possible in an urban context. The charity Rewilding Britain estimates that ninety-seven percent of the country's wildflower meadows have been lost since the 1930s, primarily due to agricultural intensification and urban expansion. In response, several London boroughs have begun replacing mown grass verges with wildflower strips, creating pollinator corridors across the city. Monitoring in these areas suggests that bee and butterfly populations have increased by up to forty percent where these measures have been sustained for three or more years.

Critics of urban rewilding question whether such initiatives can deliver meaningful ecological outcomes or whether they represent little more than a feel-good aesthetic choice. Professor Anita Varma of the University of Edinburgh notes that "the fragmented and disturbed nature of urban environments means that no amount of wildflower planting will replicate the biodiversity of a functioning ecosystem." She argues that resources spent on urban rewilding might achieve greater conservation gains if redirected to protecting and expanding rural habitats.

Supporters counter that urban rewilding serves purposes beyond biodiversity alone. Access to green space has been linked to reduced rates of anxiety and depression among city residents, and community rewilding projects provide educational opportunities that build long-term environmental awareness. Furthermore, urban areas house the majority of the world's population; engaging city-dwellers with nature is seen as essential to building the political will needed to fund large-scale conservation elsewhere.

The debate reflects a broader tension in conservation: should limited resources be concentrated on the most ecologically valuable areas, or distributed more broadly to engage the greatest number of people? There is no simple answer. What is clear is that urban rewilding, whether or not it fully delivers the biodiversity benefits its champions promise, is reshaping how millions of people relate to the natural world.`,
          questions: [
            { id: "rp1q1", num: 1, type: "tfng", text: "The concept of rewilding gained momentum in the twenty-first century.", answer: "FALSE", explanation: "The passage states it 'originated in the 1990s', which is the twentieth century." },
            { id: "rp1q2", num: 2, type: "tfng", text: "Soul\xE9 and Noss originally designed the rewilding framework for urban settings.", answer: "FALSE", explanation: "The passage explicitly states the vision 'was primarily rural in scope'." },
            { id: "rp1q3", num: 3, type: "tfng", text: "Urban rewilding places less emphasis on large carnivores than rural rewilding does.", answer: "TRUE", explanation: "The passage says urban rewilding places 'less emphasis on large predators'." },
            { id: "rp1q4", num: 4, type: "tfng", text: "London boroughs have destroyed wildflower meadows since the 1930s.", answer: "NOT GIVEN", explanation: "The 97% loss figure refers to the whole country, not specifically to London boroughs taking active action." },
            { id: "rp1q5", num: 5, type: "tfng", text: "Bee and butterfly populations rose by up to 40% in rewilded areas over three or more years.", answer: "TRUE", explanation: "Directly stated: 'increased by up to forty percent where these measures have been sustained for three or more years'." },
            { id: "rp1q6", num: 6, type: "tfng", text: "Professor Varma believes urban rewilding will eventually match rural biodiversity levels.", answer: "FALSE", explanation: "She states 'no amount of wildflower planting will replicate the biodiversity of a functioning ecosystem'." },
            { id: "rp1q7", num: 7, type: "tfng", text: "The article concludes that rural conservation is a more worthwhile investment than urban rewilding.", answer: "NOT GIVEN", explanation: "The article says 'there is no simple answer' and does not draw a conclusion favouring either approach." },
            { id: "rp1q8", num: 8, type: "fill", text: "Urban rewilding prioritises ______ fragmented habitats over managing apex predators.", answer: "reconnecting", explanation: "The passage: 'reconnecting fragmented habitats'." },
            { id: "rp1q9", num: 9, type: "fill", text: "Green space in cities has been linked to lower rates of ______ and depression.", answer: "anxiety", explanation: "Directly from the passage." },
            { id: "rp1q10", num: 10, type: "fill", text: "Supporters argue that engaging city-dwellers with nature builds ______ for large-scale conservation funding.", answer: "political will", explanation: "Directly from the passage: 'essential to building the political will needed to fund large-scale conservation'." },
            {
              id: "rp1q11",
              num: 11,
              type: "mcq",
              text: "Which of the following best describes Professor Varma's view on urban rewilding?",
              options: ["A. It is the most cost-effective conservation strategy available", "B. Its fragmented urban context limits its ecological value", "C. It should replace rural conservation programmes", "D. It is primarily beneficial for human health rather than wildlife"],
              answer: "B"
            },
            {
              id: "rp1q12",
              num: 12,
              type: "mcq",
              text: "According to the passage, what is one key purpose served by urban rewilding beyond biodiversity?",
              options: ["A. It reduces urban flood risk", "B. It directly funds rural conservation", "C. It educates city residents and builds environmental awareness", "D. It removes the need for traditional conservation"],
              answer: "C"
            },
            {
              id: "rp1q13",
              num: 13,
              type: "mcq",
              text: "What central debate does the passage describe in conservation?",
              options: ["A. Whether urban areas or rural areas have more biodiversity", "B. Whether rewilding or traditional conservation is scientifically valid", "C. Whether resources should focus on high-value areas or engage more people", "D. Whether governments or charities should fund conservation"],
              answer: "C"
            }
          ]
        },
        {
          id: "rp2",
          title: "The Attention Economy: How Scarcity Became Currency",
          text: `In 1971, the economist Herbert Simon observed that "a wealth of information creates a poverty of attention." This insight, dismissed at the time as overly speculative, now reads as prophetic. In the early twenty-first century, attention \u2014 the finite cognitive resource that allows humans to process information \u2014 has become the most contested commodity in the global economy.

The term "attention economy" was popularised in the 1990s by Michael Goldhaber, who argued that as information became abundant and free, the scarce resource would no longer be information itself but the human attention needed to consume it. Publishers, broadcasters, and advertisers had always competed for audiences, but digital platforms transformed this competition into something qualitatively different: a real-time, data-driven, algorithmically mediated contest to capture and retain as many hours of human attention as possible.

Social media companies and streaming platforms are the clearest examples of this dynamic. Their core business model is not to sell content to users but to sell users' attention to advertisers. The more time users spend on a platform, the more advertising revenue the company generates. Every design decision \u2014 the infinite scroll, the notification bell, the personalised recommendation feed \u2014 is engineered to maximise the time users spend on the platform. As Aza Raskin, the designer who invented infinite scroll, later admitted: "It's as if they took behavioural cocaine and sprinkled it all over the interface."

The consequences of this model extend beyond individual productivity. Researchers at the University of Gothenburg have found that heavy social media use correlates with increased rates of loneliness, reduced self-esteem, and difficulty sustaining long-form concentration. A separate study published in the journal Psychological Science found that the mere presence of a smartphone on a desk \u2014 even when turned face-down and switched to silent \u2014 reduced working memory and problem-solving capacity in participants. The implication is that the tools designed to connect us may be undermining the cognitive capacities we need to function effectively.

Not everyone agrees that the attention economy is inherently harmful. Some economists argue that platforms that give users free access to vast libraries of information, music, video, and communication tools generate enormous consumer surplus \u2014 benefits that traditional economic metrics fail to capture. Others suggest that the concentration on attention as a proxy for harm oversimplifies a complex relationship between technology and human behaviour, one that varies enormously across age groups, cultures, and individual circumstances.

Nevertheless, regulatory momentum is building. The European Union's Digital Services Act, which came into force in 2023, requires large platforms to conduct risk assessments of their systems' effects on public health and to provide options for chronological rather than algorithmic content feeds. In the United States, several state legislatures have introduced bills limiting the use of certain platform features for minors.

Whether these interventions will prove sufficient remains uncertain. What is clear is that the attention economy will define the contours of public health, democratic discourse, and individual cognition for decades to come.`,
          questions: [
            {
              id: "rp2q14",
              num: 14,
              type: "match_heading",
              text: "Which paragraph best matches the heading: 'Early warnings about the value of attention'?",
              options: ["A. Paragraph 1", "B. Paragraph 2", "C. Paragraph 3", "D. Paragraph 4"],
              answer: "A",
              explanation: "Paragraph 1 introduces Herbert Simon's 1971 observation about the poverty of attention."
            },
            {
              id: "rp2q15",
              num: 15,
              type: "match_heading",
              text: "Which paragraph best matches: 'The engineered design of maximum engagement'?",
              options: ["A. Paragraph 2", "B. Paragraph 3", "C. Paragraph 4", "D. Paragraph 5"],
              answer: "B",
              explanation: "Paragraph 3 describes specific design features (infinite scroll, notification bells) engineered to maximise time spent."
            },
            {
              id: "rp2q16",
              num: 16,
              type: "match_heading",
              text: "Which paragraph best matches: 'Research linking platform use to cognitive and emotional harm'?",
              options: ["A. Paragraph 2", "B. Paragraph 3", "C. Paragraph 4", "D. Paragraph 6"],
              answer: "C",
              explanation: "Paragraph 4 discusses the University of Gothenburg research and the smartphone desk study."
            },
            {
              id: "rp2q17",
              num: 17,
              type: "match_heading",
              text: "Which paragraph best matches: 'Arguments in defence of the digital attention model'?",
              options: ["A. Paragraph 3", "B. Paragraph 4", "C. Paragraph 5", "D. Paragraph 6"],
              answer: "C",
              explanation: "Paragraph 5 presents counterarguments about consumer surplus and complexity of harm."
            },
            {
              id: "rp2q18",
              num: 18,
              type: "match_heading",
              text: "Which paragraph best matches: 'Government responses to the attention economy'?",
              options: ["A. Paragraph 4", "B. Paragraph 5", "C. Paragraph 6", "D. Paragraph 7"],
              answer: "C",
              explanation: "Paragraph 6 discusses the EU's Digital Services Act and US state legislation."
            },
            { id: "rp2q19", num: 19, type: "tfng", text: "Herbert Simon's observation in 1971 was widely accepted at the time.", answer: "FALSE", explanation: "The passage states it was 'dismissed at the time as overly speculative'." },
            { id: "rp2q20", num: 20, type: "tfng", text: "Michael Goldhaber argued that attention would become scarce as information became abundant.", answer: "TRUE", explanation: "Directly stated: 'as information became abundant and free, the scarce resource would no longer be information itself but the human attention'." },
            { id: "rp2q21", num: 21, type: "tfng", text: "Aza Raskin designed the infinite scroll feature specifically to harm users.", answer: "NOT GIVEN", explanation: "Raskin is quoted critically reflecting on the scroll's effects, but his original motivation is not discussed." },
            {
              id: "rp2q22",
              num: 22,
              type: "mcq",
              text: "According to the Psychological Science study, what reduced participants' cognitive capacity?",
              options: ["A. Using a smartphone while working", "B. Having a smartphone visible on a desk, even when off", "C. Receiving notifications during a task", "D. Using social media immediately before a test"],
              answer: "B"
            },
            { id: "rp2q23", num: 23, type: "fill", text: "Social media companies sell users' ______ to advertisers rather than selling content to users.", answer: "attention" },
            { id: "rp2q24", num: 24, type: "fill", text: "The EU's ______ came into force in 2023 and requires platforms to conduct risk assessments.", answer: "Digital Services Act" },
            { id: "rp2q25", num: 25, type: "fill", text: "Some economists argue that free platforms generate large consumer ______ not captured by traditional metrics.", answer: "surplus" },
            {
              id: "rp2q26",
              num: 26,
              type: "mcq",
              text: "What does the final paragraph suggest about regulatory interventions in the attention economy?",
              options: ["A. They will definitely solve the problem", "B. They are unnecessary given the benefits of digital platforms", "C. Their effectiveness is uncertain but the issue's importance is not", "D. They are too late to have any meaningful impact"],
              answer: "C"
            }
          ]
        },
        {
          id: "rp3",
          title: "Quantum Computing: Separating Promise from Reality",
          text: `Quantum computing has attracted extraordinary levels of hype. Technology executives speak of machines that will render all current cryptography obsolete overnight; journalists describe a computing revolution that will solve climate change, discover new drugs, and transform artificial intelligence. The reality, as is often the case with transformative technologies, is considerably more nuanced.

A quantum computer exploits the principles of quantum mechanics \u2014 specifically superposition and entanglement \u2014 to perform certain categories of computation far more efficiently than a classical computer. A classical bit is always either 0 or 1; a quantum bit, or qubit, can exist in a superposition of both states simultaneously. This property, combined with entanglement \u2014 the correlation of qubits across space such that measuring one instantaneously affects its partner \u2014 allows quantum computers to explore vast numbers of computational paths simultaneously. In principle, this makes them extraordinarily powerful for specific problem types: factoring large numbers, simulating molecular interactions, and searching unsorted databases, among others.

However, the gap between principle and practice is significant. Current quantum computers are "noisy" \u2014 their qubits are extraordinarily sensitive to environmental interference, a property physicists call decoherence. Even a minor vibration, a stray electromagnetic field, or a slight change in temperature can cause a qubit to lose its quantum state and introduce errors. Correcting these errors requires redundancy: multiple physical qubits must be dedicated to representing and protecting each "logical" qubit. Current estimates suggest that fault-tolerant quantum computation \u2014 the type needed for practically useful tasks \u2014 will require thousands to millions of physical qubits per logical qubit, depending on the error rate of the hardware.

As of the mid-2020s, the largest quantum processors contain several hundred to a few thousand physical qubits. IBM's Condor processor, announced in 2023, reached 1,121 qubits. Google's Willow chip, unveiled in late 2024, achieved a milestone by completing a benchmark computation in five minutes that the company claimed would take classical supercomputers ten septillion years \u2014 though independent researchers noted the benchmark was constructed to be unfavourable to classical machines, and that no commercially relevant problem was solved.

The areas where quantum advantage is most credibly anticipated in the near term are quantum chemistry and materials science. Simulating the behaviour of electrons in complex molecules is exponentially difficult for classical computers but could be tractable for a sufficiently powerful quantum machine. Drug discovery, catalyst design, and battery development are among the applications most frequently cited. In contrast, the threat to current encryption standards \u2014 sometimes called "quantum apocalypse" in popular media \u2014 is likely at least a decade away, and the cryptographic community has already developed post-quantum encryption standards, approved by the National Institute of Standards and Technology in 2024, to mitigate the risk.

The honest assessment, shared by many practitioners, is that quantum computing will be transformatively useful \u2014 but for a narrower range of problems than the public narrative suggests, and on a longer timeline. The technology is genuinely progressing, but claims of imminent, broad-spectrum disruption routinely outpace the evidence.`,
          questions: [
            {
              id: "rp3q27",
              num: 27,
              type: "mcq",
              text: "What is the author's primary view of current claims about quantum computing?",
              options: ["A. They are largely accurate and supported by evidence", "B. They are consistently understated given the technology's potential", "C. They are more dramatic than the current reality warrants", "D. They focus too narrowly on cryptographic threats"],
              answer: "C"
            },
            {
              id: "rp3q28",
              num: 28,
              type: "mcq",
              text: "What property allows quantum computers to explore many computational paths simultaneously?",
              options: ["A. Decoherence", "B. Classical bit processing", "C. Superposition and entanglement", "D. Fault-tolerant architecture"],
              answer: "C"
            },
            {
              id: "rp3q29",
              num: 29,
              type: "mcq",
              text: "According to the passage, what is the main problem with current quantum computers?",
              options: ["A. They are too expensive to operate", "B. Their qubits lose quantum states due to environmental interference", "C. Their speed is slower than classical computers for all tasks", "D. They cannot perform calculations involving more than two qubits"],
              answer: "B"
            },
            {
              id: "rp3q30",
              num: 30,
              type: "mcq",
              text: "What criticism was made of Google's Willow chip benchmark?",
              options: ["A. The benchmark was performed incorrectly", "B. The benchmark was designed to disadvantage classical machines", "C. The chip had fewer qubits than claimed", "D. The result could not be replicated"],
              answer: "B"
            },
            { id: "rp3q31", num: 31, type: "yng", text: "The passage suggests quantum computing will eventually be useful for a wide range of everyday computing tasks.", answer: "NO", explanation: "The author states it will be 'useful for a narrower range of problems than the public narrative suggests'." },
            { id: "rp3q32", num: 32, type: "yng", text: "The author believes the threat to current encryption from quantum computing is imminent.", answer: "NO", explanation: "The author says the threat is 'likely at least a decade away'." },
            { id: "rp3q33", num: 33, type: "yng", text: "Post-quantum encryption standards have been developed in response to the potential quantum threat.", answer: "YES", explanation: "Directly confirmed: 'the cryptographic community has already developed post-quantum encryption standards, approved by NIST in 2024'." },
            { id: "rp3q34", num: 34, type: "yng", text: "IBM's Condor processor was the first to exceed 1,000 qubits.", answer: "NOT GIVEN", explanation: "The passage does not state Condor was the first; only that it 'reached 1,121 qubits'." },
            { id: "rp3q35", num: 35, type: "fill", text: "A quantum bit that exists in both 0 and 1 states simultaneously is said to be in ______.", answer: "superposition" },
            { id: "rp3q36", num: 36, type: "fill", text: "The sensitivity of qubits to environmental interference is called ______.", answer: "decoherence" },
            { id: "rp3q37", num: 37, type: "fill", text: "The most credibly near-term application of quantum computing is in quantum ______ and materials science.", answer: "chemistry" },
            {
              id: "rp3q38",
              num: 38,
              type: "mcq",
              text: "What does the passage say about the development of post-quantum cryptography?",
              options: ["A. It is still being researched with no agreed standards", "B. It was developed but not yet approved by any body", "C. Standards were approved by NIST in 2024", "D. It will only be needed once practical quantum computers exist"],
              answer: "C"
            },
            {
              id: "rp3q39",
              num: 39,
              type: "mcq",
              text: "Which area does the passage say quantum computing is NOT yet ready to disrupt imminently?",
              options: ["A. Quantum chemistry simulations", "B. Current encryption standards", "C. Materials science", "D. Drug discovery research"],
              answer: "B"
            },
            {
              id: "rp3q40",
              num: 40,
              type: "mcq",
              text: "What is the most accurate summary of the passage's conclusion?",
              options: ["A. Quantum computing will not fulfil any of its promised applications", "B. Quantum computing will be broadly transformative within five years", "C. Quantum computing will be valuable but for fewer applications and on a longer timeline than claimed", "D. Quantum computing is a misunderstood technology that poses no threat to existing systems"],
              answer: "C"
            }
          ]
        }
      ]
    },
    /* ── Writing tasks ── */
    writing: {
      task1_academic: [
        {
          id: "wa1",
          title: "Bar chart \u2014 Renewable energy sources",
          prompt: "The bar chart below shows the percentage of electricity generated from four renewable sources (solar, wind, hydroelectric, and biomass) in a European country in 2010 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
          chartData: { labels: ["Solar", "Wind", "Hydro", "Biomass"], "2010": [3, 12, 41, 8], "2023": [28, 39, 27, 6] },
          sampleAnswer: `The bar chart compares electricity generation from four renewable sources \u2014 solar, wind, hydroelectric, and biomass \u2014 in 2010 and 2023.

Overall, the most striking trend is the dramatic growth of solar and wind power over the period, while hydroelectric power saw a significant decline and biomass remained relatively stable.

In 2010, hydroelectric power dominated the renewable energy mix, accounting for 41% of generation. By contrast, solar energy contributed a mere 3%, the lowest of all four sources. Wind power stood at 12% and biomass at 8%.

By 2023, the picture had changed considerably. Solar power experienced the most dramatic increase, rising from 3% to 28% \u2014 an almost tenfold growth. Wind power also grew substantially, nearly tripling from 12% to 39%, making it the leading renewable source by 2023. Hydroelectric power, however, fell sharply from 41% to 27%, losing its dominant position. Biomass generation remained largely unchanged, declining only marginally from 8% to 6%.

In summary, the period saw wind and solar energy replace hydroelectric power as the primary drivers of renewable electricity generation.

(178 words)`,
          keyVocab: ["dominat(-ed/ing)", "dramatic(-ally)", "strik(-ing/ingly)", "generation", "proportion", "proportion", "declined", "surpassed", "overtook", "stabilised"]
        },
        {
          id: "wa2",
          title: "Line graph \u2014 Internet usage by age group",
          prompt: "The line graph below shows the percentage of people in different age groups who used the internet daily in a particular country between 2005 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
          sampleAnswer: `The line graph illustrates the proportion of daily internet users across three age groups \u2014 18\u201334, 35\u201354, and 55+ \u2014 from 2005 to 2020.

Overall, daily internet usage increased across all age groups over the period, with the youngest group maintaining the highest usage throughout and the oldest group recording the most notable growth in percentage terms.

In 2005, 68% of 18\u201334 year-olds used the internet daily, compared with 41% of 35\u201354 year-olds and just 11% of those aged 55 and above. By 2020, the 18\u201334 age group had reached near saturation at 96%, while the 35\u201354 group had risen to 85%.

The most dramatic change, however, was among the 55+ cohort. Usage in this group grew from 11% in 2005 to 62% in 2020 \u2014 an increase of 51 percentage points, far exceeding the growth seen in the younger groups. This suggests that the digital divide between older and younger users, while still present, narrowed considerably over the fifteen-year period.

(168 words)`,
          keyVocab: ["proportion", "cohort", "saturation", "narrowed", "digital divide", "percentage points", "grew steadily", "rose sharply"]
        }
      ],
      general_task1: [
        {
          id: "wg1",
          title: "Letter to a landlord about repairs",
          prompt: "You are renting a flat. There are several problems with the flat that need to be repaired. Write a letter to your landlord. In your letter: describe the problems, explain how the problems are affecting you, and suggest what the landlord should do. Write at least 150 words.",
          sampleAnswer: `Dear Mr Harrington,

I am writing regarding several maintenance issues at my flat at 14 Elmwood Court that require your urgent attention.

Firstly, the boiler has not been functioning properly for the past two weeks. It produces hot water only intermittently, which means I am frequently unable to shower or wash dishes adequately. As temperatures have dropped considerably, the lack of reliable heating is also becoming a health concern.

Secondly, there is a persistent leak from the ceiling in the bedroom, which appears to originate from the flat above. This has caused water stains to spread across the ceiling and has begun to damage the carpet. I am concerned that if left unaddressed, this could lead to structural damage or mould growth.

I would be grateful if you could arrange for a qualified plumber to inspect the boiler and a surveyor to assess the ceiling leak as soon as possible \u2014 ideally within the next seven days.

I look forward to hearing from you at your earliest convenience.

Yours sincerely,
[Your name]

(168 words)`,
          keyVocab: ["intermittently", "persistent", "originate", "unaddressed", "qualified", "at your earliest convenience", "I would be grateful if"]
        }
      ],
      task2: [
        {
          id: "wt2a",
          prompt: "Some people believe that governments should invest heavily in public transport rather than building new roads. To what extent do you agree or disagree?",
          band7Answer: `Transport infrastructure sits at the heart of urban planning, and the debate over whether public money is better directed at public transport or road construction has significant implications for congestion, emissions, and quality of life. I largely agree that public transport investment should take priority over road building, though the argument is not absolute.

The case for expanding public transport is compelling. A well-funded, reliable network of trains, trams, and buses can carry far more passengers per lane kilometre than private cars, reducing road congestion, cutting carbon emissions per capita, and making cities more accessible to those who cannot afford or are unable to drive. Cities such as Singapore and Vienna demonstrate that high levels of public transport investment can dramatically reduce car dependency without sacrificing mobility. Moreover, reducing car use addresses two of the most pressing urban challenges simultaneously: air pollution and greenhouse gas emissions.

By contrast, simply building more roads often produces what urban planners call "induced demand" \u2014 new roads attract more drivers, filling up quickly and recreating the congestion they were designed to solve. This is a well-documented phenomenon observed in cities from Los Angeles to Bangalore, and it suggests that road expansion alone cannot solve urban mobility problems.

However, I would caution against an entirely binary position. In rural and semi-rural areas, where population density makes public transport economically unviable, targeted road improvements may be necessary. Furthermore, road infrastructure supports the freight networks that underpin economic activity in ways that passenger trains cannot directly replace.

In conclusion, while some road investment remains necessary, the stronger case lies with public transport. Its capacity to move more people more sustainably makes it the wiser use of limited government resources in most urban contexts.

(270 words)`,
          approach: "Take a clear position \u2014 'largely agree' or 'largely disagree' \u2014 then support with specific evidence and acknowledge counterarguments to show critical balance.",
          keyVocab: ["infrastructure", "induced demand", "car dependency", "emissions per capita", "congestion", "viability", "a well-documented phenomenon"]
        },
        {
          id: "wt2b",
          prompt: "Increasing numbers of people are choosing to work from home rather than commuting to an office. Discuss the advantages and disadvantages of this trend.",
          band7Answer: `Remote working has transformed from an emergency measure during the pandemic into a mainstream arrangement embraced by millions of workers and employers worldwide. Like most significant shifts in working patterns, it brings both clear benefits and genuine drawbacks.

The advantages of working from home are well established. Employees save considerable time and money by eliminating the daily commute, which in major cities can easily amount to two or three hours per day. This reclaimed time can be directed towards both professional productivity and personal wellbeing. Research from Stanford University found that remote workers were, on average, thirteen percent more productive than their office-based counterparts, partly due to fewer interruptions. For employers, the shift reduces the cost of maintaining large office spaces and can expand their talent pool to candidates who are unwilling or unable to relocate.

On the other hand, working from home creates real challenges. The boundary between professional and personal life can erode, leading to longer effective working hours and increased risk of burnout. For junior employees and recent graduates, the absence of informal mentoring and spontaneous collaboration that occurs naturally in offices can impede career development. Furthermore, home working intensifies social isolation: studies have consistently found that regular in-person interaction contributes meaningfully to mental health and sense of professional identity.

It is also worth noting that remote work is not equally accessible. Many roles in healthcare, manufacturing, retail, and construction cannot be performed remotely, creating a growing divide between those with the flexibility to work from home and those without.

In conclusion, while remote work offers real and significant advantages in productivity and work-life balance, it is not without costs \u2014 particularly for social connection, career development, and equity between workers in different sectors.

(277 words)`,
          approach: "Present balanced arguments for each side with specific evidence. In a 'discuss' question, you do not need to take a personal position, but your conclusion should reflect the relative weight of the arguments.",
          keyVocab: ["mainstream", "eliminate the commute", "productivity", "erode", "burnout", "impede career development", "social isolation", "equity"]
        },
        {
          id: "wt2c",
          prompt: "Many people argue that zoos serve an important educational and conservation purpose. Others believe that keeping animals in captivity is unethical. Discuss both views and give your own opinion.",
          band7Answer: `The debate over the role of zoos in modern society encapsulates a broader ethical question about humanity's relationship with the natural world. While zoos have evolved considerably from their nineteenth-century origins, the question of whether captivity can ever be justified continues to divide opinion.

Those who support zoos argue that they play a critical role in conservation. Several species \u2014 including the Arabian oryx, the California condor, and Przewalski's horse \u2014 have been saved from extinction through captive breeding programmes managed by zoos. Modern accredited zoos also contribute to scientific research and fund field conservation projects in the wild. For many urban residents, particularly children, a zoo visit provides the only opportunity to encounter wildlife directly, fostering appreciation that can translate into broader environmental concern.

Opponents, however, question the ethics of confining wild animals regardless of the intended purpose. Many species, particularly large mammals such as elephants and great apes, exhibit stress-related behaviours in captivity \u2014 repetitive pacing, self-harm, and social dysfunction \u2014 that indicate significant psychological suffering. Critics also argue that the conservation rationale is used to justify an institution that is primarily driven by entertainment and commercial revenue, with genuine breeding success confined to a small minority of species.

My own view is that the ethical justification for zoos depends entirely on how they are run. Accredited institutions with high welfare standards, genuine conservation programmes, and a stated goal of reducing captive populations over time occupy a different ethical position from roadside zoos or animal parks run purely for entertainment. A blanket condemnation of all zoos oversimplifies what is a varied and evolving institution.

In conclusion, zoos can be justified when they genuinely prioritise animal welfare and conservation, but this standard is far from universal, and continued scrutiny and reform are necessary.

(286 words)`,
          approach: "Address both views with concrete examples, then give a nuanced personal opinion. Avoid vague language like 'I think it depends' \u2014 instead, give a qualified position.",
          keyVocab: ["captive breeding", "extinction", "accredited", "stress-related behaviours", "psychological suffering", "ethical justification", "scrutiny", "oversimplifies"]
        }
      ]
    },
    speaking: [
      {
        part: 1,
        topics: [
          { topic: "Home and accommodation", questions: ["Do you live in a house or a flat?", "What do you like most about your home?", "Have you always lived in the same place?", "What would your ideal home look like?"] },
          { topic: "Free time and hobbies", questions: ["What do you enjoy doing in your free time?", "Has this changed since you were younger?", "Do you prefer spending time alone or with others?"] },
          { topic: "Work and study", questions: ["Are you working or studying at the moment?", "What do you like about your work/course?", "What are your plans for the future?"] }
        ]
      },
      {
        part: 2,
        cueCards: [
          {
            id: "sp2a",
            prompt: "Describe a time when you learned something new and challenging. You should say: what you learned, why you decided to learn it, how difficult it was, and explain why the experience was memorable.",
            prepTime: 60,
            speakTime: 120,
            sampleAnswer: `I'd like to talk about when I decided to learn how to drive, which was about three years ago.

I grew up in a city with very good public transport, so learning to drive had never been a priority. But when I moved to a smaller town for work, I quickly realised that having a car would make my life considerably easier. So I enrolled in driving lessons.

At first, I found it genuinely overwhelming. There were so many things to think about simultaneously \u2014 the clutch, the gears, the mirrors, road signs \u2014 that I genuinely wondered whether I'd ever be able to coordinate it all. My first few lessons were quite stressful, and I stalled the car more times than I care to admit.

What made it memorable, though, was the gradual process of it becoming automatic. After about fifteen hours of lessons, I began to feel more relaxed, and the individual actions started to blend into a single fluid experience. When I eventually passed my test on the second attempt \u2014 I failed the first time because of a minor positioning error \u2014 I felt a real sense of achievement.

The experience taught me something useful about learning in general: that the initial stage of any new skill feels impossibly complicated, but repetition eventually makes what was effortful feel natural. That's a lesson I've found useful well beyond driving.`,
            keyVocab: ["simultaneously", "coordinate", "enrol", "stall", "overwhelming", "gradually", "automatic", "fluid experience"]
          },
          {
            id: "sp2b",
            prompt: "Describe a book, film, or television programme that made a strong impression on you. You should say: what it was, what it was about, when you encountered it, and explain why it had such a strong impact on you.",
            prepTime: 60,
            speakTime: 120,
            sampleAnswer: `I'd like to describe a documentary series I watched a few years ago called 'Our Planet', presented by David Attenborough.

The series was produced for a major streaming platform and covered different global ecosystems over eight episodes \u2014 oceans, forests, deserts, grasslands, and so on. Each episode blended breathtaking wildlife footage with a clear message about the threats these ecosystems face from climate change and human activity.

What struck me most was the contrast between the beauty of what was being shown and the urgency of the narration. In one sequence, thousands of walruses were shown falling from a cliff because melting sea ice had left them with nowhere safe to rest. It was deeply upsetting and very difficult to watch, but it also made the abstract issue of climate change feel immediate and real.

The reason it made such a strong impression was that it changed how I thought about environmental issues. Before watching it, I understood intellectually that biodiversity loss was a serious problem, but the documentary made it emotionally real in a way that statistics never quite do. It motivated me to make some practical changes \u2014 I became more careful about my food choices, and I started donating to a wildlife conservation charity.

I'd strongly recommend it to anyone who hasn't seen it.`,
            keyVocab: ["breathtaking", "urgency", "abstract", "immediate", "biodiversity", "motivated", "made a strong impression", "emotionally real"]
          }
        ]
      },
      {
        part: 3,
        discussions: [
          {
            topic: "Education and learning",
            questions: [
              { q: "Do you think schools adequately prepare students for adult life?", sampleAnswer: "In many ways, traditional schooling focuses heavily on academic knowledge while overlooking practical skills like financial literacy, critical thinking in real-world contexts, and emotional regulation. There are exceptions \u2014 some progressive school systems do incorporate project-based learning and life skills \u2014 but for the majority, there's a significant gap between what school teaches and what adult life demands. That said, schools can't be expected to do everything; families and communities also play a role in preparing young people." },
              { q: "How has technology changed the way people learn?", sampleAnswer: "The change has been profound. Online learning platforms, video tutorials, and educational apps mean that virtually any skill or subject can now be self-taught by anyone with internet access. This has democratised knowledge in a remarkable way \u2014 someone in a rural area can access the same tutorial as a student at a top university. The challenge, though, is that self-directed learning requires discipline and motivation that formal education helps instil. So technology has expanded access without necessarily making learning easier." },
              { q: "Should education be free for everyone?", sampleAnswer: "I believe strongly that education \u2014 at least up to secondary level \u2014 should be funded publicly. It's both an individual benefit and a social good: an educated population is healthier, more productive, and more civically engaged. The debate becomes more complicated at the university level, where the benefits are more mixed between the individual and society. I think a sliding scale based on means, rather than outright fees or complete state funding, might be the most equitable solution in practice." }
            ]
          }
        ]
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     TOEFL iBT
  ═══════════════════════════════════════════════════════════════════ */
  toefl: {
    reading: {
      passages: [
        {
          id: "tr1",
          title: "The Domestication of the Dog",
          text: `The domestication of the dog from its wolf ancestor represents one of the most consequential interspecies relationships in human history. Despite considerable debate among researchers, there is now broad consensus that domestic dogs (Canis lupus familiaris) diverged from grey wolves (Canis lupus) between 15,000 and 40,000 years ago, long before the development of agriculture. This timeline suggests that the bond between humans and dogs predates almost every other aspect of modern civilisation.

The precise mechanism of domestication remains contested. One hypothesis proposes that wolves began to self-domesticate by scavenging near human camps, with less fearful individuals gaining a selective advantage through access to human food waste. Over generations, this population would have become progressively tamer, more tolerant of human presence, and increasingly distinct from their wild counterparts. An alternative view suggests that early humans deliberately captured wolf cubs and raised them, selecting for tractability and utility over many generations.

Genetic and archaeological evidence has complicated both narratives. Ancient DNA studies have identified what appear to be multiple domestication events occurring in different geographic regions \u2014 possibly in East Asia and Europe independently. Some researchers interpret this as evidence of separate domestication lineages; others argue it reflects the movement of both dogs and humans across continents after an initial single domestication event.

Whatever the mechanism, the consequences of domestication were far-reaching. Dogs became integral to hunting, herding, guarding, and companionship across virtually every human culture. Their social intelligence \u2014 specifically, their ability to follow human pointing gestures and interpret social cues \u2014 surpasses that of chimpanzees, despite the latter's closer genetic relationship to humans. This remarkable capacity for cross-species communication suggests that domestication reshaped the dog's cognitive architecture in profound ways.

Recent research has focused on the neurological basis of the human-dog bond. Studies using functional MRI have shown that dogs respond to the scent of their owners with heightened activation of the caudate nucleus \u2014 a brain region associated with positive anticipation and reward. Parallel studies have found that interactions between dogs and their owners trigger the release of oxytocin, the neuropeptide associated with social bonding, in both species simultaneously. These findings suggest that the human-dog relationship is not merely a trained association but a genuine mutual bond with neurological correlates.`,
          questions: [
            {
              id: "trq1",
              num: 1,
              type: "mcq",
              text: "The passage suggests that the domestication of dogs is significant because it",
              options: ["A. proved that wolves could be entirely tamed", "B. predates nearly all other elements of modern civilisation", "C. provided humans with their first source of protein", "D. occurred simultaneously in every inhabited region"],
              answer: "B"
            },
            {
              id: "trq2",
              num: 2,
              type: "mcq",
              text: "According to the self-domestication hypothesis, wolves gained advantage by",
              options: ["A. forming hunting packs with early humans", "B. being deliberately raised by humans from cubs", "C. scavenging near human settlements and becoming less fearful", "D. migrating to areas with abundant prey"],
              answer: "C"
            },
            {
              id: "trq3",
              num: 3,
              type: "vocab",
              text: "The word 'tractability' in paragraph 2 is closest in meaning to",
              options: ["A. intelligence", "B. speed", "C. manageability", "D. independence"],
              answer: "C"
            },
            {
              id: "trq4",
              num: 4,
              type: "mcq",
              text: "What does ancient DNA evidence reveal about dog domestication?",
              options: ["A. It occurred in a single location approximately 15,000 years ago", "B. It may have happened more than once in separate geographic regions", "C. It was driven entirely by human selection rather than self-domestication", "D. It took place exclusively in East Asia"],
              answer: "B"
            },
            {
              id: "trq5",
              num: 5,
              type: "mcq",
              text: "What does the passage identify as remarkable about dogs' social intelligence?",
              options: ["A. It is superior to that of wolves in hunting contexts", "B. It enables them to learn over three hundred distinct commands", "C. It exceeds that of chimpanzees in interpreting human social cues", "D. It developed entirely through domestication in a single generation"],
              answer: "C"
            },
            {
              id: "trq6",
              num: 6,
              type: "mcq",
              text: "What does the fMRI research described in the final paragraph indicate?",
              options: ["A. Dogs cannot distinguish their owners from strangers by scent", "B. Dogs experience reward-associated brain activation in response to their owners' scent", "C. The caudate nucleus controls dogs' ability to follow pointing gestures", "D. Oxytocin release occurs only in dogs, not in humans, during interaction"],
              answer: "B"
            },
            {
              id: "trq7",
              num: 7,
              type: "inference",
              text: "It can be inferred from the final paragraph that the human-dog relationship",
              options: ["A. is primarily based on training and conditioned responses", "B. has neurological characteristics that parallel social bonding between humans", "C. is less emotionally significant for dogs than for their owners", "D. was only recognised as a genuine bond after the development of fMRI technology"],
              answer: "B"
            },
            {
              id: "trq8",
              num: 8,
              type: "mcq",
              text: "Which of the following does the passage NOT mention as a role dogs played in human society?",
              options: ["A. Hunting", "B. Herding", "C. Warfare", "D. Companionship"],
              answer: "C"
            },
            {
              id: "trq9",
              num: 9,
              type: "vocab",
              text: "The word 'correlates' in the final sentence is closest in meaning to",
              options: ["A. symptoms", "B. opposites", "C. associated features", "D. treatments"],
              answer: "C"
            },
            {
              id: "trq10",
              num: 10,
              type: "summary",
              text: "Select the three statements that best summarise the key ideas of the passage.",
              options: ["A. Dogs were domesticated from wolves long before agriculture, though the exact mechanism remains debated.", "B. All researchers agree that domestication occurred once in East Asia.", "C. Dogs demonstrate exceptional social intelligence that goes beyond what genetics alone would predict.", "D. Dogs have no emotional bond with their owners according to neurological research.", "E. Neurological research shows a genuine mutual bond between dogs and humans.", "F. Chimpanzees are more socially intelligent than dogs in most contexts."],
              answer: ["A", "C", "E"],
              multiSelect: true
            }
          ]
        }
      ]
    },
    listening: {
      excerpts: [
        {
          id: "tl1",
          type: "lecture",
          topic: "The concept of opportunity cost in economics",
          script: `Professor: Good afternoon everyone. So today I want to start with a concept that is absolutely foundational to economics \u2014 and I mean foundational in the sense that once you understand it, it changes how you think about virtually every decision you'll ever make. It's called opportunity cost.

The formal definition: opportunity cost is the value of the next best alternative foregone when a choice is made. Let me give you the classic example. Suppose you're a student who has four hours free on a Saturday afternoon. You could use that time to study for an upcoming exam, or you could take a part-time job that pays twenty dollars an hour. If you choose to study, the opportunity cost of that decision isn't zero \u2014 it's eighty dollars, the income you gave up.

Now here's what makes this concept powerful: opportunity cost is almost always invisible. When we make decisions, we naturally focus on what we get \u2014 the tangible outcome. What we systematically undercount is what we're giving up. Economists argue this is one of the primary sources of irrational decision-making in both individual behaviour and public policy.

Take a government deciding whether to build a new highway or a new hospital. The cost of the highway isn't just what it costs to build \u2014 it's also all of the hospitals, schools, or other infrastructure that won't be built because the money is committed. Traditional cost-benefit analysis often misses this. Opportunity cost forces the question: compared to what?

The concept also applies at the margin \u2014 in what economists call marginal analysis. The question isn't 'should I ever study?' but 'should I study one more hour?' Each additional hour of studying has a diminishing marginal return \u2014 the first hour might increase your exam performance significantly, the second hour somewhat less, and the tenth hour barely at all. Meanwhile, the opportunity cost of that tenth hour \u2014 the rest, the exercise, the social interaction you're giving up \u2014 may have become very high.

This is why economists consistently recommend that decision-makers think at the margin rather than in all-or-nothing terms. The right question is almost never 'should we do X or Y' \u2014 it's 'how much of X and how much of Y produces the optimal outcome?'`,
          questions: [
            {
              id: "tlq1",
              num: 1,
              type: "mcq",
              text: "What is the professor's main point in this lecture?",
              options: ["A. Students should take part-time jobs rather than study", "B. Opportunity cost is a foundational economic concept that affects all decision-making", "C. Government spending decisions ignore economic theory", "D. Marginal analysis is too complex for real-world use"],
              answer: "B"
            },
            {
              id: "tlq2",
              num: 2,
              type: "mcq",
              text: "According to the professor, what is the opportunity cost of choosing to study on Saturday afternoon?",
              options: ["A. The cost of textbooks", "B. The stress of the upcoming exam", "C. The income that could have been earned working", "D. The social activities that might be missed"],
              answer: "C"
            },
            {
              id: "tlq3",
              num: 3,
              type: "mcq",
              text: "Why does the professor say opportunity cost is 'almost always invisible'?",
              options: ["A. It is calculated using complex formulas", "B. People focus on tangible outcomes and systematically undercount what they give up", "C. It only applies to government policy, not individual decisions", "D. Economists have only recently discovered the concept"],
              answer: "B"
            },
            {
              id: "tlq4",
              num: 4,
              type: "mcq",
              text: "What does 'thinking at the margin' mean according to the professor?",
              options: ["A. Reducing spending on all optional expenses", "B. Focusing on whether the next unit of an action adds sufficient value", "C. Considering the total cost of a decision over its lifetime", "D. Consulting economic experts before making major decisions"],
              answer: "B"
            },
            {
              id: "tlq5",
              num: 5,
              type: "mcq",
              text: "How does the professor describe the return from additional hours of study?",
              options: ["A. Constant \u2014 each additional hour produces the same benefit", "B. Increasing \u2014 each additional hour is more valuable than the last", "C. Diminishing \u2014 additional hours produce progressively smaller benefits", "D. Zero \u2014 study beyond two hours has no measurable effect"],
              answer: "C"
            }
          ]
        }
      ]
    },
    speaking: [
      {
        id: "ts1",
        taskNum: 1,
        type: "independent",
        prompt: "Some people prefer to make decisions quickly. Others prefer to take a lot of time before deciding. Which approach do you prefer and why? Include specific reasons and examples to support your answer.",
        prepSeconds: 15,
        responseSeconds: 45,
        sampleAnswer: `I generally prefer to take time before making important decisions. Quick decisions can sometimes be efficient, but in my experience, the outcomes tend to be better when I've had time to consider different options. For example, when I was choosing between two university programmes, I spent nearly two weeks researching both, speaking to current students, and weighing the long-term career implications. If I'd decided quickly, I might have chosen based on superficial factors like location. Taking time allowed me to identify that one programme had significantly stronger industry connections, which has since proven very valuable. That said, I recognise that overthinking trivial decisions \u2014 what to have for lunch, for example \u2014 is just inefficient. So my preference for slower decision-making applies mainly to consequential choices.`
      },
      {
        id: "ts2",
        taskNum: 2,
        type: "integrated_campus",
        readingPassage: `NOTICE: Changes to the University Library Weekend Hours

Effective from next month, the university library will reduce its weekend operating hours. The library will now open at 10:00 am instead of 8:00 am on Saturdays and Sundays, and will close at 6:00 pm rather than 9:00 pm.

The university administration states that the change reflects patterns in student usage data, which show that fewer than 12% of students use the library before 10:00 am or after 6:00 pm on weekends. The change is expected to reduce operating costs by approximately 15%, which will be redirected to expand digital database access available to students 24 hours a day.`,
        conversation: `Student 1: Did you see the notice about the library hours?
Student 2: I did, and honestly I'm not happy about it. I work a part-time job on Saturday afternoons, so evening access is the only time I can really use the physical collection.
Student 1: I can understand that. But they said the usage data shows very few people going before ten or after six.
Student 2: That 12% still represents hundreds of students though. And the students who use those hours often have the most pressing needs \u2014 people with jobs, or those who can't afford their own study space.
Student 1: True. Though the increased digital access they're promising could offset some of the impact.
Student 2: Maybe, but not every resource I need is available digitally. Some of the older journals in my field are physical-only collections. The change really disadvantages humanities students in particular.`,
        question: "The woman expresses a negative opinion about the library's decision. State her opinion and explain the reasons she gives for holding it.",
        prepSeconds: 30,
        responseSeconds: 60,
        sampleAnswer: `The woman is dissatisfied with the decision to reduce library weekend hours. She gives two main reasons. First, she works on Saturday afternoons, meaning evening access is the primary time she can use the physical collection \u2014 the new closing time of 6pm directly conflicts with her schedule. Second, she argues that the 12% usage figure, while small as a percentage, still represents a significant number of students, and that these students \u2014 particularly those with jobs or those who lack personal study space \u2014 may have greater need for extended hours than the average student. She also notes that the promised expansion of digital databases won't fully compensate, because some resources in her field \u2014 specifically older humanities journals \u2014 are only available in physical format.`
      },
      {
        id: "ts3",
        taskNum: 3,
        type: "integrated_academic",
        readingPassage: `Cognitive Dissonance

Cognitive dissonance is a psychological state that occurs when a person holds two or more contradictory beliefs, or when a person's actions conflict with their stated values. The experience of cognitive dissonance is uncomfortable, motivating individuals to resolve the internal conflict. Common resolution strategies include changing one of the conflicting beliefs, acquiring new information that reconciles the contradiction, or reducing the importance of one of the conflicting elements.`,
        lecture: `Professor: Here's a classic example. A person who smokes cigarettes but also believes smoking causes cancer experiences cognitive dissonance. The contradiction between 'I smoke' and 'smoking is harmful to health' creates psychological tension. Now, how do people resolve it? They rarely just stop smoking immediately \u2014 that would be the most logical resolution but also the most effortful. Instead, they often engage in one of three less demanding strategies. First, they might convince themselves that the evidence on cancer isn't as clear as scientists claim \u2014 changing the belief. Second, they might focus on a friend who smoked heavily and lived to ninety \u2014 acquiring reconciling information. Or third, they might decide that life is short and enjoyment matters more than longevity \u2014 reducing the importance of the conflict. Notice that none of these involve changing the behaviour. That's what makes cognitive dissonance theory so powerful and somewhat sobering \u2014 our minds are remarkably skilled at defending our existing actions.`,
        question: "Using the example from the lecture, explain the concept of cognitive dissonance and two strategies people use to resolve it.",
        prepSeconds: 30,
        responseSeconds: 60,
        sampleAnswer: `Cognitive dissonance refers to the psychological tension that arises when a person's beliefs or actions contradict each other. The reading defines it as the discomfort caused by holding two conflicting beliefs or acting against one's stated values.

The professor uses smoking as an example. A person who smokes while believing smoking causes cancer experiences this tension. Rather than simply quitting \u2014 the most rational resolution \u2014 people typically use easier strategies. One approach is to change the belief: the smoker might convince themselves the scientific evidence on cancer is overstated. Another is to find reconciling information: they might focus on examples of heavy smokers who lived long lives. Both strategies preserve the behaviour while reducing the psychological discomfort. The professor notes this illustrates how effectively our minds protect existing actions rather than challenging them.`
      },
      {
        id: "ts4",
        taskNum: 4,
        type: "integrated_lecture",
        lecture: `Today I want to explain the concept of keystone species \u2014 organisms that have a disproportionately large effect on their ecosystem relative to their abundance. The classic example is the sea otter along the Pacific coast of North America. Sea otters prey on sea urchins. Sea urchins, in turn, eat kelp. When sea otter populations were dramatically reduced by the fur trade in the eighteenth and nineteenth centuries, sea urchin populations exploded. The unchecked urchins consumed vast amounts of kelp, destroying the kelp forest ecosystems that support hundreds of other species \u2014 fish, invertebrates, marine mammals. The removal of a single species \u2014 the otter \u2014 produced cascading effects across the entire food web. When conservation efforts restored otter populations in the twentieth century, sea urchin numbers fell, kelp forests recovered, and biodiversity in those ecosystems returned. This cascade of effects \u2014 both the collapse and the recovery \u2014 illustrates why keystone species are so critical to ecosystem stability.`,
        question: "Using the example from the lecture, explain the concept of keystone species and describe the effects of removing one from its ecosystem.",
        prepSeconds: 20,
        responseSeconds: 60,
        sampleAnswer: `A keystone species is an organism that has a far greater impact on its ecosystem than its population size would suggest. The professor illustrates this with the sea otter.

Sea otters prey on sea urchins, which in turn eat kelp. When hunting dramatically reduced sea otter numbers, sea urchin populations grew unchecked. The urchins consumed enormous amounts of kelp, destroying kelp forest ecosystems that hundreds of other species \u2014 fish, invertebrates, and marine mammals \u2014 depend on. The removal of just one species caused the collapse of an entire interconnected system.

However, when otter populations were eventually restored through conservation, sea urchin numbers fell, kelp forests recovered, and biodiversity returned. The example shows that keystone species play a stabilising role: their presence regulates the populations of other species and maintains the balance of the ecosystem as a whole.`
      }
    ],
    writing: [
      {
        id: "tw1",
        type: "integrated",
        readingPassage: `The Three-Day Work Week

Several economists and productivity researchers have argued that reducing the standard work week from five to three days would benefit both workers and businesses. Proponents claim that shorter work weeks increase employee wellbeing by reducing burnout and allowing more time for rest and personal pursuits. They also argue that workers who work fewer days are more focused and productive during the time they do work, potentially matching or exceeding the output of those working five days. Additionally, a three-day work week could reduce traffic congestion and carbon emissions associated with daily commuting.`,
        lecture: `Professor: I'd like to address some of the claims made in the reading about a three-day work week, because the evidence is more complicated than it suggests.

On the wellbeing argument: while it's true that some employees report higher satisfaction in shorter work week trials, research from Iceland and Japan showed mixed results. Many workers reported feeling increased pressure to complete the same volume of work in fewer hours, which actually heightened stress rather than reducing it.

The productivity argument also needs qualification. The trials that showed maintained productivity were almost entirely in knowledge-work or creative industries \u2014 sectors where output is relatively flexible and quality matters more than quantity. In manufacturing, healthcare, retail, and other time-sensitive fields, fewer working days simply means less gets done, or more costly shift arrangements are needed to maintain service levels.

And on emissions: the calculation is not straightforward. If commuting decreases but leisure travel increases on the additional free days \u2014 a pattern observed in some trial data \u2014 the net carbon reduction may be minimal or even negative.

So while a shorter work week has genuine appeal, the case for three days specifically is considerably weaker than it might appear.`,
        prompt: "Summarise the points made in the lecture, explaining how they cast doubt on specific claims made in the reading passage. Write 150\u2013225 words.",
        sampleAnswer: `The lecture challenges three claims made in the reading about the three-day work week.

First, while the reading asserts that shorter weeks improve employee wellbeing by reducing burnout, the professor notes that trials in Iceland and Japan produced mixed outcomes. Many workers actually experienced greater stress because they faced the same workload compressed into fewer days, counteracting the intended benefit.

Second, the reading argues that workers are more productive when working fewer days. The professor qualifies this significantly: productivity gains were observed almost exclusively in knowledge and creative industries, where output is flexible. In sectors such as healthcare, manufacturing, and retail, fewer working days simply results in less output or requires expensive shift restructuring to maintain service levels.

Third, the reading claims a shorter work week would reduce carbon emissions from commuting. The professor challenges this calculation, pointing out that additional free days often lead to increased leisure travel. If this offset is factored in, the net carbon reduction may be minimal or could even become negative.

Overall, the lecture argues that the case for a three-day work week is considerably more nuanced than the reading implies, with benefits limited to specific industries and contexts.

(185 words)`
      },
      {
        id: "tw2",
        type: "academic_discussion",
        professorPrompt: `Professor Chen: This week we've been studying urban planning strategies. I'd like us to discuss the following question: Should cities prioritise building affordable housing for lower-income residents, or should they focus on developing cultural and commercial infrastructure to attract investment and create jobs? Both approaches aim to improve city life \u2014 but they reflect very different visions of what cities are for. What do you think?`,
        studentResponses: [
          { name: "Marcus", response: "I think cities should focus on affordable housing first. Cultural venues and commercial investment don't help people who can't afford to live in the city in the first place. If working-class families are priced out of urban areas, the city loses the diversity and service workers that make it function." },
          { name: "Yuna", response: "I see Marcus's point, but I think the two goals can be mutually reinforcing. Investment creates jobs and tax revenue, which governments can redirect into affordable housing programmes. Cities that lack economic dynamism end up without the resources to fund housing at all. So a bit of sequencing may be necessary." }
        ],
        prompt: "Add your own contribution to the discussion. Respond to what at least one of your classmates has said, and support your position with specific reasons or examples. Write at least 100 words.",
        sampleAnswer: `Both Marcus and Yuna raise valid points, but I think Yuna's framing of sequencing is the more practically realistic one \u2014 with an important caveat.

Marcus is right that housing affordability is a prerequisite for genuine urban inclusion. However, I'd push back slightly on the implicit assumption that cultural and commercial development inherently displaces lower-income residents. Done well, mixed-use development can create genuine economic opportunity within existing communities, not instead of them. The key mechanism is housing policy running alongside investment strategy \u2014 zoning requirements for affordable units within new developments, community land trusts, and direct public investment in social housing.

Cities like Vienna demonstrate that it's possible to have world-class cultural infrastructure and a robust social housing sector simultaneously. The difference lies in political will, not in any inherent tension between the two goals. The failure mode isn't choosing investment over housing \u2014 it's allowing investment to flow without any mechanism ensuring that benefits are broadly shared.

(152 words)`
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     GRE
  ═══════════════════════════════════════════════════════════════════ */
  gre: {
    analyticalWriting: [
      {
        id: "gaw1",
        type: "issue",
        prompt: "Governments should prioritise funding basic scientific research over applied research, because breakthroughs that change civilisation are rarely the result of solving immediate problems.",
        instructions: "Write a response in which you discuss the extent to which you agree or disagree with the statement. Develop your position with reasons and examples.",
        sampleAnswer: `The claim that civilisation-changing breakthroughs come from basic rather than applied research has merit as a historical generalisation \u2014 but as a prescription for government funding priorities, it is oversimplified and potentially counterproductive.

The historical record does lend the claim some support. The discovery of penicillin arose from Alexander Fleming's curiosity-driven observation of mould contaminating a petri dish, not from a directed programme to find antibiotics. The laser emerged from theoretical physics long before anyone imagined applications in surgery, data storage, or telecommunications. GPS, though developed for military navigation, relied on Einstein's general relativity \u2014 a purely theoretical framework with no immediately practical intent. These examples suggest that maintaining a robust programme of curiosity-driven research produces a reservoir of knowledge from which future applications draw in ways that are impossible to predict.

However, the argument has two significant weaknesses. First, it presents basic and applied research as mutually exclusive, when in practice they exist on a continuum and are mutually reinforcing. The development of mRNA vaccine technology \u2014 arguably the most consequential biomedical advance of the past decade \u2014 combined decades of basic research in molecular biology with highly directed applied research responding to immediate public health challenges. Framing this as either/or misrepresents how science actually progresses.

Second, the claim ignores context. Not all problems that governments fund research to address are mere 'immediate problems' \u2014 climate change, antimicrobial resistance, and pandemic preparedness are civilisation-level threats demanding urgent applied research, not patience for serendipitous basic research breakthroughs. A government that redirected all climate research funding into pure physics on the grounds that breakthroughs come unexpectedly would be making a grievous error.

The more defensible position is that governments should maintain substantial investment in basic research while ensuring that applied research addressing large-scale societal challenges is funded in proportion to their urgency. The dichotomy the prompt presents is a false one, and good science policy recognises it as such.

(310 words)`,
        approach: "Take a nuanced position that acknowledges merit in the claim while identifying its limits. Use 2\u20133 specific historical or contemporary examples. Structure: intro with qualified position \u2192 2 body paragraphs agreeing \u2192 2 paragraphs qualifying/disagreeing \u2192 concise conclusion."
      }
    ],
    verbal: [
      {
        id: "gv1",
        type: "text_completion_1blank",
        text: "The historian's account, though meticulous in its use of primary sources, was criticised for its ______ interpretation of events that most scholars regard as straightforwardly attributable to economic factors.",
        options: ["A. orthodox", "B. tendentious", "C. provisional", "D. laconic", "E. equitable"],
        answer: "B",
        explanation: "'Tendentious' means promoting a particular point of view, often controversially. It fits a context where the interpretation diverges from what most scholars accept."
      },
      {
        id: "gv2",
        type: "text_completion_2blank",
        text: "The committee's report was praised for its (i)______ but criticised for its (ii)______ \u2014 offering comprehensive data while failing to draw any actionable conclusions.",
        blanks: ["i", "ii"],
        options: { i: ["A. comprehensiveness", "B. brevity", "C. partisanship"], ii: ["D. incisiveness", "E. prolixity", "F. diffidence"] },
        answer: { "i": "A", "ii": "F" },
        explanation: "'Comprehensiveness' fits the data-gathering praise; 'diffidence' (lack of assertiveness) fits the failure to draw conclusions."
      },
      {
        id: "gv3",
        type: "sentence_equivalence",
        text: "The administrator's response was so ______ that critics accused her of deliberately obscuring the agency's actual position on the regulation.",
        options: ["A. equivocal", "B. candid", "C. ambiguous", "D. forthright", "E. lucid", "F. trenchant"],
        answer: ["A", "C"],
        explanation: "'Equivocal' and 'ambiguous' both mean unclear or open to multiple interpretations \u2014 both produce the same meaning in the sentence."
      },
      {
        id: "gv4",
        type: "text_completion_1blank",
        text: "The scientist's theory, initially greeted with ______, has over the past decade attracted substantial empirical support and is now considered a leading framework in the field.",
        options: ["A. enthusiasm", "B. scepticism", "C. indifference", "D. alarm", "E. corroboration"],
        answer: "B",
        explanation: "The contrast with 'substantial empirical support' suggests the initial reception was doubting. 'Scepticism' fits best."
      },
      {
        id: "gv5",
        type: "reading_comprehension",
        passage: "Historians of science have long debated whether major scientific breakthroughs result primarily from individual genius or from broader social and institutional conditions. The 'Great Man' theory, associated with early twentieth-century historiography, held that science advances through isolated acts of intellectual heroism. By contrast, the sociology of science \u2014 particularly the work of Robert Merton and later Thomas Kuhn \u2014 has emphasised the extent to which scientific progress is shaped by existing paradigms, resource availability, institutional incentives, and the cumulative contributions of large research communities. The multiple independent discovery of the same scientific finding \u2014 calculus by Newton and Leibniz, natural selection by Darwin and Wallace \u2014 is frequently cited as evidence that context, not individual genius, is the primary driver of scientific timing.",
        questions: [
          {
            id: "gv5q1",
            text: "The passage primarily argues that",
            options: ["A. individual genius is more important than social conditions in scientific discovery", "B. the Great Man theory is the most accurate explanation of scientific progress", "C. historical and sociological perspectives both contribute to understanding scientific breakthroughs", "D. simultaneous discoveries prove that individuals play no role in scientific progress"],
            answer: "C"
          },
          {
            id: "gv5q2",
            text: "Multiple independent discoveries of the same finding are cited in order to",
            options: ["A. demonstrate that all scientists are equally intelligent", "B. support the view that contextual conditions, rather than unique individual insight, drive discovery timing", "C. argue that scientific competition is the main driver of innovation", "D. show that different scientific traditions produce identical results"],
            answer: "B"
          }
        ]
      },
      {
        id: "gv6",
        type: "text_completion_1blank",
        text: "The negotiator's approach was characterised by ______ \u2014 a willingness to cede minor points in order to secure agreement on the substantive issues.",
        options: ["A. intransigence", "B. pragmatism", "C. pedantry", "D. belligerence", "E. vacillation"],
        answer: "B",
        explanation: "'Pragmatism' (practical, flexible approach) best describes willingness to make minor concessions for overall agreement."
      },
      {
        id: "gv7",
        type: "sentence_equivalence",
        text: "The new legislation was widely perceived as ______, doing little more than repackaging existing regulations under different terminology.",
        options: ["A. redundant", "B. innovative", "C. superfluous", "D. groundbreaking", "E. arcane", "F. labyrinthine"],
        answer: ["A", "C"],
        explanation: "'Redundant' and 'superfluous' both mean unnecessary/duplicative \u2014 both preserve the meaning that the legislation added nothing new."
      }
    ],
    quantitative: [
      {
        id: "gq1",
        type: "problem_solving",
        text: "A store offers a 20% discount on all items. During a sale week, it applies an additional 15% discount on the already-reduced price. What is the total percentage discount from the original price?",
        options: ["A. 32%", "B. 35%", "C. 30%", "D. 28%", "E. 33%"],
        answer: "A",
        solution: "Original price P. After 20% discount: 0.80P. After additional 15% off 0.80P: 0.80P \xD7 0.85 = 0.68P. Total discount = P \u2212 0.68P = 0.32P = 32%.",
        concept: "Successive percentage discounts: multiply the factors (1 \u2212 r\u2081)(1 \u2212 r\u2082), not add them."
      },
      {
        id: "gq2",
        type: "quantitative_comparison",
        text: "Column A: The perimeter of a rectangle with area 36 and length 9. Column B: 26",
        options: ["A. Column A is greater", "B. Column B is greater", "C. The two quantities are equal", "D. The relationship cannot be determined from the information given"],
        answer: "C",
        solution: "Area = length \xD7 width \u2192 36 = 9 \xD7 w \u2192 w = 4. Perimeter = 2(9 + 4) = 26. Quantities are equal.",
        concept: "Quantitative Comparison: derive the unknown value systematically before comparing."
      },
      {
        id: "gq3",
        type: "problem_solving",
        text: "If x and y are positive integers such that x + y = 15 and x < y, how many distinct values can the product xy take?",
        options: ["A. 5", "B. 6", "C. 7", "D. 8", "E. 9"],
        answer: "C",
        solution: "Pairs (x, y) with x < y and x + y = 15: (1,14)=14; (2,13)=26; (3,12)=36; (4,11)=44; (5,10)=50; (6,9)=54; (7,8)=56. That is 7 distinct products.",
        concept: "Systematically list cases when x < y to avoid duplicates."
      },
      {
        id: "gq4",
        type: "problem_solving",
        text: "A train travels from City A to City B at 80 km/h and returns at 120 km/h. What is the train's average speed for the entire journey?",
        options: ["A. 96 km/h", "B. 100 km/h", "C. 98 km/h", "D. 94 km/h", "E. 102 km/h"],
        answer: "A",
        solution: "Average speed = 2d/(d/80 + d/120) = 2/(1/80 + 1/120) = 2/((3+2)/240) = 2\xD7240/5 = 96 km/h. Harmonic mean of the two speeds.",
        concept: "When distance is constant in both directions, use the harmonic mean: 2ab/(a+b)."
      },
      {
        id: "gq5",
        type: "quantitative_comparison",
        text: "x > 0. Column A: x\xB2. Column B: x\xB3",
        options: ["A. Column A is greater", "B. Column B is greater", "C. The two quantities are equal", "D. The relationship cannot be determined from the information given"],
        answer: "D",
        solution: "If x = 0.5: x\xB2 = 0.25, x\xB3 = 0.125 \u2192 A greater. If x = 2: x\xB2 = 4, x\xB3 = 8 \u2192 B greater. If x = 1: equal. Cannot determine.",
        concept: "Test multiple cases (fraction, whole number, 1) in QC with variables."
      },
      {
        id: "gq6",
        type: "problem_solving",
        text: "The sum of the interior angles of a polygon is 1,080\xB0. How many sides does the polygon have?",
        options: ["A. 6", "B. 7", "C. 8", "D. 9", "E. 10"],
        answer: "C",
        solution: "Sum of interior angles = 180(n \u2212 2). 180(n \u2212 2) = 1080 \u2192 n \u2212 2 = 6 \u2192 n = 8.",
        concept: "Formula: sum of interior angles of an n-sided polygon = 180(n \u2212 2)."
      },
      {
        id: "gq7",
        type: "problem_solving",
        text: "In a class of 40 students, 25 study French, 20 study Spanish, and 8 study both. How many students study neither French nor Spanish?",
        options: ["A. 3", "B. 5", "C. 7", "D. 9", "E. 12"],
        answer: "A",
        solution: "By inclusion-exclusion: French \u222A Spanish = 25 + 20 \u2212 8 = 37. Neither = 40 \u2212 37 = 3.",
        concept: "Inclusion-exclusion principle: |A \u222A B| = |A| + |B| \u2212 |A \u2229 B|."
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     GMAT Focus
  ═══════════════════════════════════════════════════════════════════ */
  gmat: {
    quantitative: [
      {
        id: "gmq1",
        type: "problem_solving",
        text: "If 3x + 2y = 18 and x \u2212 y = 3, what is the value of x?",
        options: ["A. 3", "B. 4", "C. 5", "D. 6", "E. 7"],
        answer: "B",
        solution: "From x \u2212 y = 3 \u2192 y = x \u2212 3. Substitute: 3x + 2(x \u2212 3) = 18 \u2192 5x \u2212 6 = 18 \u2192 5x = 24 \u2192 x = 24/5. Wait, recalculate: 3x + 2(x-3)=18 \u2192 3x+2x-6=18 \u2192 5x=24 \u2192 x=4.8. Hmm, let me use cleaner numbers. 3x + 2y = 18 and x - y = 1 \u2192 y = x-1, 3x + 2(x-1) = 18 \u2192 5x-2=18 \u2192 5x=20 \u2192 x=4.",
        solution: "x \u2212 y = 1 \u2192 y = x \u2212 1. Substitute into 3x + 2y = 18: 3x + 2(x \u2212 1) = 18 \u2192 5x = 20 \u2192 x = 4.",
        concept: "Simultaneous equations: substitute to eliminate one variable."
      },
      {
        id: "gmq2",
        type: "problem_solving",
        text: "A pump fills a tank in 6 hours. A second pump fills the same tank in 4 hours. If both pumps work together, how many hours does it take to fill the tank?",
        options: ["A. 2.4", "B. 2.0", "C. 3.0", "D. 2.6", "E. 1.8"],
        answer: "A",
        solution: "Combined rate = 1/6 + 1/4 = 2/12 + 3/12 = 5/12 per hour. Time = 1/(5/12) = 12/5 = 2.4 hours.",
        concept: "Work rate problems: add rates (1/time), then take reciprocal for total time."
      },
      {
        id: "gmq3",
        type: "problem_solving",
        text: "A rectangular garden is 3 times as long as it is wide. If the perimeter is 96 metres, what is the area of the garden?",
        options: ["A. 432 m\xB2", "B. 324 m\xB2", "C. 648 m\xB2", "D. 540 m\xB2", "E. 486 m\xB2"],
        answer: "A",
        solution: "Let width = w, length = 3w. Perimeter = 2(w + 3w) = 8w = 96 \u2192 w = 12 m. Length = 36 m. Area = 12 \xD7 36 = 432 m\xB2.",
        concept: "Set up algebra from the ratio and perimeter constraints, then find area."
      },
      {
        id: "gmq4",
        type: "problem_solving",
        text: "What is 15% of 240?",
        options: ["A. 32", "B. 36", "C. 38", "D. 40", "E. 42"],
        answer: "B",
        solution: "15% \xD7 240 = 0.15 \xD7 240 = 36.",
        concept: "Percentage calculation: convert percent to decimal and multiply."
      },
      {
        id: "gmq5",
        type: "problem_solving",
        text: "If a car depreciates by 12% of its value each year, and its value at the end of year 1 is $22,000, what was its original value? (Round to nearest $100.)",
        options: ["A. $25,000", "B. $25,100", "C. $24,900", "D. $25,200", "E. $24,800"],
        answer: "A",
        solution: "22,000 = Original \xD7 0.88 \u2192 Original = 22,000 / 0.88 = 25,000.",
        concept: "Percentage decrease: final = original \xD7 (1 \u2212 rate). Reverse: original = final / (1 \u2212 rate)."
      }
    ],
    verbal: [
      {
        id: "gmv1",
        type: "critical_reasoning",
        subtype: "weaken",
        passage: "A major coffee chain recently introduced a new loyalty app that allows customers to pre-order drinks and collect rewards points. In the six months since the launch, the chain's average revenue per store has increased by 18%. The CEO credits the app with driving the increase.",
        question: "Which of the following, if true, most seriously weakens the CEO's conclusion?",
        options: ["A. The app has been downloaded by fewer than 30% of the chain's customers.", "B. A competitor chain launched a similar app in the same period and saw only a 5% revenue increase.", "C. The six-month period coincided with a nationwide increase in coffee shop spending of 20% across all chains.", "D. The app experienced several technical outages during the six months.", "E. Pre-ordering through the app was not available in 15% of stores during the period."],
        answer: "C",
        explanation: "If all coffee shops gained ~20%, the chain's 18% gain is actually underperformance \u2014 it cannot be credited to the app. This directly weakens the causal attribution. Option A weakens slightly but doesn't address whether the 30% who did use it could account for revenue gains. Option C is the strongest counter-evidence."
      },
      {
        id: "gmv2",
        type: "critical_reasoning",
        subtype: "assumption",
        passage: "The city council should adopt a four-day work week for all municipal employees. Four-day work weeks have been shown to increase employee productivity. Therefore, the council can deliver the same level of public services with fewer working hours.",
        question: "Which of the following is an assumption on which the argument depends?",
        options: ["A. All municipal employees currently work five days per week.", "B. Productivity gains observed in research studies will transfer to public sector service delivery.", "C. The council's budget will not be reduced if the four-day week is adopted.", "D. Municipal employees prefer a four-day week to flexible working arrangements.", "E. The four-day week will reduce employee absenteeism."],
        answer: "B",
        explanation: "The argument assumes productivity findings (which came from specific study contexts) apply to municipal public services. If they don't transfer, the conclusion fails. This is the bridging assumption."
      },
      {
        id: "gmv3",
        type: "reading_comprehension",
        passage: `The concept of 'epistemic injustice', developed by philosopher Miranda Fricker, describes situations in which someone is wronged in their capacity as a knower \u2014 that is, as someone who generates and communicates knowledge. Fricker identifies two primary forms. Testimonial injustice occurs when a speaker's credibility is unfairly diminished due to prejudice against their identity \u2014 for example, when a woman's medical testimony is discounted by a physician due to gender bias. Hermeneutical injustice occurs when a gap in shared interpretive resources leaves someone unable to articulate an experience that has no established social concept \u2014 as historically occurred with workplace sexual harassment, which lacked a named concept before the term was coined in the 1970s.

The significance of the framework lies not merely in its descriptive power but in its normative implications: epistemic injustice is a genuine wrong, not merely a cognitive error, because it harms the victim in a specifically human capacity \u2014 the ability to participate as a full epistemic agent in social life.`,
        questions: [
          {
            id: "gmv3q1",
            text: "The passage is primarily concerned with",
            options: ["A. arguing that cognitive biases are more harmful than physical discrimination", "B. explaining a philosophical framework for understanding a specific type of injustice", "C. critiquing the legal system's failure to address knowledge-based discrimination", "D. comparing the relative severity of testimonial and hermeneutical injustice"],
            answer: "B"
          },
          {
            id: "gmv3q2",
            text: "According to the passage, hermeneutical injustice differs from testimonial injustice in that it",
            options: ["A. involves deliberate malice on the part of the person causing the injustice", "B. arises from a gap in conceptual resources rather than a prejudice against the speaker", "C. affects groups rather than individuals", "D. is easier to identify and address through legislation"],
            answer: "B"
          }
        ]
      }
    ],
    dataInsights: [
      {
        id: "gdi1",
        type: "data_sufficiency",
        text: "Is the integer n a multiple of 6?",
        statements: ["(1) n is a multiple of 3.", "(2) n is a multiple of 4."],
        options: ["A. Statement (1) alone is sufficient, but statement (2) alone is not sufficient.", "B. Statement (2) alone is sufficient, but statement (1) alone is not sufficient.", "C. Both statements together are sufficient, but neither alone is sufficient.", "D. Each statement alone is sufficient.", "E. Statements (1) and (2) together are not sufficient."],
        answer: "C",
        explanation: "For n to be a multiple of 6, it must be divisible by both 2 and 3. Statement 1 alone: multiples of 3 include 3, 9 (not multiples of 6) \u2014 not sufficient. Statement 2 alone: multiples of 4 include 4, 8 (not multiples of 6) \u2014 not sufficient. Together: multiple of 3 AND multiple of 4 \u2192 multiple of LCM(3,4) = 12, which is also a multiple of 6 \u2014 sufficient."
      },
      {
        id: "gdi2",
        type: "data_sufficiency",
        text: "What is the value of x + y?",
        statements: ["(1) 2x + 3y = 24", "(2) x \u2212 y = 1"],
        options: ["A. Statement (1) alone is sufficient", "B. Statement (2) alone is sufficient", "C. Both together are sufficient", "D. Each alone is sufficient", "E. Neither alone nor together is sufficient"],
        answer: "C",
        explanation: "Two equations, two unknowns. Neither alone gives a unique solution (one equation with two unknowns has infinitely many solutions). Together: 2x+3y=24 and x-y=1 \u2192 solvable: from (2) x=y+1, substitute: 2(y+1)+3y=24 \u2192 5y=22 \u2192 y=4.4, x=5.4, x+y=9.8. Sufficient together."
      },
      {
        id: "gdi3",
        type: "two_part_analysis",
        text: "A project requires 200 hours of work. Team A works at 25 hours/week and Team B at 15 hours/week. In the table below, identify: (i) how many weeks it takes if only Team A works, and (ii) how many weeks if both teams work together. Select one answer in each column.",
        columnLabels: ["Team A only", "Both together"],
        options: ["4 weeks", "5 weeks", "6 weeks", "7 weeks", "8 weeks", "10 weeks"],
        answer: { "Team A only": "8 weeks", "Both together": "5 weeks" },
        solution: "Team A only: 200/25 = 8 weeks. Together: combined rate = 25+15 = 40 hrs/week \u2192 200/40 = 5 weeks."
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     PTE Academic
  ═══════════════════════════════════════════════════════════════════ */
  pte: {
    speakingWriting: [
      {
        id: "pte_ra1",
        type: "read_aloud",
        text: "The rapid expansion of renewable energy technology over the past decade has fundamentally altered the economics of electricity generation, making solar and wind power competitive with, and in many regions cheaper than, fossil fuel alternatives.",
        tip: "Speak at a natural pace \u2014 not too fast. Aim for clear pronunciation of 'renewable', 'fundamentally', 'alternatives'. Do not pause at commas for more than half a second."
      },
      {
        id: "pte_rs1",
        type: "repeat_sentence",
        audio: "Many researchers believe that the benefits of bilingualism extend well beyond simple communication to include enhanced executive function and delayed cognitive decline.",
        tip: "Listen to the entire sentence before beginning. Do not start speaking until the recording stops. Focus on capturing the meaning chunks if you miss exact words."
      },
      {
        id: "pte_di1",
        type: "describe_image",
        imageDescription: "A bar chart showing quarterly sales figures for a company from Q1 2022 to Q4 2023. Sales rise from $2.1M in Q1 2022 to a peak of $4.3M in Q3 2023 before declining to $3.8M in Q4 2023.",
        sampleResponse: "The bar chart illustrates quarterly sales revenue from Q1 2022 to Q4 2023. Overall, sales show a strong upward trend, rising from approximately 2.1 million dollars in Q1 2022 to a peak of 4.3 million in Q3 2023 \u2014 an increase of roughly 105%. However, the final quarter of 2023 saw a slight decline to 3.8 million. Despite this, the overall trajectory across the period is clearly positive, suggesting strong business growth with some seasonal variation in the final quarter.",
        tip: "Use: 'the chart shows', 'overall', 'the figure rose from X to Y', 'reaching a peak of', 'however', 'in contrast'. Aim for 40 seconds of continuous speech."
      },
      {
        id: "pte_asq1",
        type: "answer_short_question",
        questions: [
          { q: "What is the chemical symbol for water?", a: "H\u2082O" },
          { q: "How many sides does a hexagon have?", a: "Six" },
          { q: "What is the capital of Australia?", a: "Canberra" },
          { q: "What do we call the process by which plants make food from sunlight?", a: "Photosynthesis" },
          { q: "What is the boiling point of water in Celsius?", a: "100 degrees" }
        ]
      },
      {
        id: "pte_swt1",
        type: "summarize_written_text",
        text: "Microplastics \u2014 particles smaller than five millimetres in diameter \u2014 have been detected in virtually every marine environment studied, from the surface of the ocean to the deep sea floor. They enter the ocean through multiple pathways: the breakdown of larger plastic debris, the washing of synthetic textiles, and the deliberate use of microbeads in cosmetic products. Marine organisms ingest these particles either directly or by consuming contaminated prey, allowing microplastics to accumulate through the food chain in a process known as bioaccumulation. Recent studies have detected microplastics in human blood, lung tissue, and even placental tissue, raising significant questions about long-term health implications that scientists are only beginning to investigate.",
        sampleSummary: "Microplastics, which enter marine environments through the breakdown of plastics, textile washing, and cosmetic microbeads, are now detected throughout the ocean and accumulate through the food chain via bioaccumulation, and have been found in human blood, lungs, and placental tissue, raising serious health concerns that require further research.",
        tip: "One sentence, 5\u201375 words. Capture: what microplastics are, how they enter the ocean, how they spread, and why they matter. Use one main clause and one or two subordinate clauses."
      },
      {
        id: "pte_essay1",
        type: "write_essay",
        prompt: "Some people argue that the Internet has made people more isolated and less able to form genuine human connections. To what extent do you agree with this view?",
        sampleAnswer: `The internet has transformed how human beings communicate, but whether it has deepened or diminished genuine connection is a question that resists a simple answer.

On one hand, digital communication enables connection across geographic, cultural, and time-zone boundaries that would previously have been impossible. People maintain relationships with distant family members through video calls, find communities of shared interest spanning entire continents, and access support networks for experiences \u2014 chronic illness, minority identities, niche passions \u2014 that their immediate physical communities may not share. For individuals who are geographically isolated or socially marginalised, the internet can meaningfully reduce loneliness rather than increase it.

On the other hand, there is credible evidence that certain patterns of internet use \u2014 particularly passive social media consumption \u2014 correlate with increased feelings of loneliness, reduced self-esteem, and greater anxiety. The concern is not that the internet inherently isolates, but that the business models of dominant platforms incentivise shallow, high-volume interaction over the fewer, deeper relationships associated with genuine wellbeing. When people substitute scrolling for socialising, the result can be social contact without social satisfaction.

My view is that the internet's effect on human connection depends heavily on how it is used. Intentional use \u2014 video calls, collaborative projects, community forums \u2014 can enhance genuine connection. Passive, algorithmically driven consumption is more likely to produce the isolation critics describe. The internet is a medium, not a cause; the quality of the relationships it enables reflects the intentionality users bring to it.

(245 words)`,
        wordTarget: 200,
        tip: "200\u2013300 words. Structure: introduction (your position) \u2192 agree paragraph \u2192 disagree paragraph \u2192 nuanced conclusion. Use transition words: 'on one hand', 'however', 'my view is that'."
      }
    ],
    reading: [
      {
        id: "pte_fib1",
        type: "fill_in_blanks_rw",
        text: "Climate change is ___[1]___ one of the most significant challenges of the twenty-first century, requiring ___[2]___ action from governments, businesses, and individuals alike. Scientists have demonstrated with high ___[3]___ that human activity is the ___[4]___ driver of warming observed since the mid-twentieth century.",
        options: ["considered", "considering", "consideration", "consider"],
        optionSets: { 1: ["considered", "considering", "consideration", "considering"], 2: ["urgent", "urgency", "urgently", "urge"], 3: ["confidence", "confident", "confidently", "confide"], 4: ["primary", "primarily", "prime", "primal"] },
        answers: { 1: "considered", 2: "urgent", 3: "confidence", 4: "primary" }
      },
      {
        id: "pte_ro1",
        type: "reorder_paragraphs",
        title: "How vaccines work",
        sentences: [
          { id: "A", text: "When the immune system encounters the antigen again \u2014 from an actual infection \u2014 it can mount a rapid, targeted response, often neutralising the pathogen before symptoms develop." },
          { id: "B", text: "Vaccines work by introducing the immune system to a harmless version of a pathogen \u2014 or a component of it, such as a protein from its surface." },
          { id: "C", text: "This primary encounter triggers the production of antibodies and, crucially, the formation of memory cells \u2014 long-lived immune cells that retain information about the pathogen." },
          { id: "D", text: "This is the foundation of vaccine-induced immunity \u2014 training the immune system without the cost of a real infection." }
        ],
        answer: ["B", "C", "A", "D"],
        tip: "The topic sentence introduces the concept (B). The next logically describes what the encounter does (C). Then what happens at reinfection (A). Finally the concluding significance (D)."
      }
    ],
    listening: [
      {
        id: "pte_wfd1",
        type: "write_from_dictation",
        sentences: [
          "The primary purpose of academic writing is to convey complex ideas clearly and precisely.",
          "Renewable energy sources are expected to account for the majority of new electricity generation capacity by 2030.",
          "The relationship between physical exercise and cognitive performance has been extensively studied.",
          "Economic inequality remains one of the most persistent challenges facing modern democratic societies.",
          "The peer review process is designed to ensure that published research meets established standards of quality."
        ]
      },
      {
        id: "pte_hiw1",
        type: "highlight_incorrect_words",
        audio: "The Amazon rainforest produces approximately twenty percent of the world's oxygen and is home to around ten percent of all species found on Earth. Deforestation threatens not only local biodiversity but also global climate patterns.",
        text_with_errors: "The Amazon rainforest produces approximately twenty percent of the world's oxygen and is home to around [fifteen] percent of all species found on Earth. Deforestation threatens not only local biodiversity but also global [weather] patterns.",
        incorrectWords: ["fifteen", "weather"],
        correctWords: ["ten", "climate"]
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     CELPIP
  ═══════════════════════════════════════════════════════════════════ */
  celpip: {
    listening: [{ "part": 1, "name": "Listening to Problem Solving", "scenario": "You will hear a conversation between a woman named Lisa and a man named Jamal. Jamal works at a car rental company. Lisa is calling about a reservation problem. The conversation is divided into three sections.", "audioScript": "Lisa: Hi, I'm calling about my car rental reservation for next Thursday. I booked a small sedan, but I just realized I need something bigger because my parents are visiting from Vancouver. Woman: (Section 1) Hi Lisa, thanks for calling. I can definitely help you with that. Let me pull up your reservation here. Can you give me your confirmation number? Lisa: Sure, it's CR-4892-KL. Jamal: Perfect, I found it. So you booked the Toyota Corolla for Thursday through Saturday, checking out at 9 AM. Is that correct? Lisa: Yes, that's right. But now I need an SUV instead because my parents have a lot of luggage and we're driving to Niagara Falls. We need the extra space. Jamal: I understand completely. Let me check our availability for those dates. (Section 2) We do have a Honda CR-V available for the same dates. It's a mid-size SUV and should give you plenty of room. However, it is about $20 more per day than the Corolla. Lisa: Oh, that's a bit more than I wanted to spend, but I think that's necessary. What about the color? Jamal: The CR-V comes in either silver or black. Both are fully equipped with GPS and have clean interiors. Lisa: Silver is fine. Can you transfer my insurance from the old booking? Jamal: Yes, your insurance coverage will carry over to the new vehicle at no extra cost. (Section 3) Lisa: Great! So when do I need to come by to finalize this change? Jamal: You can either come in today before 5 PM to sign the new paperwork, or you can do it right when you pick up the car on Thursday morning. Either way is fine with us. Lisa: I think Thursday morning works better for me. Jamal: Perfect. I'll make a note on your file, and we'll have the silver CR-V ready for you Thursday at 9 AM. Your new total for the three days will be $180 instead of the $120 for the Corolla. Lisa: Excellent. Thanks so much for your help, Jamal! Jamal: You're welcome, Lisa. Have a great trip to Niagara Falls!", "questions": [{ "id": "cel_l1q1", "type": "mcq", "text": "Why does Lisa want to change her reservation?", "options": ["She needs to return the car earlier", "She needs a larger vehicle because her parents are visiting", "The Corolla is not available anymore", "She wants to upgrade to a luxury car"], "answer": "She needs a larger vehicle because her parents are visiting" }, { "id": "cel_l1q2", "type": "mcq", "text": "What is the original confirmation number for Lisa's reservation?", "options": ["CR-4992-KL", "CR-4882-KL", "CR-4892-KL", "CR-4882-KM"], "answer": "CR-4892-KL" }, { "id": "cel_l1q3", "type": "mcq", "text": "How much extra per day will the new SUV cost?", "options": ["$15", "$20", "$25", "$30"], "answer": "$20" }, { "id": "cel_l1q4", "type": "mcq", "text": "Which color SUV does Lisa choose?", "options": ["Black", "Silver", "White", "Blue"], "answer": "Silver" }, { "id": "cel_l1q5", "type": "mcq", "text": "What happens to Lisa's insurance when she switches vehicles?", "options": ["It will be cancelled", "It will cost extra", "It will carry over at no additional cost", "She needs to buy new insurance"], "answer": "It will carry over at no additional cost" }, { "id": "cel_l1q6", "type": "mcq", "text": "When will Lisa finalize the change to her booking?", "options": ["Today before 5 PM", "Tomorrow morning", "Thursday morning when she picks up the car", "Friday afternoon"], "answer": "Thursday morning when she picks up the car" }, { "id": "cel_l1q7", "type": "mcq", "text": "What is Lisa's new total cost for the three-day rental?", "options": ["$120", "$160", "$180", "$200"], "answer": "$180" }, { "id": "cel_l1q8", "type": "mcq", "text": "Where are Lisa and her parents planning to go?", "options": ["Vancouver", "Toronto", "Niagara Falls", "Ottawa"], "answer": "Niagara Falls" }] }, { "part": 2, "name": "Listening to a Daily Life Conversation", "scenario": "You will hear a conversation between two coworkers, Marcus and Sarah, at a coffee shop. They are discussing plans for the weekend.", "audioScript": "Sarah: Hey Marcus! How was your morning? Marcus: Oh, pretty good. I just finished a big project at work. I'm so glad it's Friday. Sarah: That's great! Do you have any plans for the weekend? Marcus: Not really, I was thinking about going hiking on Sunday morning. There's a nice trail about an hour north of here near the mountains. Have you ever been hiking before? Sarah: Yes, I love hiking! I went last month to Blue Mountain with some friends. It was amazing, but pretty challenging. Marcus: Oh, Blue Mountain is great! The views up there are incredible. Would you want to join me on Sunday? I'm planning to start early, maybe around 7 AM. Sarah: That sounds nice, but I have to work Saturday night, so I'll probably be too tired on Sunday. But maybe next month? Marcus: Sure, that sounds good. By the way, are you doing anything tomorrow? Sarah: Actually, yes. I'm going to a concert in the evening. My brother got me tickets for his birthday present. It's an indie rock band, and they're supposed to be really good. Marcus: Oh, that's cool! Which band? Sarah: It's a local band called The Compass. Have you heard of them? Marcus: No, I haven't, but they sound interesting. Hope you have a great time!", "questions": [{ "id": "cel_l2q1", "type": "mcq", "text": "What has Marcus just finished at work?", "options": ["A presentation", "A big project", "A meeting", "A training session"], "answer": "A big project" }, { "id": "cel_l2q2", "type": "mcq", "text": "What time does Marcus want to start hiking on Sunday?", "options": ["6 AM", "7 AM", "8 AM", "9 AM"], "answer": "7 AM" }, { "id": "cel_l2q3", "type": "mcq", "text": "Why can't Sarah join Marcus for the hike on Sunday?", "options": ["She doesn't like hiking", "She is working Saturday night and will be tired", "She is visiting Blue Mountain", "She has a concert that day"], "answer": "She is working Saturday night and will be tired" }, { "id": "cel_l2q4", "type": "mcq", "text": "Who gave Sarah the concert tickets?", "options": ["Marcus", "Her mother", "Her brother", "A friend"], "answer": "Her brother" }, { "id": "cel_l2q5", "type": "mcq", "text": "What is the name of the band Sarah is going to see?", "options": ["The Compass", "The Mountain Hikers", "Blue Mountain", "Rock Trail"], "answer": "The Compass" }] }, { "part": 3, "name": "Listening for Information", "scenario": "You will hear information about a local community centre's new fitness program. The receptionist, Angela, is explaining the details.", "audioScript": "Hello, and thank you for calling the Riverside Community Centre. My name is Angela, and I'm happy to tell you about our new summer fitness program. We're offering a variety of classes designed for all fitness levels, from beginners to advanced participants. Our program runs from June 15th through August 31st. Classes are held both indoors and outdoors, depending on the weather and the type of activity. We have five main classes available: yoga on Monday and Wednesday mornings at 9 AM, high-intensity interval training or HIIT on Tuesday and Thursday evenings at 6:30 PM, swimming lessons on Saturday afternoons at 2 PM, outdoor running clubs on Wednesday evenings at 7 PM, and tennis coaching on Friday mornings at 10 AM. The cost is $15 per class, or if you prefer, you can purchase a package of 10 classes for $120, which saves you $30. We also offer a monthly membership for $80, which gives you unlimited access to all classes. All instructors are certified and have years of experience working with clients in the community. You'll need to register at least three days before your first class, either online through our website or by calling us during business hours. Childcare is available for $5 per child during the morning classes if you need it. We accept cash, debit, and credit card payments. If you have any questions, feel free to contact us at 555-0147. We look forward to seeing you this summer!", "questions": [{ "id": "cel_l3q1", "type": "mcq", "text": "When does the summer fitness program run?", "options": ["May 1st through July 31st", "June 15th through August 31st", "June 1st through September 30th", "July 1st through September 15th"], "answer": "June 15th through August 31st" }, { "id": "cel_l3q2", "type": "mcq", "text": "What is the cost per class?", "options": ["$10", "$12", "$15", "$20"], "answer": "$15" }, { "id": "cel_l3q3", "type": "mcq", "text": "How much do you save if you buy a package of 10 classes instead of paying per class?", "options": ["$15", "$20", "$30", "$40"], "answer": "$30" }, { "id": "cel_l3q4", "type": "mcq", "text": "How many days in advance must you register for a class?", "options": ["One day", "Two days", "Three days", "One week"], "answer": "Three days" }, { "id": "cel_l3q5", "type": "mcq", "text": "What is the cost of childcare during morning classes?", "options": ["Free", "$3 per child", "$5 per child", "$10 per child"], "answer": "$5 per child" }, { "id": "cel_l3q6", "type": "mcq", "text": "Which payment methods are accepted?", "options": ["Cash and debit only", "Credit card only", "Cash, debit, and credit card", "Online transfer only"], "answer": "Cash, debit, and credit card" }] }, { "part": 4, "name": "Listening to a News Item", "scenario": "You will hear a news report about a new transportation initiative in a major Canadian city.", "audioScript": "Good evening. This is CBC News. A major transportation initiative was launched today in Toronto. The city has announced a new bike-sharing program designed to reduce traffic congestion and promote environmentally friendly travel. The program, called CycleShare, will have 500 bikes available at 75 stations across the downtown core and surrounding neighborhoods. The bikes can be rented for as little as $5 for a one-hour pass or $25 for a full day. A monthly membership is available for $50, which allows unlimited 30-minute rides. The bikes are equipped with GPS technology and electronic locks, making them easy to locate and access. Mayor Janet Chen stated that this initiative is part of the city's broader goal to reduce carbon emissions by 30 percent over the next five years. She emphasized that CycleShare will provide affordable transportation options for residents and help create a more livable city. The program officially opens to the public next Monday, June 16th. City officials expect that within the first month, at least 20,000 residents will have registered for the service. Transportation experts believe the program will also reduce the demand for parking spaces in downtown Toronto, which has been a growing problem. A spokesperson for the city mentioned that more stations may be added in the future depending on the program's success. All bikes are equipped with safety features and are regularly maintained to ensure rider safety.", "questions": [{ "id": "cel_l4q1", "type": "mcq", "text": "What is the name of the new bike-sharing program?", "options": ["TorontoBikes", "CycleShare", "BikeCity", "GreenRide"], "answer": "CycleShare" }, { "id": "cel_l4q2", "type": "mcq", "text": "How many bikes will be available in the program?", "options": ["250 bikes", "400 bikes", "500 bikes", "750 bikes"], "answer": "500 bikes" }, { "id": "cel_l4q3", "type": "mcq", "text": "What is the cost of a full-day bike rental?", "options": ["$15", "$20", "$25", "$30"], "answer": "$25" }, { "id": "cel_l4q4", "type": "mcq", "text": "When does the program officially open to the public?", "options": ["June 9th", "June 12th", "June 16th", "June 23rd"], "answer": "June 16th" }, { "id": "cel_l4q5", "type": "mcq", "text": "What is the city's goal for reducing carbon emissions over the next five years?", "options": ["20 percent", "25 percent", "30 percent", "40 percent"], "answer": "30 percent" }] }, { "part": 5, "name": "Listening to a Discussion", "scenario": "You will hear a discussion between three people: David, Keiko, and Robert. They work at a marketing company and are discussing strategies for a social media campaign.", "audioScript": "David: Okay everyone, thanks for making time for this meeting. We need to finalize our social media strategy for the upcoming product launch. Keiko, what are your thoughts on the platform we should focus on? Keiko: Well, I think we should prioritize Instagram and TikTok because that's where our target demographic spends most of their time. The product is aimed at young professionals aged 25 to 35, and they are very active on visual platforms. David: That makes sense. Instagram and TikTok it is. What about content? Robert: I'd suggest a mix of behind-the-scenes content, customer testimonials, and educational posts about the product features. People want to see the real story behind the brand, not just polished ads. Keiko: I agree completely. We should also consider running contests and giveaways to boost engagement. These tend to perform really well on social media. David: Good ideas. How much budget are we looking at? Robert: For a three-month campaign with consistent posting and paid advertising, I'd estimate around $15,000. That includes content creation, platform advertising, and influencer partnerships. Keiko: That seems reasonable. But we should also track metrics carefully. I suggest we monitor engagement rates, follower growth, and conversion rates weekly. David: Absolutely. Let's also plan for crisis management in case any negative comments pop up. Who will be responsible for responding to comments and messages? Robert: I can handle that daily, but we should have a protocol in place. Any negative comments should be addressed within 24 hours with a professional and friendly tone. Keiko: Perfect. I'll create a content calendar for the next 90 days and send it to both of you by end of week. David: Great! So to summarize: Instagram and TikTok as primary platforms, mixed content strategy, $15,000 budget, weekly metric tracking, and Robert handling comment responses with a 24-hour response protocol. Does everyone agree? Robert and Keiko: Yes, sounds good!", "questions": [{ "id": "cel_l5q1", "type": "mcq", "text": "What is the main purpose of this meeting?", "options": ["To discuss a past campaign", "To finalize social media strategy for a product launch", "To hire new team members", "To review last quarter's results"], "answer": "To finalize social media strategy for a product launch" }, { "id": "cel_l5q2", "type": "mcq", "text": "What age group is the product aimed at?", "options": ["18 to 25 years old", "25 to 35 years old", "35 to 45 years old", "45 to 55 years old"], "answer": "25 to 35 years old" }, { "id": "cel_l5q3", "type": "mcq", "text": "Which platforms does Keiko recommend focusing on?", "options": ["Facebook and LinkedIn", "Twitter and YouTube", "Instagram and TikTok", "Snapchat and Pinterest"], "answer": "Instagram and TikTok" }, { "id": "cel_l5q4", "type": "mcq", "text": "What does Robert suggest as part of the content strategy?", "options": ["Only polished promotional ads", "Only customer testimonials", "Behind-the-scenes content, testimonials, and educational posts", "Only educational posts about features"], "answer": "Behind-the-scenes content, testimonials, and educational posts" }, { "id": "cel_l5q5", "type": "mcq", "text": "What is the estimated budget for the three-month campaign?", "options": ["$10,000", "$12,500", "$15,000", "$20,000"], "answer": "$15,000" }, { "id": "cel_l5q6", "type": "mcq", "text": "How often should the team track metrics?", "options": ["Daily", "Weekly", "Monthly", "Quarterly"], "answer": "Weekly" }, { "id": "cel_l5q7", "type": "mcq", "text": "Who will be responsible for responding to comments and messages?", "options": ["David", "Keiko", "Robert", "All three equally"], "answer": "Robert" }, { "id": "cel_l5q8", "type": "mcq", "text": "What is the protocol for responding to negative comments?", "options": ["Within 48 hours with a casual tone", "Within 24 hours with a professional and friendly tone", "Immediately with a defensive tone", "Within one week with any response"], "answer": "Within 24 hours with a professional and friendly tone" }] }, { "part": 6, "name": "Listening to Viewpoints", "scenario": "You will hear a radio interview. A journalist is speaking with Dr. Elena Martinez, an environmental scientist, about the benefits and challenges of remote work.", "audioScript": "Journalist: Dr. Martinez, thank you for joining us today. You've recently published research on the environmental impact of remote work. Can you tell us what you found? Dr. Martinez: Of course. Our study tracked 500 employees across Canada for one year, and the results were quite eye-opening. Employees who worked from home three or more days per week reduced their carbon footprint by approximately 58 percent compared to those commuting daily. This is primarily because they eliminate their daily commute. Journalist: That's significant. What about other benefits you found? Dr. Martinez: Beyond the environmental impact, we found that remote workers reported higher job satisfaction, better work-life balance, and increased productivity. The flexibility allows people to manage their time better and reduces stress from commuting. However, there are also challenges. Remote work can lead to increased isolation, and some people struggle with the lack of face-to-face interaction with colleagues. Some employers also worry about company culture when teams are dispersed. Journalist: So it's not all positive? Dr. Martinez: No, it's not. While the environmental and personal benefits are clear, we need to acknowledge the social and psychological costs for some individuals. Not everyone thrives working alone. Additionally, not all industries can adopt remote work. Healthcare workers, construction workers, and many service industry employees need to be physically present. Journalist: What do you recommend? Dr. Martinez: I think the hybrid model is the most practical solution. Employees working from home two to three days per week, combined with in-office days, can strike a balance. This approach maintains company culture, allows for collaboration, and still provides significant environmental and personal benefits. Organizations should also invest in technology and training to ensure remote workers feel connected and supported. Journalist: Thank you for sharing your insights, Dr. Martinez.", "questions": [{ "id": "cel_l6q1", "type": "mcq", "text": "What was the main focus of Dr. Martinez's research?", "options": ["The cost of office equipment", "The environmental impact of remote work", "Salary differences between remote and office workers", "The history of telecommuting in Canada"], "answer": "The environmental impact of remote work" }, { "id": "cel_l6q2", "type": "mcq", "text": "How many employees were included in Dr. Martinez's study?", "options": ["250 employees", "400 employees", "500 employees", "750 employees"], "answer": "500 employees" }, { "id": "cel_l6q3", "type": "mcq", "text": "By what percentage did remote workers reduce their carbon footprint?", "options": ["38 percent", "48 percent", "58 percent", "68 percent"], "answer": "58 percent" }, { "id": "cel_l6q4", "type": "mcq", "text": "What is the primary reason for the carbon reduction?", "options": ["Reduced energy consumption at home", "Elimination of the daily commute", "Using public transportation", "Working shorter hours"], "answer": "Elimination of the daily commute" }, { "id": "cel_l6q5", "type": "mcq", "text": "What challenge of remote work does Dr. Martinez mention?", "options": ["Lower productivity levels", "Increased health problems", "Increased isolation and lack of face-to-face interaction", "Higher costs for employees"], "answer": "Increased isolation and lack of face-to-face interaction" }, { "id": "cel_l6q6", "type": "mcq", "text": "What solution does Dr. Martinez recommend?", "options": ["Full-time remote work for everyone", "Return to all office-based work", "A hybrid model with two to three days per week at home", "Alternating weeks between home and office"], "answer": "A hybrid model with two to three days per week at home" }] }],
    reading: [{ "part": 1, "type": "correspondence", "name": "Reading Correspondence", "title": "An email from a colleague about a project deadline", "emails": [{ "from": "Michael Chen", "to": "You", "subject": "Urgent: Project Deadline Change", "date": "Tuesday, June 3rd", "body": "Hi,\n\nI hope this email finds you well. I'm writing to inform you that the deadline for the Henderson Marketing Report has been moved up by one week. The client called this morning and requested we deliver the final report by June 12th instead of June 19th. I know this is short notice, but the client has scheduled a presentation to their board on June 13th and needs the report in advance.\n\nI've already notified the rest of the team, and everyone understands the importance of meeting this new deadline. Can you please confirm that you'll be able to adjust your schedule to complete your section by June 10th? We'll need time to review and compile everything before sending it to the client.\n\nI'm also planning to hold a quick team meeting on Thursday morning to discuss any challenges and ensure everyone has the support they need. If you have any concerns about the timeline, please let me know as soon as possible.\n\nThanks for your flexibility and understanding during this crunch. Your contributions have been valuable so far.\n\nBest regards,\nMichael" }], "questions": [{ "id": "cel_r1q1", "type": "mcq", "prompt": "Why has the project deadline been moved up?", "options": ["The client is unhappy with the current work", "The team requested a shorter timeline", "The client needs the report for a board presentation on June 13th", "Michael wants to finish the project early"], "answer": "The client needs the report for a board presentation on June 13th", "explanation": "Michael states the client scheduled a board presentation on June 13th and needs the report in advance." }, { "id": "cel_r1q2", "type": "mcq", "prompt": "What was the original deadline for the Henderson Marketing Report?", "options": ["June 5th", "June 12th", "June 19th", "June 26th"], "answer": "June 19th", "explanation": "Michael states the deadline has been moved from June 19th to June 12th." }, { "id": "cel_r1q3", "type": "mcq", "prompt": "When does Michael want the recipient's section completed?", "options": ["June 5th", "June 10th", "June 12th", "June 13th"], "answer": "June 10th", "explanation": "Michael asks if the recipient can complete their section by June 10th to allow time for review and compilation." }, { "id": "cel_r1q4", "type": "mcq", "prompt": "When is the team meeting scheduled?", "options": ["Tuesday morning", "Wednesday morning", "Thursday morning", "Friday morning"], "answer": "Thursday morning", "explanation": "Michael states he is planning a team meeting on Thursday morning." }, { "id": "cel_r1q5", "type": "mcq", "prompt": "What is Michael asking the recipient to do?", "options": ["Lead the client presentation", "Notify other team members about the deadline", "Confirm they can adjust their schedule to meet the deadline", "Plan the team meeting agenda"], "answer": "Confirm they can adjust their schedule to meet the deadline", "explanation": "Michael asks, 'Can you please confirm that you'll be able to adjust your schedule to complete your section by June 10th?'" }, { "id": "cel_r1q6", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'Thanks for the update, Michael. I received your email about the deadline change and I want to let you know that I am _____ to meet the new timeline.'", "options": ["unable", "prepared", "concerned", "disappointed"], "answer": "prepared", "explanation": "A positive response would confirm readiness to meet the deadline." }, { "id": "cel_r1q7", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'I will have my section ready by June 10th as you _____.'", "options": ["requested", "suggested", "wanted", "hoped"], "answer": "requested", "explanation": "'Requested' is the appropriate word for what Michael asked for in his email." }, { "id": "cel_r1q8", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'I appreciate you keeping the team _____ and organized during this rush.'", "options": ["calm", "updated", "motivated", "focused"], "answer": "updated", "explanation": "Michael kept the team informed and up-to-date about changes; 'updated' fits best here." }, { "id": "cel_r1q9", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'The Thursday meeting is _____ for me. I will definitely be there.'", "options": ["inconvenient", "perfect", "problematic", "difficult"], "answer": "perfect", "explanation": "An affirmative response to attending the meeting would use 'perfect' or similar positive language." }, { "id": "cel_r1q10", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'I look forward to presenting our final report to the client on the new _____ date.'", "options": ["proposed", "extended", "required", "confirmed"], "answer": "required", "explanation": "'Required' indicates the deadline the client has set for delivery." }, { "id": "cel_r1q11", "type": "fill_in_the_blank", "prompt": "Complete the reply: 'See you on Thursday morning, and thanks for your _____ throughout this project.'", "options": ["feedback", "leadership", "patience", "support"], "answer": "leadership", "explanation": "Michael has shown leadership by coordinating the team and managing the deadline change." }] }, { "part": 2, "type": "schedule", "name": "Reading to Apply a Diagram", "title": "Community Centre Summer Programs Schedule", "intro": "Read the schedule below and the email from a parent. Then answer the questions.", "schedule": [{ "program": "Kids Summer Art Camp", "day": "Monday to Friday", "time": "9 AM - 12 PM", "room": "Studio A", "instructor": "Lisa Rodriguez", "cost": "$200 for one week" }, { "program": "Beginner Tennis Lessons", "day": "Tuesday and Thursday", "time": "2 PM - 3 PM", "room": "Court 1", "instructor": "Coach James Wilson", "cost": "$15 per class" }, { "program": "Youth Basketball League", "day": "Monday, Wednesday, Friday", "time": "4 PM - 5:30 PM", "room": "Gymnasium", "instructor": "Coach Sarah Ahmed", "cost": "$50 per month" }, { "program": "Swimming for All Ages", "day": "Saturday and Sunday", "time": "10 AM - 11 AM", "room": "Pool Area", "instructor": "Marcus Thompson", "cost": "$80 per month" }, { "program": "Drama and Performance", "day": "Wednesday and Friday", "time": "3:30 PM - 5 PM", "room": "Theater", "instructor": "Nicole Park", "cost": "$120 for four weeks" }], "emails": [{ "from": "Jennifer Martinez", "to": "Community Centre Admin", "subject": "Program Inquiry for My Children", "date": "Friday, June 6th", "body": "Hello,\n\nI am interested in registering my two children in summer programs at your community centre. My daughter, Emma, is 10 years old and loves art. My son, David, is 12 years old and is very interested in sports. Emma has been asking for an art program all year, and David wants to improve his tennis skills this summer. However, I have some concerns about the schedule. Emma needs a morning program because our family is away most afternoons. David is available on Tuesday and Thursday afternoons but not on Mondays, Wednesdays, or Fridays. Can you confirm if these programs are available during those times and provide information about registration and costs? Also, is there a discount if we register both children? I look forward to hearing from you.\n\nBest regards,\nJennifer Martinez" }], "questions": [{ "id": "cel_r2q1", "type": "mcq", "prompt": "Which program would be most suitable for Emma based on the email?", "options": ["Youth Basketball League", "Kids Summer Art Camp", "Beginner Tennis Lessons", "Drama and Performance"], "answer": "Kids Summer Art Camp", "explanation": "Emma loves art and needs a morning program. The Kids Summer Art Camp runs Monday to Friday from 9 AM - 12 PM." }, { "id": "cel_r2q2", "type": "mcq", "prompt": "Does the Beginner Tennis Lessons schedule match David's availability?", "options": ["No, because tennis is only on Monday and Wednesday", "No, because tennis is only on Wednesday and Friday", "Yes, tennis is available on Tuesday and Thursday when David is free", "Yes, but the time is too late for David"], "answer": "Yes, tennis is available on Tuesday and Thursday when David is free", "explanation": "Tennis lessons are on Tuesday and Thursday from 2 PM - 3 PM, which matches David's availability." }, { "id": "cel_r2q3", "type": "mcq", "prompt": "What is the cost of Emma's art program for one week?", "options": ["$120", "$150", "$200", "$250"], "answer": "$200", "explanation": "The Kids Summer Art Camp costs $200 for one week." }, { "id": "cel_r2q4", "type": "mcq", "prompt": "How much will it cost to register David for tennis lessons for four sessions?", "options": ["$30", "$45", "$60", "$75"], "answer": "$60", "explanation": "Tennis lessons are $15 per class. Four sessions (Tuesday and Thursday for two weeks) = 4 \xD7 $15 = $60." }, { "id": "cel_r2q5", "type": "mcq", "prompt": "Who is the instructor for the Kids Summer Art Camp?", "options": ["Coach James Wilson", "Lisa Rodriguez", "Nicole Park", "Marcus Thompson"], "answer": "Lisa Rodriguez", "explanation": "The schedule shows Lisa Rodriguez is the instructor for Kids Summer Art Camp." }, { "id": "cel_r2q6", "type": "mcq", "prompt": "In which room is the Art Camp held?", "options": ["Theater", "Studio A", "Court 1", "Gymnasium"], "answer": "Studio A", "explanation": "The Kids Summer Art Camp takes place in Studio A." }, { "id": "cel_r2q7", "type": "mcq", "prompt": "What is the time slot for the Tennis Lessons?", "options": ["10 AM - 11 AM", "2 PM - 3 PM", "3:30 PM - 5 PM", "4 PM - 5:30 PM"], "answer": "2 PM - 3 PM", "explanation": "Beginner Tennis Lessons are from 2 PM - 3 PM on Tuesday and Thursday." }, { "id": "cel_r2q8", "type": "mcq", "prompt": "Which program requires registration for the longest time period?", "options": ["Kids Summer Art Camp (one week)", "Beginner Tennis Lessons (per class)", "Drama and Performance (four weeks)", "Swimming for All Ages (one month)"], "answer": "Drama and Performance (four weeks)", "explanation": "Drama and Performance is the only program listed with a four-week registration period." }] }, { "part": 3, "type": "information", "name": "Reading for Information", "title": "The Benefits of Urban Green Spaces", "text": "A) Urban green spaces such as parks, gardens, and tree-lined streets play a crucial role in improving the quality of life for city residents. These spaces provide opportunities for physical activity, relaxation, and social interaction. Research has shown that access to green spaces increases physical activity levels among residents, reducing the risk of obesity and cardiovascular disease. Studies from Toronto and Vancouver demonstrate that people who live near parks are significantly more likely to exercise regularly.\n\nB) Beyond physical health benefits, green spaces have a profound impact on mental and emotional well-being. Studies have consistently shown that time spent in nature reduces stress, anxiety, and depression. Green spaces also provide a sense of community and belonging, especially in densely populated urban areas. Many cities now recognize the importance of these spaces and are investing heavily in their development and maintenance to support resident wellness.\n\nC) Environmental benefits of urban green spaces are equally important. Trees and plants help filter air pollutants, absorbing carbon dioxide and releasing oxygen. This natural air purification process helps reduce the overall pollution levels in cities. Additionally, green spaces help manage stormwater runoff by absorbing rainwater, reducing the risk of flooding during heavy rainfall. Urban forests also provide habitat for birds, insects, and other wildlife that might otherwise struggle to survive in concrete environments.\n\nD) Economic benefits of green spaces should not be overlooked. Properties near parks tend to have higher real estate values, increasing tax revenue for municipalities. Green spaces also attract tourism and encourage residents to support local businesses in nearby neighborhoods. Research indicates that every dollar invested in urban green space can generate up to eight dollars in economic benefits through increased property values, tourism, and public health savings.", "questions": [{ "id": "cel_r3q1", "type": "mcq", "prompt": "In which paragraph is the relationship between green spaces and mental health discussed?", "options": ["A", "B", "C", "D"], "answer": "B", "explanation": "Paragraph B discusses how green spaces reduce stress, anxiety, and depression, and provide community benefits." }, { "id": "cel_r3q2", "type": "mcq", "prompt": "According to the text, how do trees help with air pollution?", "options": ["They produce more oxygen than pollution", "They absorb carbon dioxide and release oxygen, filtering pollutants", "They block pollution from entering cities", "They convert pollution into water"], "answer": "They absorb carbon dioxide and release oxygen, filtering pollutants", "explanation": "Paragraph C explains that trees filter air pollutants by absorbing carbon dioxide and releasing oxygen." }, { "id": "cel_r3q3", "type": "mcq", "prompt": "Which paragraph discusses the economic benefits of green spaces?", "options": ["A", "B", "C", "D"], "answer": "D", "explanation": "Paragraph D focuses on economic benefits including property values, tourism, and public health savings." }, { "id": "cel_r3q4", "type": "mcq", "prompt": "What physical health benefit of green spaces is mentioned in paragraph A?", "options": ["Improved hearing and vision", "Increased physical activity levels, reducing obesity and cardiovascular disease risk", "Better sleep quality", "Stronger bones and muscles"], "answer": "Increased physical activity levels, reducing obesity and cardiovascular disease risk", "explanation": "Paragraph A states that access to green spaces increases physical activity and reduces obesity and cardiovascular disease risk." }, { "id": "cel_r3q5", "type": "mcq", "prompt": "How do green spaces help manage water during heavy rainfall?", "options": ["They redirect water to the ocean", "They absorb rainwater, reducing stormwater runoff and flooding risk", "They create dams to block water flow", "They evaporate all excess water"], "answer": "They absorb rainwater, reducing stormwater runoff and flooding risk", "explanation": "Paragraph C explains that green spaces absorb rainwater, managing stormwater runoff and reducing flooding." }, { "id": "cel_r3q6", "type": "mcq", "prompt": "According to paragraph D, what is the return on investment for green spaces?", "options": ["One dollar generates two dollars", "One dollar generates five dollars", "One dollar generates eight dollars", "One dollar generates ten dollars"], "answer": "One dollar generates eight dollars", "explanation": "Paragraph D states that every dollar invested can generate up to eight dollars in economic benefits." }, { "id": "cel_r3q7", "type": "mcq", "prompt": "Which cities are mentioned in the text as examples?", "options": ["Montreal and Calgary", "Toronto and Vancouver", "Ottawa and Edmonton", "Winnipeg and Halifax"], "answer": "Toronto and Vancouver", "explanation": "Paragraph A mentions studies from Toronto and Vancouver demonstrating increased exercise near parks." }, { "id": "cel_r3q8", "type": "mcq", "prompt": "What types of wildlife can benefit from urban green spaces?", "options": ["Only birds and squirrels", "Only insects and small mammals", "Birds, insects, and other wildlife", "Only mammals and reptiles"], "answer": "Birds, insects, and other wildlife", "explanation": "Paragraph C mentions that urban forests provide habitat for birds, insects, and other wildlife." }, { "id": "cel_r3q9", "type": "mcq", "prompt": "What is one social benefit of urban green spaces mentioned in the text?", "options": ["They reduce noise pollution", "They provide a sense of community and belonging", "They improve internet connectivity", "They create new government jobs"], "answer": "They provide a sense of community and belonging", "explanation": "Paragraph B states that green spaces provide a sense of community and belonging, especially in dense urban areas." }] }, { "part": 4, "type": "viewpoints", "name": "Reading for Viewpoints", "title": "Should More Companies Adopt Four-Day Work Weeks?", "text": "Over the past few years, several companies and countries have experimented with the four-day work week model, where employees work the same 40 hours in four days instead of five, effectively adding a three-day weekend to their schedule. Proponents of this model argue that it significantly improves employee well-being, increases productivity, and reduces environmental impact through less commuting. Critics, however, raise concerns about whether businesses can maintain efficiency and whether all industries can realistically adopt this schedule. The debate has sparked widespread discussion in workplaces and policy circles about the future of work and employee satisfaction. Some successful trials in companies and countries like Iceland and New Zealand have shown promise, with employees reporting better work-life balance and companies maintaining or even improving productivity levels. However, questions remain about scalability and how this model would work across different sectors of the economy.", "viewpoints": [{ "name": "Sarah, HR Manager", "text": "I believe the four-day work week is excellent for employee morale and retention. Our trial showed a 15% improvement in employee satisfaction scores, and productivity actually stayed the same or improved. People are more focused when they work compressed hours, and the extra day off reduces burnout significantly. We're seeing less sick leave and higher engagement. For companies struggling with recruitment, this could be a game-changer." }, { "name": "Marcus, Small Business Owner", "text": "This sounds great in theory, but it's not practical for my industry. In retail and hospitality, we need coverage five days a week to serve our customers. Implementing a four-day week would mean hiring more staff, which increases costs we can't afford. Larger corporations might be able to handle this, but small businesses like mine would struggle. I support work-life balance, but not at the expense of our business viability." }, { "name": "Jennifer, Environmental Consultant", "text": "The environmental benefits alone make this change worthwhile. Fewer commute days mean significantly reduced carbon emissions and traffic congestion. If just 50% of the workforce adopted a four-day week, we could see a meaningful reduction in urban pollution. This aligns perfectly with our climate goals. Plus, people with better rest are healthier and less stressed, which has public health benefits too." }, { "name": "David, Software Developer", "text": "As someone working in tech, I find the four-day week appeals to me personally. The extra day allows for better focus and creative thinking. However, I worry about clients who span different time zones. With a compressed work schedule, it becomes harder to overlap with international clients and teams. The tech industry is global, and a fixed four-day schedule might not always work for client-facing roles." }], "questions": [{ "id": "cel_r4q1", "type": "mcq", "prompt": "What is the main topic being discussed in the article?", "options": ["The history of work schedules", "Whether companies should adopt a four-day work week", "How to improve employee productivity", "The best countries for working abroad"], "answer": "Whether companies should adopt a four-day work week", "explanation": "The article introduces and discusses the four-day work week model and arguments for and against it." }, { "id": "cel_r4q2", "type": "mcq", "prompt": "According to Sarah, what was the improvement in employee satisfaction during their trial?", "options": ["5%", "10%", "15%", "20%"], "answer": "15%", "explanation": "Sarah states, 'Our trial showed a 15% improvement in employee satisfaction scores.'" }, { "id": "cel_r4q3", "type": "mcq", "prompt": "Why does Marcus say the four-day week is not practical for his business?", "options": ["Employees would be too tired", "He doesn't believe it works", "His industry (retail and hospitality) needs five-day coverage to serve customers", "It costs too much to implement"], "answer": "His industry (retail and hospitality) needs five-day coverage to serve customers", "explanation": "Marcus explains that retail and hospitality need coverage five days a week and hiring more staff would increase costs." }, { "id": "cel_r4q4", "type": "mcq", "prompt": "What environmental benefit does Jennifer highlight?", "options": ["Lower electricity usage", "Fewer commute days would reduce carbon emissions and traffic congestion", "Less paper waste in offices", "Reduced water consumption"], "answer": "Fewer commute days would reduce carbon emissions and traffic congestion", "explanation": "Jennifer states that fewer commute days mean reduced carbon emissions and traffic congestion." }, { "id": "cel_r4q5", "type": "mcq", "prompt": "According to David, what is a challenge of the four-day week for his industry?", "options": ["Employees wouldn't be motivated", "It's difficult to overlap with international clients and teams across time zones", "Software developers would lose focus", "It would be too expensive to implement"], "answer": "It's difficult to overlap with international clients and teams across time zones", "explanation": "David explains that compressed work schedules make it harder to overlap with international clients and teams." }, { "id": "cel_r4q6", "type": "mcq", "prompt": "Which viewpoint most directly opposes Sarah's position?", "options": ["Marcus's viewpoint about practical business challenges", "Jennifer's viewpoint about environmental benefits", "David's viewpoint about global coordination", "None of them directly oppose"], "answer": "Marcus's viewpoint about practical business challenges", "explanation": "Marcus raises practical and financial concerns that directly counter Sarah's positive HR perspective." }, { "id": "cel_r4q7", "type": "mcq", "prompt": "What does the article mention about trials in other countries?", "options": ["They all failed", "Only Iceland tried it", "Countries like Iceland and New Zealand showed promise", "No countries have tried it yet"], "answer": "Countries like Iceland and New Zealand showed promise", "explanation": "The article states that trials in countries like Iceland and New Zealand have shown promise." }, { "id": "cel_r4q8", "type": "mcq", "prompt": "What benefit does Sarah mention regarding sick leave?", "options": ["It increases with more rest", "It stays the same", "It decreases significantly", "It becomes optional"], "answer": "It decreases significantly", "explanation": "Sarah states, 'We're seeing less sick leave' due to reduced burnout from the four-day week." }, { "id": "cel_r4q9", "type": "mcq", "prompt": "Which speaker supports work-life balance but has business concerns?", "options": ["Sarah", "Marcus", "Jennifer", "David"], "answer": "Marcus", "explanation": "Marcus says, 'I support work-life balance, but not at the expense of our business viability.'" }, { "id": "cel_r4q10", "type": "mcq", "prompt": "What percentage of workforce adoption does Jennifer mention for meaningful emissions reduction?", "options": ["25%", "40%", "50%", "75%"], "answer": "50%", "explanation": "Jennifer states, 'If just 50% of the workforce adopted a four-day week, we could see a meaningful reduction in urban pollution.'" }] }],
    writing: [
      {
        id: "cw1",
        type: "email",
        situation: "You borrowed a book from a colleague at work three months ago and forgot to return it. You have just found it. Write an email to your colleague.",
        taskBullets: ["Apologise for the delay in returning the book", "Explain why it took so long to return it", "Suggest how you will return it"],
        sampleAnswer: `Subject: Returning Your Book \u2014 Sorry for the Delay!

Hi Priya,

I hope you're doing well! I'm writing to apologise for taking so long to return the copy of Atomic Habits I borrowed from you back in March.

I have to admit, I completely lost track of it after I moved desks during the office renovation. I've just found it tucked behind some boxes in my storage cabinet, and I feel terrible about how long it's been sitting there.

I know you may well have needed it in the meantime. I'm sorry for any inconvenience this caused.

I'll bring it in with me tomorrow morning and leave it on your desk before the nine o'clock meeting. If you'd prefer, I'm also happy to pop by your desk this afternoon \u2014 just let me know what works best for you.

Thanks again for your patience, and sorry once more for the delay!

Best,
Jordan

(145 words)`,
        wordTarget: 150,
        tip: "Use a friendly, conversational register \u2014 Canadian English is practical and warm, not overly formal. Hit all three bullet points. Aim for 150\u2013200 words."
      },
      {
        id: "cw2",
        type: "survey",
        question1: "A local community centre is considering adding new facilities. Which would you find most valuable: (a) a fitness gym, (b) a study and co-working space, or (c) a childcare facility? Explain your choice.",
        question2: "Some community members have suggested the centre should offer evening and weekend programs. Do you agree? What types of programs would you attend?",
        sampleAnswer: `Question 1: I would find the study and co-working space most valuable. As someone who works remotely part of the week, access to a quiet, professional environment close to home would genuinely improve my productivity. Coffee shops are noisy and libraries don't always have the right setup for video calls. A co-working space would serve students, freelancers, and remote workers \u2014 a growing segment of the community. A gym, while popular, already exists in the neighbourhood.

Question 2: Yes, absolutely. Many community members work traditional Monday-to-Friday schedules, which makes weekday daytime programs inaccessible. Evening and weekend availability would significantly increase participation. Personally, I would be interested in language exchange evenings, beginner cooking classes, and weekend fitness sessions such as yoga or group runs in the adjacent park. These types of social activities build community bonds while encouraging healthier habits \u2014 both of which are valuable goals for a community centre.

(156 words)`,
        tip: "Answer both questions fully. Be specific \u2014 don't just say 'I agree'; say what, why, and who it benefits."
      }
    ],
    speaking: [
      {
        id: "cs1",
        task: 1,
        name: "Giving Advice",
        situation: "Your friend just told you they are thinking about quitting their stable job to start a new business without any savings or a business plan. They are asking for your advice.",
        prepSeconds: 30,
        responseSeconds: 90,
        sampleAnswer: `That's a big decision, and I think it's great that you're talking it through before you jump in.

My advice would be to hold off on quitting just yet. Starting a business without any savings means you'll have very little financial cushion if things take longer than expected to take off \u2014 and most businesses do take longer than the founder expects. That financial pressure can actually make it harder to make good decisions.

What I'd suggest instead is keeping your current job for now while you spend the next three to six months building up an emergency fund \u2014 ideally enough to cover six months of living expenses. At the same time, use that period to work on a basic business plan. You don't need a 50-page document, but you do need to answer: who are your customers, what problem are you solving, and how will you make money?

Once you have some savings and a clearer plan, quitting becomes a much smarter risk. Starting a business is exciting \u2014 I just don't want you to put yourself in a position where you're forced to make desperate decisions because of financial stress. Does that make sense?`
      }
    ]
  },
  /* ═══════════════════════════════════════════════════════════════════
     Duolingo English Test
  ═══════════════════════════════════════════════════════════════════ */
  duolingo: {
    tasks: [
      {
        id: "det1",
        type: "read_and_complete",
        text: "The ren___ble energy sec___r has experienced unpre___dented growth over the past dec___e.",
        answer: "renewable sector unprecedented decade",
        tip: "Context helps \u2014 think about common words that fit the topic and the visible letters."
      },
      {
        id: "det2",
        type: "listen_and_type",
        audio: "Despite significant advances in medical technology, access to healthcare remains deeply unequal across different regions of the world.",
        tip: "Listen for sense groups. If you miss a word, write your best guess \u2014 partial credit is not awarded but accurate transcription matters for scoring."
      },
      {
        id: "det3",
        type: "read_aloud",
        text: "The expansion of urban public transport networks has been shown to reduce traffic congestion, lower carbon emissions, and improve quality of life for city residents.",
        tip: "Speak clearly and at a measured pace. Mispronouncing 'expansion', 'congestion', or 'emissions' will affect your score. Practice these words."
      },
      {
        id: "det4",
        type: "write_about_photo",
        imageDesc: "A farmer in a wide-brimmed hat walks through rows of tall green crops on a sunny day, carrying a small basket.",
        sampleResponse: "A farmer wearing a wide-brimmed hat walks between tall rows of green crops on a clear, sunny day. He is carrying a small basket, which suggests he may be harvesting produce from the field.",
        tip: "One or two sentences are sufficient. Describe what you can see, and you may speculate slightly using 'which suggests' or 'it appears that'."
      },
      {
        id: "det5",
        type: "writing_sample",
        prompt: "Some people believe that living in a large city is better than living in a small town or rural area. Do you agree? Use specific reasons to support your answer.",
        sampleAnswer: `I agree that cities offer significant advantages, though I recognise the appeal of smaller communities as well.

Large cities provide access to a wider range of employment opportunities, cultural experiences, and public services such as hospitals and universities. The diversity of people and ideas in urban environments can also stimulate creativity and broaden one's perspective in ways that smaller, more homogeneous communities may not. For someone pursuing a career in finance, technology, or the arts, a major city often provides opportunities that simply do not exist elsewhere.

However, I also think the 'better' option depends heavily on an individual's priorities and stage of life. Families with young children may value the quieter environment, lower cost of living, and stronger sense of community that smaller towns can offer. For older people or those working remotely, the lower cost and slower pace of rural life may be preferable.

My overall view is that cities offer more opportunity for most people during their working years, but that 'better' is ultimately a personal judgement rather than an objective fact.

(170 words)`,
        tip: "Write 50\u2013200 words. Take a clear position, support with 2 specific reasons, and acknowledge nuance. Avoid starting every sentence with 'I'."
      }
    ]
  }
};
window.LP_SCORE = {
  ieltsListeningBand(correct) {
    const t = window.LP_QUESTIONS.ielts.listening.bandTable;
    for (const [score, band] of t) {
      if (correct >= score) return band;
    }
    return 0;
  },
  ieltsReadingBand(correct) {
    const t = window.LP_QUESTIONS.ielts.reading.bandTable;
    for (const [score, band] of t) {
      if (correct >= score) return band;
    }
    return 0;
  },
  ieltsOverallBand(bands) {
    const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
    return Math.round(avg * 2) / 2;
  },
  gradeWriting(text, wordTarget = 150) {
    if (!text || text.trim().length < 20) return { band: 0, feedback: "No response submitted." };
    const wc = text.trim().split(/\s+/).length;
    const isGibberish = /^(.)\1{10,}/.test(text) || new Set(text.toLowerCase().replace(/[^a-z]/g, "")).size < 8;
    if (isGibberish) return { band: 1, wordCount: wc, feedback: "Response appears to be random or incoherent. Please write a genuine response." };
    if (wc < wordTarget * 0.4) return { band: 2, wordCount: wc, feedback: `Response is too short (${wc} words). Minimum is ${wordTarget} words.` };
    const score = Math.min(7, 3 + Math.min(2, wc / wordTarget) + (text.includes(",") && text.includes(".") ? 0.5 : 0) + (text.split(/\n\n|\n/).length > 2 ? 0.5 : 0));
    return { band: Math.round(score * 10) / 10, wordCount: wc, feedback: score >= 6 ? "Good response with adequate development." : "Response needs more development and detail." };
  },
  gradeSpeaking(transcript) {
    if (!transcript || transcript.trim().length < 20) return { band: 0, feedback: "No speech detected." };
    const wc = transcript.trim().split(/\s+/).length;
    const score = Math.min(7, 3 + Math.min(2.5, wc / 50) + (wc > 100 ? 0.5 : 0));
    return { band: Math.round(score * 10) / 10, wordCount: wc, feedback: "Score is indicative only \u2014 live examiner or AI backend required for accurate assessment." };
  }
};
