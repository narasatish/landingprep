/**
 * rebuild-ielts-listening-local.js
 * Rebuilds IELTS Listening tests 001-030 with:
 *   - 40 questions per test (Parts 1-4, 10 each)
 *   - Part 1: Form completion (form_field questions with rich layout)
 *   - Part 2: MCQ (Qs 11-15) + Map/Plan labelling (Qs 16-20)
 *   - Part 3: MCQ + Matching/Categorise
 *   - Part 4: Sentence completion + MCQ
 * Run: node tools/rebuild-ielts-listening-local.js
 */
"use strict";
const fs = require("fs"), path = require("path");

const OUT_DIR = path.join(__dirname, "../content/ielts/listening");

// ─── PART 1 SCENARIOS ────────────────────────────────────────────────────────
const P1_SCENARIOS = [
  {
    title: "Booking a Language Course",
    script: `Agent: Good morning, City Language Centre, how can I help you?\nCaller: Hi, I'd like to book a place on one of your English courses.\nAgent: Of course. Can I take your full name please?\nCaller: Yes, it's Margaret Thornton. That's T-H-O-R-N-T-O-N.\nAgent: And a contact telephone number?\nCaller: 07823 441 096.\nAgent: Which course are you interested in?\nCaller: The advanced writing course. I saw it starts on the fourteenth of March.\nAgent: That's correct — it runs for eight weeks on Tuesday evenings from seven to nine pm. The fee is two hundred and forty pounds, which includes all materials.\nCaller: That's fine. Do I need to bring anything to the first session?\nAgent: Just a notepad. The course is held in Room 14 on the second floor. There's a lift if you need it.\nCaller: Perfect. And is there a registration deadline?\nAgent: We ask people to register at least five days before the start date. So no later than the ninth of March.\nCaller: Great, I'll pay by card now if that's alright.\nAgent: Of course. I'll email you a confirmation and the joining instructions to the address we have on file.`,
    form: {
      title: "City Language Centre — Enrolment Form",
      example: { label: "Contact name", content: "Ms Sandra Webb" },
      rows: [
        { type: "prefilled", label: "Course applied for", content: "Advanced Writing" },
        { type: "blank", num: 1, label: "Applicant surname", prefix: "", suffix: "", answer: "Thornton" },
        { type: "blank", num: 2, label: "Telephone number", prefix: "", suffix: "", answer: "07823 441 096" },
        { type: "blank", num: 3, label: "Start date", prefix: "", suffix: " March", answer: "14th" },
        { type: "blank", num: 4, label: "Duration", prefix: "", suffix: " weeks", answer: "eight / 8" },
        { type: "blank", num: 5, label: "Course fee", prefix: "£", suffix: "", answer: "240" },
        { type: "blank", num: 6, label: "Class times", prefix: "", suffix: " to 9 pm", answer: "7 / seven" },
        { type: "blank", num: 7, label: "Room", prefix: "Room ", suffix: "", answer: "14" },
        { type: "blank", num: 8, label: "Registration deadline", prefix: "9th ", suffix: "", answer: "March" },
        { type: "blank", num: 9, label: "Item to bring to first class", prefix: "", suffix: "", answer: "notepad" },
        { type: "blank", num: 10, labelBlank: true, labelSuffix: " method", rightContent: "card / by card", answer: "Payment" }
      ]
    }
  },
  {
    title: "Enquiry About a Sports Centre Membership",
    script: `Receptionist: Hello, Riverside Sports Centre, Jessica speaking.\nCaller: Hi, I'm calling about a gym membership.\nReceptionist: Happy to help. Can I take your name?\nCaller: It's David Kowalczyk. K-O-W-A-L-C-Z-Y-K.\nReceptionist: Thank you, David. And your date of birth?\nCaller: Fourteenth of June, 1989.\nReceptionist: We offer three membership types: monthly at fifty-five pounds, six-monthly at three hundred, or annual at five hundred and twenty pounds.\nCaller: I'll go for the six-monthly option.\nReceptionist: Great. The membership gives you unlimited access to the gym, swimming pool, and all fitness classes. Towels are provided, but you'll need to bring your own padlock for the lockers.\nCaller: Is there parking?\nReceptionist: Yes, free for members in the rear car park. Enter via Elm Street. Your membership card will be ready to collect from Friday. Could I take an email address for the confirmation?\nCaller: Yes — david.k at greenmail dot net.\nReceptionist: Perfect. Is there anything else I can help with?\nCaller: No, that's everything, thank you.`,
    form: {
      title: "Riverside Sports Centre — Membership Form",
      example: { label: "Membership duration", content: "monthly" },
      rows: [
        { type: "blank", num: 1, label: "Member surname", prefix: "", suffix: "", answer: "Kowalczyk" },
        { type: "blank", num: 2, label: "Date of birth", prefix: "14th June ", suffix: "", answer: "1989" },
        { type: "blank", num: 3, label: "Membership chosen", prefix: "", suffix: "-monthly", answer: "six" },
        { type: "blank", num: 4, label: "Total cost", prefix: "£", suffix: "", answer: "300" },
        { type: "blank", num: 5, label: "Item to bring", prefix: "own ", suffix: "", answer: "padlock" },
        { type: "blank", num: 6, label: "Parking area", prefix: "", suffix: " car park", answer: "rear" },
        { type: "blank", num: 7, labelBlank: true, labelSuffix: " entrance road", rightContent: "Elm Street", answer: "Parking" },
        { type: "blank", num: 8, label: "Card ready from", prefix: "", suffix: "", answer: "Friday" },
        { type: "blank", num: 9, label: "Email", prefix: "", suffix: "@greenmail.net", answer: "david.k" },
        { type: "blank", num: 10, label: "Swimming pool access", prefix: "", suffix: "", answer: "yes / included" }
      ]
    }
  },
  {
    title: "Arranging a Home Repair Service",
    script: `Operator: QuickFix Home Services, how can I help?\nCustomer: Hello, I need someone to repair a broken boiler.\nOperator: Of course. Name and address please?\nCustomer: Anna Petrov. 47 Chestnut Avenue, Barton, postcode BT4 8LD.\nOperator: And a contact number?\nCustomer: 01622 793 450.\nOperator: What type of boiler is it?\nCustomer: A gas combi boiler. The brand is Vaillant.\nOperator: When did it stop working?\nCustomer: Yesterday evening — around seven o'clock.\nOperator: We can send an engineer tomorrow between nine and twelve. The call-out fee is sixty-five pounds. Parts are extra if needed.\nCustomer: That's fine.\nOperator: Our engineer's name is Marcus Webb. He'll call thirty minutes before arriving. Do you need a parking permit?\nCustomer: No, there's free parking on the road.\nOperator: Perfect. You'll receive a text confirmation within the hour.`,
    form: {
      title: "QuickFix Home Services — Service Request Form",
      example: { label: "Service category", content: "boiler / plumbing / electrical" },
      rows: [
        { type: "blank", num: 1, label: "Customer name", prefix: "", suffix: "", answer: "Anna Petrov" },
        { type: "blank", num: 2, label: "House number", prefix: "", suffix: " Chestnut Avenue", answer: "47" },
        { type: "blank", num: 3, label: "Postcode", prefix: "", suffix: "", answer: "BT4 8LD" },
        { type: "blank", num: 4, label: "Contact telephone", prefix: "", suffix: "", answer: "01622 793 450" },
        { type: "blank", num: 5, label: "Boiler fuel type", prefix: "", suffix: " combi", answer: "gas" },
        { type: "blank", num: 6, label: "Boiler brand", prefix: "", suffix: "", answer: "Vaillant" },
        { type: "blank", num: 7, label: "Appointment window", prefix: "9 am to ", suffix: " pm", answer: "12" },
        { type: "blank", num: 8, label: "Call-out fee", prefix: "£", suffix: "", answer: "65" },
        { type: "blank", num: 9, labelBlank: true, labelSuffix: "'s name", rightContent: "Marcus Webb", answer: "Engineer" },
        { type: "blank", num: 10, label: "Confirmation method", prefix: "", suffix: "", answer: "text / text message" }
      ]
    }
  },
  {
    title: "Museum Tour Booking",
    script: `Museum: National History Museum, good afternoon.\nVisitor: Hello, I'd like to book a guided tour for a school group.\nMuseum: Of course. What date were you thinking?\nVisitor: The twenty-second of April, a Thursday.\nMuseum: And how many students?\nVisitor: Twenty-eight students, plus three adults.\nMuseum: Our school rate is four pounds fifty per student and adults are free. The tour lasts ninety minutes and covers ancient civilisations, natural history, and the special Victorian exhibition.\nVisitor: Wonderful. Should we arrive at the main entrance?\nMuseum: Yes — the North Gate on Pemberton Road. Please arrive fifteen minutes early. Bring a copy of your booking reference. May I take the school's name?\nVisitor: Greenfield Primary School.\nMuseum: And the lead teacher's name?\nVisitor: Mr. Stephen Adeyemi. A-D-E-Y-E-M-I.\nMuseum: Lovely. I'll email the confirmation to the school address. Will you need lunch facilities?\nVisitor: Yes please — we'll need the picnic area reserved.\nMuseum: Noted. I'll add that to the booking.`,
    form: {
      title: "National History Museum — Group Visit Booking",
      example: { label: "Visit type", content: "guided tour / self-guided" },
      rows: [
        { type: "blank", num: 1, label: "Visit date", prefix: "", suffix: " April", answer: "22nd / 22" },
        { type: "blank", num: 2, label: "Day of visit", prefix: "", suffix: "", answer: "Thursday" },
        { type: "blank", num: 3, label: "Number of students", prefix: "", suffix: "", answer: "28" },
        { type: "prefilled", label: "Number of adult supervisors", content: "3" },
        { type: "blank", num: 4, label: "Cost per student", prefix: "£", suffix: "", answer: "4.50" },
        { type: "blank", num: 5, label: "Tour duration", prefix: "", suffix: " minutes", answer: "90" },
        { type: "blank", num: 6, label: "Arrival gate", prefix: "", suffix: " Gate", answer: "North" },
        { type: "blank", num: 7, label: "Required to bring", prefix: "booking ", suffix: "", answer: "reference" },
        { type: "blank", num: 8, label: "School name", prefix: "", suffix: " Primary School", answer: "Greenfield" },
        { type: "blank", num: 9, labelBlank: true, labelSuffix: " teacher surname", rightContent: "Mr. Adeyemi", answer: "Lead" },
        { type: "blank", num: 10, label: "Lunch facility requested", prefix: "", suffix: " area", answer: "picnic" }
      ]
    }
  },
  {
    title: "Library Membership and Book Loan",
    script: `Librarian: Central Library, how can I assist you?\nCaller: I'd like to register for a library card and ask about borrowing rules.\nLibrarian: Of course. Your full name please?\nCaller: Patricia Osei. O-S-E-I.\nLibrarian: And your address?\nCaller: Flat 3, 18 Maple Street, Thornton, TH6 2PQ.\nLibrarian: Date of birth?\nCaller: Second of August, 1994.\nLibrarian: Our standard membership is free and allows you to borrow up to eight items at a time. Loans are for three weeks with one free renewal. Audiobooks and e-books are also available through our app.\nCaller: Are there fines for late returns?\nLibrarian: Ten pence per day for standard loans, twenty pence for reserved items.\nCaller: Can I reserve books online?\nLibrarian: Yes, through the library portal. There's a reservation fee of fifty pence per item. Your card will be ready to collect tomorrow from the information desk.`,
    form: {
      title: "Central Library — New Membership Form",
      example: { label: "Annual membership fee", content: "free" },
      rows: [
        { type: "blank", num: 1, label: "Surname", prefix: "", suffix: "", answer: "Osei" },
        { type: "blank", num: 2, label: "Address", prefix: "Flat 3, 18 ", suffix: ", Thornton", answer: "Maple Street" },
        { type: "blank", num: 3, label: "Postcode", prefix: "", suffix: "", answer: "TH6 2PQ" },
        { type: "blank", num: 4, label: "Date of birth", prefix: "2nd August ", suffix: "", answer: "1994" },
        { type: "blank", num: 5, label: "Maximum items allowed", prefix: "up to ", suffix: " items", answer: "8 / eight" },
        { type: "blank", num: 6, label: "Standard loan period", prefix: "", suffix: " weeks", answer: "3 / three" },
        { type: "blank", num: 7, labelBlank: true, labelSuffix: " fine per day", rightContent: "10p / 10 pence", answer: "Standard" },
        { type: "blank", num: 8, label: "Reserved item fine (per day)", prefix: "", suffix: "p", answer: "20 / twenty" },
        { type: "blank", num: 9, label: "Online reservation fee", prefix: "", suffix: "p per item", answer: "50 / fifty" },
        { type: "blank", num: 10, label: "Card collection point", prefix: "", suffix: "", answer: "information desk" }
      ]
    }
  }
];

// ─── PART 2 SCENARIOS ────────────────────────────────────────────────────────
const P2_SCENARIOS = [
  {
    title: "Tour of Riverside Community Centre",
    script: `Guide: Good morning everyone, and welcome to Riverside Community Centre. I'll be giving you a brief overview of the facilities and then we'll do a short tour of the building.\n\nAs you come in through the main entrance on Bridge Street, immediately to your left is the reception desk where staff can help with all enquiries and room bookings. Directly ahead of you, past the reception, is the main hall, which is used for events and community meetings. It can seat up to two hundred people.\n\nIf you turn right at reception, you'll find the café, which serves hot and cold food from eight in the morning until four in the afternoon. Next to the café, at the end of the corridor, is the children's activity room, which is open on weekday afternoons.\n\nOn your left as you walk down the main corridor are two meeting rooms — Room A and Room B — available for hire. At the far end of the building, overlooking the riverside garden, is the fitness studio, which runs yoga and pilates classes. The garden itself is accessible through the double doors next to the fitness studio.\n\nUpstairs, you'll find the computer suite with twenty workstations, the art room for community workshops, and the library corner with a reading area. The lift is located beside the staircase near the main entrance.\n\nNow let me take you on a brief tour. Please follow me through the main hall...`,
    mcqs: [
      { prompt: "What is the maximum seating capacity of the main hall?", options: ["150", "200", "250", "300"], answer: "B", explanation: "The guide states 'it can seat up to two hundred people'" },
      { prompt: "What time does the café close?", options: ["3 pm", "4 pm", "5 pm", "6 pm"], answer: "B", explanation: "The café serves food 'until four in the afternoon'" },
      { prompt: "When is the children's activity room open?", options: ["weekend mornings", "all day weekdays", "weekday afternoons", "weekends only"], answer: "C", explanation: "The guide says it is 'open on weekday afternoons'" },
      { prompt: "How many workstations are in the computer suite?", options: ["10", "15", "20", "25"], answer: "C", explanation: "The guide mentions 'twenty workstations'" },
      { prompt: "Where is the lift located?", options: ["next to the fitness studio", "near the main entrance", "beside the art room", "opposite the café"], answer: "B", explanation: "The guide says the lift is 'beside the staircase near the main entrance'" }
    ],
    mapTitle: "Riverside Community Centre — Ground Floor Plan",
    mapDescription: "The map shows the ground floor. The main entrance is at the bottom. Label rooms A–J.",
    mapItems: [
      { label: "A", description: "Room immediately left of main entrance", answer: "Reception" },
      { label: "B", description: "Large room directly ahead past reception", answer: "Main hall" },
      { label: "C", description: "Room to the right of reception", answer: "Café" },
      { label: "D", description: "Room at end of right corridor, next to café", answer: "Children's activity room" },
      { label: "E", description: "First meeting room on left corridor", answer: "Room A (meeting room)" },
      { label: "F", description: "Second meeting room, adjacent to E", answer: "Room B (meeting room)" },
      { label: "G", description: "Room at far end, overlooking garden", answer: "Fitness studio" },
      { label: "H", description: "Outdoor space accessible from fitness studio", answer: "Riverside garden" },
      { label: "I", description: "Space upstairs with computers", answer: "Computer suite" },
      { label: "J", description: "Creative workshop space upstairs", answer: "Art room" }
    ]
  },
  {
    title: "University Campus Orientation",
    script: `Student Guide: Welcome to Greenfield University. Let me walk you through the main buildings you'll need to know about.\n\nWhen you arrive at the main gate on University Avenue, the building directly in front of you is the Administration Block — that's where you register, pay fees, and collect your student ID. To the left of the Admin Block is the library, open from eight am to ten pm Monday to Friday. It has four floors of study space and over two hundred computers.\n\nBehind the Admin Block, follow the path to reach the Science Building — that's where labs and lecture theatres for biology, chemistry, and physics are located. To the right of the Science Building is the Engineering Hub, a newer building opened just two years ago with state-of-the-art workshops.\n\nHeading back towards the main gate and taking the right-hand path, you'll reach the Student Union building — that's the social hub of campus, with a café, a gym, a cinema room, and offices for all student societies. Next to the Student Union, slightly further along, is the Health Centre — all students are registered automatically upon enrolment.\n\nAt the western edge of campus are the student accommodation blocks — Acorn Hall, Birch Hall, and Cedar Hall, named in alphabetical order from north to south. The sports fields are on the eastern side of campus, behind the Engineering Hub. And the Chaplaincy and meditation space is tucked away in the gardens between the Library and the Science Building.\n\nAny questions so far? No? Good — let's continue to the Admin Block first.`,
    mcqs: [
      { prompt: "What is the library's closing time on weekdays?", options: ["8 pm", "9 pm", "10 pm", "11 pm"], answer: "C", explanation: "The guide says the library is 'open from eight am to ten pm Monday to Friday'" },
      { prompt: "How many floors of study space does the library have?", options: ["two", "three", "four", "five"], answer: "C", explanation: "The guide mentions 'four floors of study space'" },
      { prompt: "When was the Engineering Hub opened?", options: ["last year", "two years ago", "five years ago", "ten years ago"], answer: "B", explanation: "The guide says 'opened just two years ago'" },
      { prompt: "What is automatically provided when students enrol?", options: ["library card", "sports membership", "Health Centre registration", "Student Union membership"], answer: "C", explanation: "The guide says 'all students are registered automatically upon enrolment' at the Health Centre" },
      { prompt: "Where are the sports fields located?", options: ["western edge of campus", "northern edge", "behind the Engineering Hub", "beside the library"], answer: "C", explanation: "Sports fields are 'on the eastern side of campus, behind the Engineering Hub'" }
    ],
    mapTitle: "Greenfield University — Campus Map",
    mapDescription: "Label the buildings and facilities A–J on the campus map.",
    mapItems: [
      { label: "A", description: "Building directly in front of main gate", answer: "Administration Block" },
      { label: "B", description: "Building to left of Admin Block", answer: "Library" },
      { label: "C", description: "Building behind Admin Block", answer: "Science Building" },
      { label: "D", description: "Building to right of Science Building", answer: "Engineering Hub" },
      { label: "E", description: "Social hub building on right path from main gate", answer: "Student Union" },
      { label: "F", description: "Building next to Student Union", answer: "Health Centre" },
      { label: "G", description: "Northernmost accommodation block", answer: "Acorn Hall" },
      { label: "H", description: "Middle accommodation block", answer: "Birch Hall" },
      { label: "I", description: "Southernmost accommodation block", answer: "Cedar Hall" },
      { label: "J", description: "Space between Library and Science Building", answer: "Chaplaincy / Meditation garden" }
    ]
  },
  {
    title: "Nature Reserve Visitor Centre",
    script: `Ranger: Good morning and welcome to Blackwood Nature Reserve. I'm Ranger Clarke, and I'll be giving you an overview of what's on offer here today.\n\nAs you enter the reserve through the main gate, the Visitor Centre is immediately on your right. Inside, you'll find interactive displays about local wildlife, a gift shop, and toilets. We ask all visitors to sign in at reception before exploring.\n\nFrom the Visitor Centre, there are three walking trails marked in different colours. The yellow trail is the shortest — about one kilometre — and is fully paved, making it suitable for wheelchairs and pushchairs. It takes you past Heron Pond, where you can spot herons and kingfishers from the viewing platform at the water's edge.\n\nThe blue trail is three kilometres and takes roughly ninety minutes. It winds through the ancient oak woodland and leads to the Badger Watch Hide, which is particularly active at dawn and dusk. Dogs must be kept on leads along this section.\n\nThe red trail is our most challenging — six kilometres, taking around three hours. It climbs to the ridge viewpoint where on clear days you can see four counties. There's a shelter with picnic benches at the halfway point. Walking boots are strongly recommended.\n\nThe Meadow Café, serving hot drinks and light lunches, is located beyond the Visitor Centre, beside the car park. It closes at four thirty. Emergency services can be reached at the warden's station, which is near the start of the blue trail. Please remember — no fires, no litter, and no picking of plants.\n\nEnjoy your visit!`,
    mcqs: [
      { prompt: "What must visitors do before exploring the reserve?", options: ["pay an entry fee", "sign in at reception", "collect a trail map", "watch a safety video"], answer: "B", explanation: "The ranger says 'We ask all visitors to sign in at reception'" },
      { prompt: "Which trail is suitable for wheelchairs?", options: ["red trail", "blue trail", "yellow trail", "all trails"], answer: "C", explanation: "The yellow trail is 'fully paved, making it suitable for wheelchairs and pushchairs'" },
      { prompt: "When is the Badger Watch Hide most active?", options: ["midday", "afternoon", "dawn and dusk", "after dark"], answer: "C", explanation: "The hide is 'particularly active at dawn and dusk'" },
      { prompt: "What can be seen from the ridge viewpoint?", options: ["three counties", "four counties", "the sea", "the city skyline"], answer: "B", explanation: "On clear days 'you can see four counties'" },
      { prompt: "What time does the Meadow Café close?", options: ["3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm"], answer: "C", explanation: "The café 'closes at four thirty'" }
    ],
    mapTitle: "Blackwood Nature Reserve — Site Map",
    mapDescription: "Label the locations A–J on the reserve map.",
    mapItems: [
      { label: "A", description: "First building on right after main gate", answer: "Visitor Centre" },
      { label: "B", description: "Water feature past yellow trail", answer: "Heron Pond" },
      { label: "C", description: "Platform at water's edge for birdwatching", answer: "Viewing platform" },
      { label: "D", description: "Wooded area on blue trail", answer: "Oak woodland" },
      { label: "E", description: "Structure for watching wildlife on blue trail", answer: "Badger Watch Hide" },
      { label: "F", description: "High point at end of red trail", answer: "Ridge viewpoint" },
      { label: "G", description: "Shelter with seats at halfway point of red trail", answer: "Picnic shelter" },
      { label: "H", description: "Café location beside car park", answer: "Meadow Café" },
      { label: "I", description: "Emergency services point near blue trail start", answer: "Warden's station" },
      { label: "J", description: "Area where yellow trail passes birds", answer: "Kingfisher viewing area" }
    ]
  },
  {
    title: "Tour of International Airport Terminal 2",
    script: `Guide: Good morning everyone and welcome to the orientation tour of Terminal 2 at International Airport. My name is Sandra and I'll be your guide for the next thirty minutes. Whether you're a new member of airport staff, a travel agent, or simply a visitor who'd like to know the terminal better, I hope this tour gives you a really thorough understanding of the layout and services available here.\n\nSo, let's begin at the very beginning — the check-in zone. This is labelled Zone A on your map. Zone A is located on the ground floor and contains sixty self-service check-in kiosks as well as twenty-four staffed desks. The desks are open from four in the morning until eleven at night, seven days a week. Adjacent to Zone A you'll see the bag-drop counters which are exclusively for passengers who have already checked in online.\n\nFrom the check-in zone, passengers proceed to Zone B — the security screening area. This is the busiest part of the terminal during peak hours. On average, security processing takes under fifteen minutes, though we recommend passengers allow thirty minutes during the morning rush, typically between six and nine am. Zone B has eight security lanes, two of which are designated as fast-track lanes for premium passengers.\n\nOnce through security, passengers enter Zone C — the departure lounge. This is a large open area with seating for over three hundred passengers. You'll find a variety of restaurants and cafés here, ranging from quick snack bars to full sit-down restaurants. There is also a children's play zone in the eastern corner.\n\nDirectly off the departure lounge, to your right as you face the gates, is Zone D — the duty-free shopping area. This covers approximately two thousand square metres and features over forty retail units selling perfume, cosmetics, electronics, confectionery, and luxury goods. The duty-free zone opens as soon as the terminal opens and closes thirty minutes before the last departure of the day.\n\nPast the duty-free zone, passengers proceed into Zone E — the gate area, specifically gates G1 through to G15. Gate G7 is worth noting as it is the dedicated gate for wide-body aircraft, meaning long-haul flights to destinations such as North America, the Gulf, and Southeast Asia primarily depart from here. Each gate has its own seating area and boarding information screens.\n\nNow, between the business lounge and the medical centre, you will find Zone F — the prayer room and reflection space. This quiet room is open to passengers of all faiths and none, twenty-four hours a day. It is non-denominational and provides a calm environment away from the bustle of the terminal. Prayer mats and directional guidance are available inside.\n\nSpeaking of which, Zone G is the business lounge — situated on the mezzanine level above the departure lounge. Access is restricted to premium passengers and holders of certain frequent flyer cards. The lounge offers complimentary food and beverages, shower facilities, and a quiet working area with private pods. Guests may bring a maximum of two bags into the lounge.\n\nZone H is the medical centre, located near the eastern end of the terminal on the ground floor. It is staffed by qualified paramedics around the clock. The centre handles everything from minor first-aid needs to more serious medical situations. An automated external defibrillator is also located directly outside the medical centre entrance.\n\nZone I is the information desk, positioned centrally within the departure lounge for easy access. Staff here can assist with lost property, flight information, terminal navigation, and accessibility requests. This is also where you can collect pre-booked wheelchair assistance.\n\nFinally, Zone J — baggage reclaim — is on the ground floor of the arrivals hall, accessed via a separate set of lifts and escalators from the departure level. There are twelve baggage carousels and the average wait time from landing to baggage collection is approximately twenty-two minutes.\n\nAre there any questions before we begin the walk-through? No? Excellent — let's start at Zone A.`,
    mcqs: [
      { prompt: "What is the maximum number of bags allowed into the business lounge?", options: ["1", "2", "3", "4"], answer: "B", explanation: "The guide states 'Guests may bring a maximum of two bags into the lounge'" },
      { prompt: "How long does security processing typically take?", options: ["under 5 minutes", "under 10 minutes", "under 15 minutes", "under 30 minutes"], answer: "C", explanation: "The guide says 'security processing takes under fifteen minutes'" },
      { prompt: "What is located next to the duty-free shopping area?", options: ["the check-in zone", "the departure lounge", "the medical centre", "the prayer room"], answer: "B", explanation: "The duty-free zone is 'directly off the departure lounge'" },
      { prompt: "Which gate is specifically mentioned as serving wide-body aircraft?", options: ["G1", "G7", "G10", "G15"], answer: "B", explanation: "The guide says 'Gate G7 is the dedicated gate for wide-body aircraft'" },
      { prompt: "Where is the prayer room located?", options: ["between the café and the departure lounge", "between the business lounge and medical centre", "next to the information desk", "above the check-in zone"], answer: "B", explanation: "The guide says the prayer room is 'between the business lounge and the medical centre'" }
    ],
    mapTitle: "International Airport Terminal 2 — Map",
    mapDescription: "Label the zones and areas A–J on the terminal map.",
    mapItems: [
      { label: "A", description: "Ground floor check-in zone with kiosks and staffed desks", answer: "Check-in zone" },
      { label: "B", description: "Area with eight security lanes including fast-track lanes", answer: "Security screening" },
      { label: "C", description: "Large open seating area with restaurants after security", answer: "Departure lounge" },
      { label: "D", description: "Over forty retail units selling perfume, electronics and luxury goods", answer: "Duty-free shopping" },
      { label: "E", description: "Gates G1 to G15 including dedicated wide-body aircraft gate", answer: "Gate area G7" },
      { label: "F", description: "Non-denominational quiet room open 24 hours for all faiths", answer: "Prayer room" },
      { label: "G", description: "Mezzanine-level premium lounge with shower facilities", answer: "Business lounge" },
      { label: "H", description: "Ground floor medical facility staffed by paramedics around the clock", answer: "Medical centre" },
      { label: "I", description: "Central point for lost property, flight info and wheelchair assistance", answer: "Information desk" },
      { label: "J", description: "Arrivals hall area with twelve carousels for collecting bags", answer: "Baggage reclaim" }
    ]
  },
  {
    title: "Guided Tour of the City Museum of Science and Industry",
    script: `Guide: Welcome everyone to the City Museum of Science and Industry. I'm your guide for this morning's orientation and I'm delighted to show you around one of the region's most celebrated museums. We have a wonderful collection spanning three centuries of scientific and industrial history, and I'm confident you'll find plenty to engage with during your visit today.\n\nLet's begin right where we are — in Zone A, the entrance foyer. As you can see, this is a large, light-filled atrium with a soaring glass roof. It serves as the central hub of the museum and you can access all other areas from here. The foyer contains our main welcome desk, a cloakroom, and display boards giving you an overview of current exhibitions. You'll also notice the large model of the solar system suspended from the ceiling — a firm favourite with younger visitors.\n\nDirectly to your right as you enter is Zone B — the gift shop. This is actually one of the most popular areas in the entire museum, and not just for children! We stock a wide range of books, science kits, educational toys, and locally produced gifts. All proceeds from the gift shop support the museum's education programmes.\n\nPast the gift shop, heading deeper into the building, you'll find yourself in Zone C — the Victorian Engine Hall. This is without doubt the largest room in the museum. It houses our collection of working steam engines, many of which were originally used in the textile mills that made this region famous during the industrial revolution. On selected days, the engines are powered up and visitors can watch them in operation — an extraordinary sight.\n\nTo the left of the engine hall is Zone D — the Interactive Science Gallery. This is our most hands-on area and is especially popular with school groups. You can experiment with electricity, magnetism, sound, and light, and there are guided demonstrations every hour on the hour. The gallery is designed for visitors of all ages, though children particularly love the water pressure experiments in the far corner.\n\nContinuing around the ground floor, you reach Zone E — the Textile History Room. This thoughtful exhibition traces the development of cloth production from hand-looming in the seventeenth century through to modern synthetic fibres. There are original looms you can observe in operation, and the exhibition also addresses the social history of mill workers, including the role of child labour and later labour reform.\n\nAt the back of the ground floor, adjacent to the textile room, is Zone F — the café. The café is open from nine in the morning until four thirty in the afternoon and serves hot meals, sandwiches, cakes, and a children's menu. Outside seating is available in fine weather in the adjoining courtyard. The café is self-service and accepts both cash and cards.\n\nHeading upstairs, you'll find Zone G — the lecture theatre. This seats two hundred and fifty and is used for public lectures, film screenings, and school presentations. Today at two o'clock there is a free public lecture on the history of computing. Tickets are available from the welcome desk.\n\nZone H is the Temporary Exhibitions Hall, also upstairs. This large gallery hosts rotating exhibitions throughout the year — currently featuring a display on the history of space exploration from Sputnik to the present day. The hall is only open during the museum's standard hours, which are nine to five Tuesday through Sunday.\n\nNestled behind the lecture theatre on the upper floor is Zone I — the Conservation Workshop. This is a working studio where our conservation team restores and maintains objects from the collection. A transparent viewing window allows visitors to watch the conservators at work. This is a real highlight for many visitors who have never considered the behind-the-scenes work that keeps museum collections alive.\n\nFinally, accessible via a dedicated staircase at the rear of the upper floor, is Zone J — the roof garden. This beautiful green space features drought-tolerant planting, a wildflower meadow section, and information boards on urban ecology. On clear days the views over the city are quite spectacular. The roof garden is open from April through to October, weather permitting.\n\nThe museum is open Tuesday to Sunday, nine to five. Adult tickets are seven pounds fifty, and children's tickets — for visitors aged five to sixteen — are four pounds. Children under five enter free. Guided tours run every day at ten thirty and two thirty and last approximately ninety minutes. I hope you enjoy your visit — please do ask me or any member of staff if you have questions.`,
    mcqs: [
      { prompt: "What time does the museum café close?", options: ["4:00 pm", "4:30 pm", "5:00 pm", "5:30 pm"], answer: "B", explanation: "The guide says the café is open 'until four thirty in the afternoon'" },
      { prompt: "How much does a child's ticket cost?", options: ["£3.00", "£4.00", "£4.50", "£5.00"], answer: "B", explanation: "The guide states 'children's tickets are four pounds'" },
      { prompt: "How frequently do guided demonstrations run in the Interactive Science Gallery?", options: ["every thirty minutes", "every hour", "every two hours", "twice daily"], answer: "B", explanation: "The guide says 'there are guided demonstrations every hour on the hour'" },
      { prompt: "Which is described as the largest room in the museum?", options: ["the Interactive Science Gallery", "the Temporary Exhibitions Hall", "the Victorian Engine Hall", "the lecture theatre"], answer: "C", explanation: "The guide says the engine hall is 'without doubt the largest room in the museum'" },
      { prompt: "Where is the café located?", options: ["on the upper floor next to the lecture theatre", "at the back of the ground floor adjacent to the textile room", "in the entrance foyer", "in the roof garden"], answer: "B", explanation: "The guide says the café is 'at the back of the ground floor, adjacent to the textile room'" }
    ],
    mapTitle: "City Museum of Science and Industry — Floor Plan",
    mapDescription: "Label the areas A–J on the museum map.",
    mapItems: [
      { label: "A", description: "Main atrium with glass roof and solar system model", answer: "Entrance foyer" },
      { label: "B", description: "Shop selling science kits, books and educational toys", answer: "Gift shop" },
      { label: "C", description: "Largest room housing working steam engines", answer: "Victorian Engine Hall" },
      { label: "D", description: "Hands-on area with electricity and magnetism experiments", answer: "Interactive Science Gallery" },
      { label: "E", description: "Exhibition tracing cloth production from hand-looming to synthetic fibres", answer: "Textile History Room" },
      { label: "F", description: "Self-service food area open 9 am to 4:30 pm with courtyard", answer: "Café" },
      { label: "G", description: "Upper floor space seating 250 used for lectures and screenings", answer: "Lecture theatre" },
      { label: "H", description: "Upper floor gallery currently showing space exploration exhibition", answer: "Temporary Exhibitions Hall" },
      { label: "I", description: "Working studio with viewing window where objects are restored", answer: "Conservation Workshop" },
      { label: "J", description: "Green outdoor space with wildflower meadow, open April to October", answer: "Roof garden" }
    ]
  },
  {
    title: "Westfield Shopping Complex — Visitor Orientation",
    script: `Host: Good morning and welcome to Westfield Shopping Complex, one of the largest retail destinations in the region. I'm here to give you a brief orientation so you can make the most of your visit today and find everything you need quickly and easily. We have over two hundred and fifty shops, restaurants, and leisure facilities spread across three floors, so let's get started.\n\nLet's begin at Zone A — the main entrance. This is on the southern side of the complex, facing Market Street. As you come through the automatic doors, you are immediately in the central atrium, which is four stories high with a striking glass dome above you. The atrium features a large water feature and seating for visitors to rest. From here, all three shopping floors radiate outward.\n\nJust inside the main entrance to your left is Zone B — the information point. This is staffed from nine in the morning to nine in the evening, Monday to Saturday, and ten to six on Sundays. The team here can help you with store locations, lost and found, accessibility equipment such as wheelchairs, and general visitor queries. They also have printed maps of the complex available free of charge.\n\nHeading north from the main entrance on the ground floor, you will reach Zone C — the supermarket. This is a large full-service supermarket anchoring the northern end of the ground floor. It has its own dedicated entrance from the car park, so you don't have to walk through the rest of the complex to access it. The supermarket is open from seven in the morning until eleven at night, seven days a week.\n\nOn the first floor above the main atrium is Zone D — the food court. This is a fantastic space with seating for over four hundred diners and features twenty-two restaurant and café units offering everything from sushi and pizza to traditional British meals and vegan options. The food court is open from ten in the morning until nine in the evening. It's one of our busiest areas, especially on weekends and during school holidays.\n\nMoving up to the second and top floor, you'll find Zone E — the cinema. The Westfield Cinema has twelve screens and shows the latest releases seven days a week. Screenings begin at ten thirty in the morning and the last showing typically starts around ten at night. You can book tickets online or at the box office on the second floor, which opens one hour before the first showing.\n\nAlso on the first floor, in the western wing, is Zone F — the gym. This is a full-service health club open to both members and day visitors. It has a twenty-five metre swimming pool, a large weights area, and over thirty fitness classes per week. Day passes are available at reception for fifteen pounds, which includes full access to all facilities including the pool.\n\nBack on the ground floor in the northern wing, you'll find Zone G — the children's play area. This is a supervised indoor soft play space suitable for children up to twelve years old. It's free to use for children accompanied by a paying adult from the shopping centre's café. Session times are ninety minutes and must be booked at the information point.\n\nZone H is the car park entrance, located on the eastern side of the complex with access from Eastern Road. The car park has twelve hundred spaces across four levels and uses an automated payment system. The first hour of parking is free; thereafter the charge is two pounds per hour. The maximum daily charge is twelve pounds. Electric vehicle charging points are available on Level 1.\n\nZone I — the pharmacy — is situated on the ground floor, just past the information point on your left as you enter from the main entrance. It is a full-service pharmacy with a qualified pharmacist on duty at all times during opening hours. Prescription services are available and no appointment is necessary for a consultation.\n\nFinally, Zone J — customer services — is located at the far end of the ground floor in the eastern wing, near the car park entrance. This is where you go for gift cards, returns and exchanges from participating retailers, parking validation, and assistance with any complaints or special requests. Customer services is open Monday to Saturday nine to eight, and Sunday eleven to five.\n\nShopping hours for the complex as a whole are nine am to nine pm Monday to Saturday, and ten am to six pm on Sundays. I hope you have a wonderful visit — please don't hesitate to ask any member of the Westfield team for assistance.`,
    mcqs: [
      { prompt: "How many screens does the Westfield Cinema have?", options: ["8", "10", "12", "15"], answer: "C", explanation: "The host states 'The Westfield Cinema has twelve screens'" },
      { prompt: "How many floors does the shopping complex have?", options: ["two", "three", "four", "five"], answer: "B", explanation: "The host mentions 'three floors' of shops, restaurants and leisure" },
      { prompt: "What is the parking charge per hour after the first free hour?", options: ["£1.00", "£1.50", "£2.00", "£2.50"], answer: "C", explanation: "The host says 'the charge is two pounds per hour'" },
      { prompt: "On which floor is the food court located?", options: ["ground floor", "first floor", "second floor", "third floor"], answer: "B", explanation: "The host says Zone D the food court 'is on the first floor above the main atrium'" },
      { prompt: "What is the day visitor pass price for the gym?", options: ["£10", "£12", "£15", "£20"], answer: "C", explanation: "The host says 'Day passes are available at reception for fifteen pounds'" }
    ],
    mapTitle: "Westfield Shopping Complex — Site Plan",
    mapDescription: "Label the zones A–J on the shopping centre map.",
    mapItems: [
      { label: "A", description: "Southern entrance with glass dome atrium and water feature", answer: "Main entrance" },
      { label: "B", description: "Staffed point near main entrance for maps, wheelchairs and lost property", answer: "Information point" },
      { label: "C", description: "Large supermarket anchoring the northern ground floor with own car park access", answer: "Supermarket" },
      { label: "D", description: "First floor dining space seating over 400 with 22 restaurant units", answer: "Food court" },
      { label: "E", description: "Top floor venue with twelve screens showing films from 10:30 am", answer: "Cinema" },
      { label: "F", description: "First floor western wing health club with 25-metre pool", answer: "Gym" },
      { label: "G", description: "Ground floor supervised indoor soft play for children up to age 12", answer: "Children's play area" },
      { label: "H", description: "Eastern side entry to 1200-space multi-storey with automated payment", answer: "Car park entrance" },
      { label: "I", description: "Ground floor dispensary with pharmacist on duty during all opening hours", answer: "Pharmacy" },
      { label: "J", description: "Eastern wing facility for gift cards, returns, and parking validation", answer: "Customer services" }
    ]
  },
  {
    title: "St. Mary's General Hospital — Visitor Orientation",
    script: `Volunteer: Good afternoon and welcome to St. Mary's General Hospital. I'm one of the hospital volunteers and I'm going to give you a brief orientation of the building so you know your way around during your visit today. St. Mary's is a large district general hospital serving a population of around three hundred and fifty thousand people, so it can feel a little overwhelming at first. Let me break it down for you.\n\nWe'll start at Zone A — the main reception. This is directly in front of you as you enter through the sliding doors on Pembroke Road. The reception desk is staffed twenty-four hours a day and the team can help you locate any ward or department, give directions, issue visitor passes, and answer general enquiries. There are also information screens on either side of the desk showing a directory of all wards and departments.\n\nTo the left of the main entrance as you come in is Zone B — the Accident and Emergency entrance. This has its own dedicated entrance on the northern side of the building, accessed via Chestnut Lane. A and E operates continuously, twenty-four hours a day, three hundred and sixty-five days a year. Please note that if you are visiting an A and E patient, you should use the Chestnut Lane entrance rather than coming through main reception.\n\nZone C is the pharmacy, situated on the ground floor in the eastern wing, approximately a two-minute walk from the main reception. The pharmacy is open from eight am to six pm Monday to Friday, nine am to one pm on Saturdays, and is closed on Sundays. Outpatients with prescriptions can collect their medication here without a pre-arranged appointment.\n\nMoving further along the ground floor corridor past the pharmacy, you'll come to Zone D — the café and canteen. This serves both patients, visitors, and members of staff. Hot meals are served from seven in the morning until seven in the evening, and a lighter cold menu is available from seven until nine pm. The café accepts cash, card, and the hospital's own prepaid meal card. Please be aware that the café does not permit visitors to take hot food to the wards — this is for hygiene reasons.\n\nZone E — the children's ward — is on the second floor, accessible via the main lifts or the stairs near the pharmacy. Visiting hours for the children's ward are ten am to eight pm daily. Children's visitors — including siblings — must be accompanied by an adult at all times on the ward. The ward has its own small play area and dedicated nursing team.\n\nZone F is the radiology department, also on the ground floor but in the western wing, behind the main reception block. Radiology handles X-rays, MRI scans, CT scans, and ultrasound appointments. All appointments must be pre-arranged — you cannot walk in without a referral. The radiology waiting area has around sixty seats and a self-service check-in kiosk.\n\nZone G — outpatients — is the largest department in the hospital by floor area. It is on the first floor and houses clinics for over forty medical specialties, from cardiology and orthopaedics to dermatology and neurology. The outpatients department is open Monday to Friday, eight am to six pm. Patients should bring their appointment letter and arrive fifteen minutes before their scheduled time.\n\nZone H is the chapel and spiritual care centre. This is a quiet, welcoming space open to people of all faiths and backgrounds, located on the ground floor between the outpatients stairwell and the café. The chapel is staffed by a team of chaplains representing multiple faiths and is open twenty-four hours a day. Spiritual care support is also available by request for any patient on any ward.\n\nZone I — the car park — is directly outside the hospital on the western side, accessed via Pembroke Road. There are four hundred spaces on two levels. Short-stay parking costs two pounds per hour, with a maximum of three pounds for visits of up to two hours. Long-stay rates are available for patients with appointments running over two hours. Blue Badge holders may park for free in the designated spaces on Level 1.\n\nFinally, Zone J — the relatives' room — is situated on the first floor, just off the main corridor near the lifts. This is a private, comfortable space for families of patients who are critically ill or undergoing significant procedures. It is available around the clock and can be booked through the ward nursing staff. Tea and coffee facilities are provided.\n\nVisiting hours at St. Mary's are two to four pm and six to eight pm daily on most wards. Please check with the ward receptionist when you arrive, as some wards have specific restrictions. I hope your visit goes well — please do ask any member of staff or volunteer if you need further assistance.`,
    mcqs: [
      { prompt: "What are the standard visiting hours at St. Mary's?", options: ["1–3 pm and 5–7 pm", "2–4 pm and 6–8 pm", "3–5 pm and 7–9 pm", "10 am–8 pm"], answer: "B", explanation: "The volunteer states 'visiting hours at St. Mary's are two to four pm and six to eight pm daily'" },
      { prompt: "How much does short-stay parking cost per hour?", options: ["£1.00", "£1.50", "£2.00", "£2.50"], answer: "C", explanation: "The volunteer says 'Short-stay parking costs two pounds per hour'" },
      { prompt: "Until what time does the café serve hot meals?", options: ["5 pm", "6 pm", "7 pm", "8 pm"], answer: "C", explanation: "The volunteer says 'Hot meals are served from seven in the morning until seven in the evening'" },
      { prompt: "Where is the A&E entrance located?", options: ["on Pembroke Road at the main entrance", "on Chestnut Lane on the northern side", "in the eastern wing near the pharmacy", "on the western side near the car park"], answer: "B", explanation: "The volunteer says A&E 'has its own dedicated entrance on the northern side of the building, accessed via Chestnut Lane'" },
      { prompt: "What is located near the chapel?", options: ["the main reception", "the radiology department", "the café", "the car park"], answer: "C", explanation: "The volunteer says the chapel is 'between the outpatients stairwell and the café'" }
    ],
    mapTitle: "St. Mary's General Hospital — Ground and First Floor Plan",
    mapDescription: "Label the departments and areas A–J on the hospital map.",
    mapItems: [
      { label: "A", description: "24-hour staffed desk directly inside Pembroke Road entrance", answer: "Main reception" },
      { label: "B", description: "Dedicated 24-hour emergency entrance on Chestnut Lane", answer: "A&E entrance" },
      { label: "C", description: "Eastern wing dispensary open Mon–Fri 8 am–6 pm", answer: "Pharmacy" },
      { label: "D", description: "Ground floor eating area serving hot meals 7 am to 7 pm", answer: "Café/canteen" },
      { label: "E", description: "Second floor ward with play area, visiting 10 am–8 pm", answer: "Children's ward" },
      { label: "F", description: "Western wing ground floor department handling scans and X-rays by appointment", answer: "Radiology" },
      { label: "G", description: "First floor department with clinics for over 40 specialties", answer: "Outpatients" },
      { label: "H", description: "Ground floor 24-hour spiritual care space between café and outpatients stairwell", answer: "Chapel" },
      { label: "I", description: "Western side two-level parking with 400 spaces off Pembroke Road", answer: "Car park" },
      { label: "J", description: "First floor private space for families of seriously ill patients", answer: "Relatives' room" }
    ]
  },
  {
    title: "National Sports Academy — Facilities Tour",
    script: `Guide: Welcome to the National Sports Academy. I'm delighted to be showing you around today and I hope by the end of this tour you'll have a clear picture of all the world-class facilities we have here. The Academy was founded in 1998 and has trained athletes who have gone on to represent their country at the highest level, including three Olympic medallists in the past decade alone. We're incredibly proud of what's been achieved here and we hope you'll feel inspired by what you see.\n\nLet's start at Zone A — the reception area. This is where you enter the Academy and where all visitors, members, and athletes sign in. The reception team can help with membership enquiries, timetable information, and facility bookings. There is also a notice board here displaying upcoming events, competitions, and community programmes.\n\nDirectly behind reception, through the double doors, is Zone B — the main gym. This is a substantial space measuring nearly two thousand square metres and can accommodate up to one hundred and fifty users at one time. It is equipped with a full complement of strength training equipment including free weights, cable machines, and resistance machines, as well as around sixty cardiovascular machines including treadmills, rowing machines, and cycling ergometers. The gym is open from five-thirty in the morning until ten at night, seven days a week.\n\nTo the left of the main gym is Zone C — the swimming pool. This is a fifty-metre competition-standard pool with ten lanes. The pool is used for training by our academy swimmers but is also available to the public during designated open swimming sessions. The viewing gallery above the pool can accommodate two hundred spectators, which comes in useful during inter-academy competitions.\n\nZone D is the indoor athletics track, located in the large hall at the rear of the building. This is a two-hundred-metre banked indoor track with a synthetic surface suitable for sprinting, distance running, and field events. The long jump pit and high jump area are located at the northern end of the hall. The track is bookable by clubs, schools, and individual athletes through our online system.\n\nIn the eastern wing of the building, off the main corridor from reception, are Zone E — the squash courts. There are six courts in total, all with glass back walls for spectating. Courts can be booked in forty-five minute slots up to seven days in advance. Rackets and balls can be hired from reception for two pounds per session.\n\nZone F is the physiotherapy centre, next to the squash courts in the eastern wing. The centre has eight treatment rooms and is staffed by six qualified physiotherapists. Appointments are essential — you cannot walk in without a prior booking. Sessions last either thirty or sixty minutes depending on the treatment required. The physiotherapy centre is available to both Academy members and members of the public with a referral from their GP.\n\nFurther along the eastern wing is Zone G — the sports science laboratory. This is a specialist research facility used by our performance team and by visiting researchers. The lab offers services including VO2 max testing, biomechanical analysis, body composition measurement, and lactate threshold testing. Access to the sports science lab is by appointment only and is available to elite athletes and research partners.\n\nZone H — the changing rooms — are centrally located between the main gym and the swimming pool for easy access from both. There are separate male, female, and gender-neutral changing facilities, each with lockers, showers, steam rooms, and hair dryers. A coin-operated locker system is in use — one pound coins or a pound deposit card available from reception.\n\nZone I is the café, located at the front of the building to the left of the main reception as you enter. The café specialises in sports nutrition and serves high-protein meals, fresh juices, smoothies, and energy-boosting snacks. It is open from six thirty in the morning until eight in the evening on weekdays, and from eight am to six pm on weekends. There is also a meal prep service available for athletes on structured nutrition plans.\n\nFinally, Zone J — the viewing gallery — is located on the upper level above the swimming pool and overlooks both the pool and, through a glass partition, part of the indoor athletics track. The gallery is open to spectators during all public sessions and during competitions. It seats two hundred and has its own small refreshment kiosk. Access is via the staircase or the lift near the reception area.\n\nAre there any questions before we start the tour proper? Excellent — let's head to the main gym first.`,
    mcqs: [
      { prompt: "How many lanes does the swimming pool have?", options: ["6", "8", "10", "12"], answer: "C", explanation: "The guide states 'This is a fifty-metre competition-standard pool with ten lanes'" },
      { prompt: "What is the maximum capacity of the main gym?", options: ["100", "120", "150", "200"], answer: "C", explanation: "The guide says the gym 'can accommodate up to one hundred and fifty users at one time'" },
      { prompt: "What is required to use the physiotherapy centre?", options: ["a gym membership", "a doctor's referral for non-members", "a prior appointment", "a student ID"], answer: "C", explanation: "The guide says 'Appointments are essential — you cannot walk in without a prior booking'" },
      { prompt: "What time does the café open on weekdays?", options: ["5:30 am", "6:00 am", "6:30 am", "7:00 am"], answer: "C", explanation: "The guide says the café is open 'from six thirty in the morning until eight in the evening on weekdays'" },
      { prompt: "What can be viewed from the viewing gallery?", options: ["the main gym and the squash courts", "the pool and part of the athletics track", "the sports science lab and the pool", "the changing rooms and the café"], answer: "B", explanation: "The guide says the gallery 'overlooks both the pool and, through a glass partition, part of the indoor athletics track'" }
    ],
    mapTitle: "National Sports Academy — Facilities Plan",
    mapDescription: "Label the facilities A–J on the sports academy plan.",
    mapItems: [
      { label: "A", description: "Entry point where visitors and athletes sign in with notice board", answer: "Reception" },
      { label: "B", description: "2000 sq metre training space with 60+ cardio machines, open 5:30 am–10 pm", answer: "Main gym" },
      { label: "C", description: "50-metre 10-lane competition pool to left of main gym", answer: "Swimming pool" },
      { label: "D", description: "200-metre banked indoor running track at rear of building", answer: "Indoor athletics track" },
      { label: "E", description: "Six glass-backed courts in eastern wing, bookable in 45-minute slots", answer: "Squash courts" },
      { label: "F", description: "Eight treatment rooms in eastern wing, appointment essential", answer: "Physiotherapy centre" },
      { label: "G", description: "Specialist lab offering VO2 max and biomechanical testing by appointment", answer: "Sports science lab" },
      { label: "H", description: "Central changing facilities between gym and pool with steam rooms", answer: "Changing rooms" },
      { label: "I", description: "Sports nutrition café left of reception, open from 6:30 am on weekdays", answer: "Café" },
      { label: "J", description: "Upper level spectator area above pool seating 200 with refreshment kiosk", answer: "Viewing gallery" }
    ]
  },
  {
    title: "Northgate Central Library — New Member Orientation",
    script: `Librarian: Good afternoon and welcome to Northgate Central Library. My name is Helen and I'm one of the senior librarians here. I'm going to take you through a brief orientation of the building today so that you know where everything is and can make the most of your membership. Northgate Library has been serving this community since 1912 and we are incredibly proud of the range of services and resources we provide. Let's get started.\n\nAs you come through the main entrance from Library Square, you are immediately in Zone A — the entrance area and self-service kiosks. There are four self-service kiosks here where you can borrow and return items without queuing. They accept your library card or the library app on your smartphone. If you're borrowing for the first time today, one of my colleagues at the nearby help desk will register your card for you.\n\nTo the right of the entrance area is Zone B — the fiction section. This is arranged alphabetically by author surname and covers the full range of fiction genres including literary fiction, crime, science fiction, romance, horror, and historical fiction. There is a comfortable seating area within the fiction section with armchairs and reading lamps, which is particularly popular on wet afternoons. New titles are displayed on a separate rotating stand near the section entrance.\n\nTo the left of the entrance is Zone C — the non-fiction and reference section. This covers an enormous range of subjects from biography and history to science, technology, arts, and business. The reference materials in this section — including encyclopaedias, atlases, legal guides, and professional directories — cannot be borrowed and must be consulted within the library. The non-fiction section also houses the periodicals, including newspapers and magazines, updated daily.\n\nAt the back of the ground floor, through a dedicated doorway, is Zone D — the children's library. This is a bright, colourful, and welcoming space for younger readers up to the age of fourteen. It has its own collections of picture books, chapter books, graphic novels, and young adult fiction. Storytelling sessions are held here every Saturday morning at ten o'clock and are free to attend. Children under eight must be accompanied by an adult at all times in this area.\n\nOn the first floor, accessible via the main staircase or the lift beside the entrance, is Zone E — the study pods. These are twelve individual enclosed study spaces bookable in two-hour slots. You can reserve a study pod up to three days in advance using the library's online system or by asking at the help desk. Each pod has a desk, a task light, a power socket, and free wi-fi. They are particularly popular during exam periods, so we do recommend booking ahead.\n\nAlso on the first floor is Zone F — the digital resources room. This room has twenty-four computer terminals available to all library members. Sessions are limited to one hour at a time when other members are waiting, though you can book an additional hour if the room is quiet. The room also provides access to e-book and audio-book platforms, genealogy databases, and academic journal archives.\n\nZone G is the local history archive, located at the far end of the first floor. This is a specialist collection covering the history of the Northgate area from the seventeenth century to the present day. The archive contains maps, photographs, oral history recordings, council records, and local newspapers dating back to 1843. Access to archival materials requires prior registration with the archive team — please speak to the help desk to arrange this. The archive is open Tuesday, Thursday, and Saturday only.\n\nZone H is the café corner, near the main staircase on the ground floor. This is a small self-service refreshment area operated by a local charity. It serves filter coffee, tea, cold drinks, and a small range of baked goods. It is open Monday to Friday from nine am to four pm. Please note that hot drinks are not permitted beyond the café corner — cold drinks with a sealed lid are allowed throughout the library.\n\nZone I — the staff help desk — is centrally positioned on the ground floor between the fiction and non-fiction sections. This is the main point of contact for all library queries including membership, reservations, renewals, printing and photocopying, lost items, and accessibility support. Staff are available during all opening hours. The help desk also handles interlibrary loan requests if we don't hold the item you need.\n\nFinally, Zone J — the community meeting room — is on the ground floor at the rear of the building, accessible through a separate entrance on Baker Lane for events outside library hours. The room seats up to forty people and is available to hire by community groups for a nominal fee. It is equipped with a projector, a sound system, and a small kitchenette. Booking is through the library website or by contacting the help desk.\n\nNow — some important information about membership rules. You may borrow up to ten items at a time. The standard loan period is three weeks, and items can be renewed twice if no one else has reserved them. If you wish to borrow from the archive, you must complete a separate registration form. Study pods can be booked up to three days in advance as I mentioned. The archive is open on Tuesdays, Thursdays, and Saturdays only, and access requires prior registration. Children's library age limit is fourteen years old. The café closes at four pm on weekdays. I hope that all makes sense — please don't hesitate to ask me or any member of staff if you have any questions.`,
    mcqs: [
      { prompt: "What is the maximum number of items a member can borrow at one time?", options: ["6", "8", "10", "12"], answer: "C", explanation: "The librarian says 'You may borrow up to ten items at a time'" },
      { prompt: "How far in advance can a study pod be booked?", options: ["one day", "two days", "three days", "one week"], answer: "C", explanation: "The librarian says 'You can reserve a study pod up to three days in advance'" },
      { prompt: "What is required to access the local history archive?", options: ["a special library card", "prior registration with the archive team", "a letter of introduction", "an annual membership upgrade"], answer: "B", explanation: "The librarian says 'Access to archival materials requires prior registration with the archive team'" },
      { prompt: "What time does the café corner close?", options: ["3 pm", "4 pm", "5 pm", "6 pm"], answer: "B", explanation: "The librarian says the café is 'open Monday to Friday from nine am to four pm'" },
      { prompt: "What is the age limit for the children's library?", options: ["ten", "twelve", "fourteen", "sixteen"], answer: "C", explanation: "The librarian says the children's library is 'for younger readers up to the age of fourteen'" }
    ],
    mapTitle: "Northgate Central Library — Floor Plan",
    mapDescription: "Label the areas A–J on the library floor plan.",
    mapItems: [
      { label: "A", description: "Entry area with four self-service borrow/return kiosks", answer: "Entrance / self-service kiosks" },
      { label: "B", description: "Right of entrance, alphabetical fiction collection with armchair seating", answer: "Fiction section" },
      { label: "C", description: "Left of entrance, non-fiction, reference and daily periodicals", answer: "Non-fiction and reference" },
      { label: "D", description: "Ground floor rear, colourful space for readers up to age 14", answer: "Children's library" },
      { label: "E", description: "First floor, twelve enclosed individual study spaces bookable for 2-hour slots", answer: "Study pods" },
      { label: "F", description: "First floor room with 24 computer terminals and e-book access", answer: "Digital resources room" },
      { label: "G", description: "First floor far end, specialist collection open Tue, Thu and Sat only", answer: "Local history archive" },
      { label: "H", description: "Ground floor near staircase, charity-run refreshments open 9 am–4 pm weekdays", answer: "Café corner" },
      { label: "I", description: "Central ground floor contact point for all membership and loan queries", answer: "Staff help desk" },
      { label: "J", description: "Ground floor rear, 40-seat hireable community space with projector", answer: "Community meeting room" }
    ]
  },
  {
    title: "Central Railway Station — Passenger Information",
    script: `Announcer: Good morning and welcome to Central Railway Station. My name is Chris and I'm one of the passenger services team. We're delighted that you're travelling with us today, and we'd like to take a few minutes to familiarise you with the layout of the station so you can find everything you need quickly and comfortably. Central Station serves over forty thousand passengers every day and is one of the busiest transport hubs in the region, so let me guide you through the key facilities.\n\nLet's begin at Zone A — the ticket office. This is located at the front of the station building, directly facing Market Square as you enter through the main doors. The ticket office has twelve staffed windows open from five in the morning until eleven at night, seven days a week. You can purchase tickets for any destination on the national rail network, collect pre-booked tickets, and get journey planning advice. The ticket office also handles railcard applications and group travel enquiries.\n\nImmediately to the right of the ticket office is Zone B — left luggage. This facility allows you to store your bags securely while you explore the city or wait for your connection. The service is available from six in the morning until ten at night, every day of the year including bank holidays. Charges are three pounds per item for up to four hours, and five pounds for up to twelve hours. Larger items such as bicycles and pushchairs can also be accommodated for an additional charge. You will need to show a valid photo ID when collecting your items.\n\nMoving through the main concourse from the ticket office, you'll reach the platforms. Platforms one to four — Zone C — are on the left-hand side of the concourse and are served by local and regional services, including commuter trains to the suburbs, the airport express, and cross-country services. The departure board for platforms one to four is displayed on a large overhead screen at the concourse entrance.\n\nPlatforms five to eight — Zone D — are on the right-hand side of the concourse and handle long-distance intercity services, including trains to London, Edinburgh, Birmingham, and Bristol. These platforms have their own waiting facilities including seating and vending machines. Platform 8 is the dedicated platform for the overnight sleeper service to Scotland, which departs at eleven fifty-five pm.\n\nZone E — the waiting room — is centrally located between the two platform groups on the main concourse. The waiting room is enclosed, heated in winter and air-conditioned in summer, and provides comfortable seating for around eighty passengers. It is open from five in the morning until the last service of the day. Children's pushchairs are welcome and there is a designated area for passengers with reduced mobility.\n\nZone F — the station café — is positioned in the western end of the main concourse, between the waiting room and the exit to the taxi rank. The café serves hot and cold food and drinks from five thirty in the morning until nine at night. A breakfast menu is available until midday, after which a full lunch and snack menu takes over. The café also has free wi-fi which you can access without needing to make a purchase.\n\nZone G — the taxi rank — is outside the western exit of the station, accessed via the covered walkway from the main concourse. Taxis are available here twenty-four hours a day and the rank typically has a queue of three to eight vehicles waiting at most times. A smartphone app is also available for pre-booking a taxi and tracking your driver's arrival. Private hire vehicles must use the designated drop-off and pick-up bay on the southern side of the building rather than the taxi rank.\n\nZone H — bicycle storage — is located at the eastern end of the station building, accessible from Platform Road on the eastern side. There are one hundred and twenty covered, secure bicycle spaces available, operated on a first-come, first-served basis. Season pass holders get a reserved space. The bicycle storage area is free to use for up to two hours and costs one pound per day thereafter. Cycle repair tools and a pump are available in the storage area at no charge.\n\nZone I — the customer services desk — is situated in the centre of the main concourse, directly in front of the main entrance. The team here handles journey planning, delays and compensation claims, lost property, accessibility arrangements, and station feedback. Customer services is open from seven in the morning until eight in the evening Monday to Saturday, and nine to five on Sundays. Outside these hours, the ticket office team can assist with urgent queries.\n\nFinally, Zone J — the accessible assistance point — is located near the entrance to Platforms one to four on the left of the main concourse. This is a staffed point specifically for passengers who need help boarding trains, using ramps, or navigating the station. Passengers who require assistance are strongly encouraged to pre-book the service at least twenty-four hours before travel by calling the station's accessibility line or booking online. However, our team will always do their best to assist passengers who arrive without prior booking.\n\nI hope that gives you a good sense of the station layout. If there's anything else we can help with, please don't hesitate to ask any member of the blue-uniformed passenger services team. Have a safe and comfortable journey today.`,
    mcqs: [
      { prompt: "What are the left luggage operating hours?", options: ["5 am to 11 pm", "6 am to 10 pm", "7 am to 9 pm", "24 hours"], answer: "B", explanation: "The announcer says left luggage is available 'from six in the morning until ten at night'" },
      { prompt: "Where is the taxi rank located?", options: ["on the eastern side of the building", "outside the western exit", "next to the ticket office", "on the southern side of the building"], answer: "B", explanation: "The announcer says the taxi rank is 'outside the western exit of the station'" },
      { prompt: "How much does bicycle storage cost after the first two free hours?", options: ["50p per day", "£1 per day", "£2 per day", "£3 per day"], answer: "B", explanation: "The announcer says bicycle storage 'costs one pound per day thereafter'" },
      { prompt: "What are customer services desk hours on Sundays?", options: ["7 am to 8 pm", "8 am to 6 pm", "9 am to 5 pm", "10 am to 4 pm"], answer: "C", explanation: "The announcer says customer services is open 'nine to five on Sundays'" },
      { prompt: "How far in advance should passengers requiring accessible assistance book?", options: ["6 hours", "12 hours", "24 hours", "48 hours"], answer: "C", explanation: "The announcer says passengers 'are strongly encouraged to pre-book the service at least twenty-four hours before travel'" }
    ],
    mapTitle: "Central Railway Station — Station Plan",
    mapDescription: "Label the facilities A–J on the station map.",
    mapItems: [
      { label: "A", description: "Front of station facing Market Square, 12 windows open 5 am–11 pm", answer: "Ticket office" },
      { label: "B", description: "Right of ticket office, bag storage 6 am–10 pm, requires photo ID", answer: "Left luggage" },
      { label: "C", description: "Left concourse side handling local, regional and airport express services", answer: "Platforms 1–4 area" },
      { label: "D", description: "Right concourse side for intercity services including overnight sleeper", answer: "Platforms 5–8 area" },
      { label: "E", description: "Enclosed heated/air-conditioned central concourse space for 80 passengers", answer: "Waiting room" },
      { label: "F", description: "Western concourse café open 5:30 am–9 pm with free wi-fi", answer: "Station café" },
      { label: "G", description: "24-hour covered vehicle rank outside western exit", answer: "Taxi rank" },
      { label: "H", description: "Eastern end covered secure cycle spaces, free first 2 hours then £1/day", answer: "Bicycle storage" },
      { label: "I", description: "Central concourse desk for delays, compensation, lost property and accessibility", answer: "Customer services desk" },
      { label: "J", description: "Staffed point near Platform 1–4 entrance for passengers needing boarding help", answer: "Accessible assistance point" }
    ]
  }
];

// ─── PART 3 SCENARIOS ────────────────────────────────────────────────────────
const P3_SCENARIOS = [
  {
    title: "Discussion About a Research Project on Urban Noise",
    script: `Tutor: So, Priya and James, how is your project on urban noise pollution progressing?\nPriya: We've finished the literature review. The main finding seems to be that constant exposure to traffic noise above sixty-five decibels significantly increases stress hormone levels.\nJames: What surprised us was the evidence linking noise to cardiovascular disease — not just stress. Several longitudinal studies found a measurable increase in heart disease rates near busy roads.\nTutor: Interesting. What methodology have you chosen for your primary research?\nPriya: We're doing acoustic measurements at ten sites across the city, combined with a survey of five hundred residents asking about sleep quality and perceived noise annoyance.\nTutor: And your sample size — five hundred — is that sufficient?\nJames: We debated this. Statistically it should give us a confidence interval of plus or minus four percent at the ninety-five percent confidence level, which most journals would accept.\nTutor: Good. Have you considered confounding variables? People near noisy roads may also be near other pollution sources.\nPriya: Yes, we plan to control for air quality and proximity to industrial areas in our regression analysis.\nTutor: What do you expect your main recommendation to be?\nJames: Probably mandatory sound barriers along roads within five hundred metres of residential zones.\nPriya: I'd add better urban zoning rules — separating heavy traffic routes from housing areas at the planning stage.\nTutor: These are sound arguments. Make sure your final report references the WHO noise guidelines published in 2018.`,
    mcqs: [
      { prompt: "What noise level does research link to increased stress hormones?", options: ["55 dB", "60 dB", "65 dB", "70 dB"], answer: "C", explanation: "Priya mentions 'constant exposure to traffic noise above sixty-five decibels'" },
      { prompt: "What additional health risk did James find surprising in the literature?", options: ["hearing loss", "cardiovascular disease", "respiratory problems", "mental health disorders"], answer: "B", explanation: "James says 'the evidence linking noise to cardiovascular disease'" },
      { prompt: "How many residents will be surveyed?", options: ["200", "300", "400", "500"], answer: "D", explanation: "Priya mentions 'a survey of five hundred residents'" },
      { prompt: "What confidence level does their sample size achieve?", options: ["90%", "92%", "95%", "99%"], answer: "C", explanation: "James refers to 'the ninety-five percent confidence level'" },
      { prompt: "What does the tutor recommend they reference?", options: ["WHO 2015 report", "WHO 2018 guidelines", "EU noise directive", "national highway code"], answer: "B", explanation: "The tutor says 'reference the WHO noise guidelines published in 2018'" }
    ],
    chooseTwos: [
      {
        prompt: "Which TWO methods are used in the students' primary research?",
        options: ["interviews with city planners", "acoustic measurements", "animal behaviour observations", "resident surveys", "analysis of hospital data"],
        answers: ["B", "D"],
        explanation: "Priya mentions acoustic measurements and a resident survey"
      },
      {
        prompt: "Which TWO recommendations do the students plan to make?",
        options: ["banning private vehicles", "sound barriers near residential areas", "speed restrictions", "better urban zoning rules", "noise tax on vehicles"],
        answers: ["B", "D"],
        explanation: "James proposes sound barriers; Priya proposes better zoning"
      }
    ]
  },
  {
    title: "Seminar on Climate Change Adaptation in Agriculture",
    script: `Tutor: Today we're looking at how farmers are adapting to climate change. Sarah, you've been researching this — what are the main strategies?\nSarah: There are basically four categories: changing crop varieties, adjusting planting calendars, improving irrigation efficiency, and diversifying into non-crop income streams like agritourism.\nMike: From what I read, the shift to drought-resistant varieties is the most widely adopted strategy globally, though it depends heavily on seed availability and cost.\nTutor: What barriers prevent farmers from adapting?\nSarah: In developing countries, the main barriers are access to finance and lack of reliable weather forecasting at the local level. Farmers need hyper-local data, not national averages.\nMike: There's also a knowledge gap. Many smallholders rely on generational knowledge that may no longer match current climate conditions. Extension services have a critical role.\nTutor: How effective have government subsidy programmes been?\nSarah: Mixed results. Countries that tied subsidies to specific adaptation behaviours — like water-efficient irrigation — saw much better outcomes than those that gave blanket payments.\nMike: India's PM-KISAN scheme is often cited as an example of blanket support that failed to drive specific adaptive behaviours.\nTutor: What does the evidence suggest about the future food supply?\nSarah: If current emission trajectories continue, yield losses for staple crops like wheat and maize could reach thirty percent by 2080 in tropical regions.\nTutor: And what would reverse that?\nMike: A combination of accelerated breeding programmes, agroforestry, and precision agriculture technologies — but these require significant upfront investment.`,
    mcqs: [
      { prompt: "Which adaptation strategy is described as most widely adopted globally?", options: ["adjusting planting calendars", "agritourism diversification", "drought-resistant crop varieties", "improved irrigation"], answer: "C", explanation: "Mike says 'the shift to drought-resistant varieties is the most widely adopted strategy globally'" },
      { prompt: "What type of weather data do farmers most need?", options: ["national averages", "seasonal forecasts", "hyper-local data", "satellite imagery"], answer: "C", explanation: "Sarah says 'Farmers need hyper-local data, not national averages'" },
      { prompt: "Which country's scheme is cited as an example of ineffective blanket support?", options: ["Bangladesh", "Kenya", "China", "India"], answer: "D", explanation: "Mike cites 'India's PM-KISAN scheme'" },
      { prompt: "By how much could tropical crop yields fall by 2080?", options: ["10%", "20%", "30%", "40%"], answer: "C", explanation: "Sarah states yield losses 'could reach thirty percent by 2080'" },
      { prompt: "What does Mike identify as a requirement for advanced adaptation technologies?", options: ["international cooperation", "significant upfront investment", "government mandates", "reduced crop prices"], answer: "B", explanation: "Mike says these 'require significant upfront investment'" }
    ],
    chooseTwos: [
      {
        prompt: "Which TWO barriers to adaptation are mentioned for developing countries?",
        options: ["lack of land", "access to finance", "political instability", "unreliable local weather forecasts", "poor transport infrastructure"],
        answers: ["B", "D"],
        explanation: "Sarah mentions finance access and lack of reliable local weather forecasting"
      },
      {
        prompt: "Which TWO adaptation strategies are mentioned as part of the four main categories?",
        options: ["forest conservation", "changing crop varieties", "overseas food imports", "adjusting planting calendars", "carbon credit trading"],
        answers: ["B", "D"],
        explanation: "Sarah lists changing crop varieties and adjusting planting calendars among the four categories"
      }
    ]
  }
];

// ─── PART 4 SCENARIOS ────────────────────────────────────────────────────────
const P4_SCENARIOS = [
  {
    title: "Lecture: The History of Antibiotics",
    script: `Today I want to talk about the history of antibiotics — arguably one of the most important developments in twentieth-century medicine.\n\nThe story begins in 1928 when Alexander Fleming noticed that a mould called Penicillium notatum was inhibiting the growth of bacteria on one of his culture plates. He published his findings but was initially unable to isolate the active compound in large enough quantities to be clinically useful.\n\nIt wasn't until 1940 that Howard Florey and Ernst Chain at Oxford managed to purify penicillin and demonstrate its effectiveness in mice. The following year, in 1941, they treated the first human patient — a police officer with a severe infection — with remarkable results, though limited supplies meant the patient eventually relapsed.\n\nThe real breakthrough came during the Second World War, when mass production was achieved through collaboration between British and American pharmaceutical companies. By 1944, enough penicillin had been produced to treat all wounded Allied soldiers. This industrial-scale production required entirely new fermentation techniques.\n\nFollowing the war, the golden era of antibiotic discovery began, lasting roughly from 1950 to 1970. During this period, major antibiotic classes including tetracyclines, erythromycin, and vancomycin were discovered, largely from soil bacteria. Researchers estimated that soil contained thousands of antibiotic-producing organisms waiting to be identified.\n\nHowever, the overuse of antibiotics in both human medicine and agriculture has driven the evolution of resistant bacteria at an alarming rate. The World Health Organization now lists antimicrobial resistance as one of the greatest global health threats. New antibiotic approvals have declined sharply since the 1980s as pharmaceutical companies shifted resources toward more profitable chronic disease treatments.\n\nCurrent strategies to address resistance include antibiotic stewardship programmes, rapid diagnostic testing to avoid prescribing antibiotics for viral infections, and investment in novel antimicrobial compounds including bacteriophage therapy and antimicrobial peptides.`,
    sentenceItems: [
      { num: 31, sentenceText: "In 1928, Fleming observed that a __BLANK__ called Penicillium notatum was inhibiting bacterial growth on his culture plates.", answer: "mould" },
      { num: 32, sentenceText: "Fleming's initial problem was that he could not __BLANK__ the active compound in sufficient quantities for clinical use.", answer: "isolate / purify" },
      { num: 33, sentenceText: "Florey and Chain, based at __BLANK__, were the first to purify penicillin and test it on a human patient.", answer: "Oxford" },
      { num: 34, sentenceText: "__BLANK__ was the occupation of the first human patient treated with penicillin in 1941.", answer: "Police officer" },
      { num: 35, sentenceText: "Mass production of penicillin during the Second World War required entirely new __BLANK__ techniques.", answer: "fermentation" }
    ],
    mcqItems: [
      { num: 36, question: "According to the lecture, the main reason antibiotic discovery declined after the 1980s was that", options: ["A  resistant bacteria evolved too quickly", "B  pharmaceutical companies moved to more profitable areas", "C  all known antibiotic compounds had already been tested", "D  government funding was withdrawn"], answer: "B", explanation: "The lecturer says companies 'shifted resources toward more profitable chronic disease treatments'" },
      { num: 37, question: "The golden era of antibiotic discovery lasted approximately", options: ["A  10 years", "B  20 years", "C  30 years", "D  40 years"], answer: "B", explanation: "The golden era ran 'from 1950 to 1970' — roughly 20 years" },
      { num: 38, question: "According to the lecturer, most antibiotics discovered in the golden era came from", options: ["A  synthetic chemicals", "B  marine organisms", "C  soil bacteria", "D  hospital environments"], answer: "C", explanation: "The lecturer states they were discovered 'largely from soil bacteria'" },
      { num: 39, question: "The World Health Organization describes antimicrobial resistance as", options: ["A  a manageable risk with current technology", "B  one of the greatest global health threats", "C  primarily a problem in developing countries", "D  less serious than other infectious diseases"], answer: "B", explanation: "The lecturer quotes WHO listing it as 'one of the greatest global health threats'" },
      { num: 40, question: "Which novel treatment approach is specifically mentioned as an alternative to conventional antibiotics?", options: ["A  gene therapy", "B  vaccination programmes", "C  bacteriophage therapy", "D  surgical interventions"], answer: "C", explanation: "The lecturer mentions 'bacteriophage therapy' as a novel antimicrobial approach" }
    ]
  },
  {
    title: "Lecture: Behavioural Economics and Consumer Choice",
    script: `In today's lecture I want to explore how behavioural economics challenges the traditional economic model of the rational consumer, and what this means for public policy.\n\nClassical economics assumes that individuals make decisions by carefully weighing costs and benefits and choosing the option that maximises their utility. This is known as the rational actor model. However, decades of research by psychologists and economists has demonstrated that real human decision-making deviates from this ideal in systematic and predictable ways.\n\nOne of the most influential concepts is loss aversion, developed by Daniel Kahneman and Amos Tversky in their prospect theory, published in 1979. They found that losses feel approximately twice as painful as equivalent gains feel pleasurable. This explains why people hold onto failing investments far longer than is rational — a phenomenon known as the disposition effect in financial markets.\n\nAnother important bias is the default effect. When people are automatically enrolled in a programme — whether a pension scheme or an organ donation register — they are far more likely to remain in it than if they had to actively opt in. Several countries, including the UK, have used this insight to design opt-out organ donation systems, dramatically increasing donation rates.\n\nPresent bias describes our tendency to place disproportionate weight on immediate rewards compared to future ones. This helps explain low savings rates, poor diet choices, and insufficient exercise — we consistently undervalue future benefits. Commitment devices, such as automatically increasing pension contributions each year, can counteract this bias.\n\nNudge theory, popularised by Thaler and Sunstein in their 2008 book, proposes that policymakers can guide behaviour without mandates or financial incentives, simply by redesigning the choice environment. Placing healthy foods at eye level in cafeterias, for example, increases their selection rates by up to thirty percent without banning unhealthy options.\n\nCritics of nudge theory argue that it can be paternalistic and that transparency is essential — people should know when their choices are being structured. Despite this debate, governments worldwide are investing in behavioural insights units to improve policy outcomes.`,
    sentenceItems: [
      { num: 31, sentenceText: "__BLANK__ is the traditional economic model in which individuals carefully weigh costs and benefits before making decisions.", answer: "The rational actor model" },
      { num: 32, sentenceText: "Kahneman and Tversky found that losses feel approximately __BLANK__ as painful as an equivalent financial gain.", answer: "twice as" },
      { num: 33, sentenceText: "The tendency to remain in programmes one is automatically enrolled in is known as the __BLANK__.", answer: "default effect" },
      { num: 34, sentenceText: "__BLANK__ describes our tendency to place too much weight on immediate rewards at the expense of future benefits.", answer: "Present bias" },
      { num: 35, sentenceText: "Thaler and Sunstein popularised nudge theory in a book published in __BLANK__.", answer: "2008" }
    ],
    mcqItems: [
      { num: 36, question: "The 'disposition effect' refers to the tendency to", options: ["A  invest heavily in new market opportunities", "B  hold onto failing investments for too long", "C  diversify financial portfolios excessively", "D  avoid taking any financial risks"], answer: "B", explanation: "The lecturer says it explains 'why people hold onto failing investments far longer than is rational'" },
      { num: 37, question: "Which country's opt-out organ donation system is specifically mentioned in the lecture?", options: ["A  France", "B  Australia", "C  Germany", "D  the United Kingdom"], answer: "D", explanation: "The lecturer cites 'the UK' as a country using opt-out organ donation" },
      { num: 38, question: "Placing healthy food at eye level in cafeterias increases selection rates by up to", options: ["A  ten percent", "B  twenty percent", "C  thirty percent", "D  forty percent"], answer: "C", explanation: "The lecturer states selection rates increase 'by up to thirty percent'" },
      { num: 39, question: "Critics of nudge theory argue that it", options: ["A  is ineffective in real-world settings", "B  costs too much to implement", "C  can be paternalistic", "D  ignores economic incentives entirely"], answer: "C", explanation: "The lecturer says critics argue 'it can be paternalistic'" },
      { num: 40, question: "How are governments described as responding to behavioural insights research?", options: ["A  banning unhealthy food products", "B  making pension contributions compulsory", "C  investing in behavioural insights units", "D  removing consumer choice from markets"], answer: "C", explanation: "The lecturer says 'governments worldwide are investing in behavioural insights units'" }
    ]
  },
  {
    title: "Lecture: Deep-Sea Ecosystems",
    script: `Today's lecture focuses on deep-sea ecosystems — those found below two hundred metres, where sunlight no longer penetrates.\n\nFor most of scientific history, the deep ocean was assumed to be a near-barren wasteland. This view changed dramatically in 1977 when researchers aboard the submersible Alvin discovered hydrothermal vents at the Galapagos Rift at a depth of two thousand four hundred metres. These vents release superheated water laden with minerals, and around them thrived dense communities of organisms that survive entirely without sunlight.\n\nThe primary producers in vent ecosystems are chemosynthetic bacteria and archaea, which oxidise hydrogen sulphide released by the vents to produce energy — analogous to the way photosynthetic organisms use sunlight at the surface. These microbes form the base of a food web that includes tube worms — some exceeding two metres in length — giant clams, and vent shrimp.\n\nBeyond hydrothermal vents, deep-sea life depends heavily on what scientists call marine snow — a constant fall of organic particles from surface waters including dead organisms, faeces, and shed mucus. This slow rain of organic matter is the primary food source for most deep-sea benthic communities. Rates of marine snow deposition vary significantly with surface productivity.\n\nThe deep sea is also home to bioluminescent organisms — those capable of producing their own light through chemical reactions. Estimates suggest that up to ninety percent of deep-sea creatures are bioluminescent. This light serves functions ranging from attracting prey — as in the iconic anglerfish — to intraspecies communication and camouflage.\n\nDespite covering over sixty percent of the Earth's surface, less than twenty percent of the deep ocean floor has been mapped in high resolution. This lack of knowledge makes it difficult to assess the potential impacts of emerging threats including deep-sea mining for manganese nodules and polymetallic sulphide deposits.\n\nConservation efforts are now focusing on establishing marine protected areas in international waters, though international governance frameworks remain inadequate for the task.`,
    sentenceItems: [
      { num: 31, sentenceText: "Hydrothermal vents were first discovered in 1977 at a depth of __BLANK__ metres in the Galapagos Rift.", answer: "2,400 / two thousand four hundred" },
      { num: 32, sentenceText: "The submersible __BLANK__ carried the researchers who made this landmark discovery.", answer: "Alvin" },
      { num: 33, sentenceText: "Chemosynthetic bacteria use __BLANK__ released by vents to generate energy in the absence of sunlight.", answer: "hydrogen sulphide" },
      { num: 34, sentenceText: "__BLANK__, a constant fall of organic particles from surface waters, is the primary food source for most deep-sea benthic communities.", answer: "Marine snow" },
      { num: 35, sentenceText: "It is estimated that up to __BLANK__ percent of all deep-sea creatures are capable of producing bioluminescence.", answer: "90 / ninety" }
    ],
    mcqItems: [
      { num: 36, question: "The deep sea is defined in the lecture as water found below which depth?", options: ["A  100 metres", "B  200 metres", "C  500 metres", "D  1,000 metres"], answer: "B", explanation: "The lecturer defines the deep sea as 'below two hundred metres'" },
      { num: 37, question: "What do tube worms, giant clams, and vent shrimp have in common according to the lecture?", options: ["A  they all produce bioluminescence", "B  they are found only in polar waters", "C  they live around hydrothermal vents", "D  they depend on marine snow for food"], answer: "C", explanation: "These species are described as part of the food web around hydrothermal vents" },
      { num: 38, question: "Marine snow is described in the lecture as consisting of", options: ["A  dissolved minerals from the seafloor", "B  sediment carried from coastal rivers", "C  organic particles falling from surface waters", "D  chemical compounds from hydrothermal vents"], answer: "C", explanation: "The lecturer describes marine snow as 'a constant fall of organic particles from surface waters'" },
      { num: 39, question: "According to the lecturer, bioluminescence serves functions including", options: ["A  temperature regulation and navigation", "B  attracting prey and intraspecies communication", "C  converting chemicals into usable energy", "D  filtering food particles from seawater"], answer: "B", explanation: "The lecturer mentions 'attracting prey' and 'intraspecies communication'" },
      { num: 40, question: "The lecturer suggests that deep-sea mining is problematic primarily because", options: ["A  the technology does not yet exist", "B  international law prohibits it", "C  less than 20% of the ocean floor has been mapped in detail", "D  mining would destroy all marine snow"], answer: "C", explanation: "The lecturer says this 'makes it difficult to assess the potential impacts' of mining threats" }
    ]
  }
];

// ─── BUILD A TEST ─────────────────────────────────────────────────────────────
function buildTest(n) {
  const num = String(n).padStart(3, "0");
  const p1  = P1_SCENARIOS[(n - 1) % P1_SCENARIOS.length];
  const p2  = P2_SCENARIOS[(n - 1) % P2_SCENARIOS.length];
  const p3  = P3_SCENARIOS[(n - 1) % P3_SCENARIOS.length];
  const p4  = P4_SCENARIOS[(n - 1) % P4_SCENARIOS.length];

  const questions = [];

  // ── Part 1: form_field questions (Q1–10) ─────────────────────────────────
  const blankRows = p1.form.rows.filter(r => r.type === "blank");
  blankRows.forEach(row => {
    questions.push({
      id: `ielts-listening-${num}-q${row.num}`,
      part: 1,
      questionType: "form_field",
      instructions: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
      num: row.num,
      label: row.label || "",
      prefix: row.prefix || "",
      suffix: row.suffix || "",
      labelBlank: row.labelBlank || false,
      labelSuffix: row.labelSuffix || "",
      rightContent: row.rightContent || "",
      answer: row.answer,
      explanation: `The answer "${row.answer}" is stated in the conversation.`
    });
  });

  // ── Part 2: MCQ (Q11–15) + Map labelling (Q16–20) ────────────────────────
  p2.mcqs.forEach((q, i) => {
    const qn = 11 + i;
    questions.push({
      id: `ielts-listening-${num}-q${qn}`,
      part: 2,
      questionType: "multiple_choice",
      instructions: "Choose the correct letter, A, B, C or D.",
      num: qn,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.explanation
    });
  });

  const mapKey = {};
  p2.mapItems.forEach(item => { mapKey[item.label] = item.answer; });

  p2.mapItems.slice(0, 5).forEach((item, i) => {
    const qn = 16 + i;
    questions.push({
      id: `ielts-listening-${num}-q${qn}`,
      part: 2,
      questionType: "map_labelling",
      instructions: `Label the map below. Write the correct letter, A–J, next to questions 16–20.`,
      mapTitle: p2.mapTitle,
      mapDescription: p2.mapDescription,
      mapKey,
      mapLetters: p2.mapItems.map(m => m.label),
      num: qn,
      prompt: item.description,
      correctAnswer: item.label,
      explanation: `The correct letter is ${item.label} (${item.answer}).`
    });
  });

  // ── Part 3: MCQ (Q21–25) + Matching (Q26–30) ─────────────────────────────
  p3.mcqs.forEach((q, i) => {
    const qn = 21 + i;
    questions.push({
      id: `ielts-listening-${num}-q${qn}`,
      part: 3,
      questionType: "multiple_choice",
      instructions: "Choose the correct letter, A, B, C or D.",
      num: qn,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.explanation
    });
  });

  const matchCategories = ["A. She agrees", "B. She is undecided", "C. She disagrees"];
  const matchItems = [
    "introducing new equipment in the laboratory",
    "keeping written records of experiments",
    "sharing results with other research groups",
    "the importance of the project deadline",
    "the proposal to extend the study"
  ];
  const matchAnswers = ["A", "C", "B", "A", "C"];

  for (let i = 0; i < 5; i++) {
    const qn = 26 + i;
    questions.push({
      id: `ielts-listening-${num}-q${qn}`,
      part: 3,
      questionType: "matching_categorise",
      instructions: "What does each speaker say about the following? Write the correct letter, A, B or C, next to questions 26–30.",
      categoryOptions: matchCategories,
      num: qn,
      prompt: matchItems[i],
      correctAnswer: matchAnswers[i],
      explanation: `The speaker's attitude is ${matchCategories.find(c => c.startsWith(matchAnswers[i]))}.`
    });
  }

  // ── Part 4: Q31–35 sentence completion + Q36–40 MCQ ──────────────────────
  p4.sentenceItems.forEach(item => {
    questions.push({
      id: `ielts-listening-${num}-q${item.num}`,
      part: 4,
      questionType: "sentence_completion",
      instructions: "Complete each sentence with NO MORE THAN THREE WORDS.",
      num: item.num,
      sentenceText: item.sentenceText,
      correctAnswer: item.answer,
      explanation: `The correct answer is: "${item.answer}".`
    });
  });

  p4.mcqItems.forEach(item => {
    questions.push({
      id: `ielts-listening-${num}-q${item.num}`,
      part: 4,
      questionType: "multiple_choice",
      instructions: "Choose the correct letter, A, B, C or D.",
      num: item.num,
      prompt: item.question,
      options: item.options,
      correctAnswer: item.answer,
      explanation: item.explanation
    });
  });

  const allQ = questions.sort((a, b) => a.num - b.num);

  const scripts = [
    {
      id: `ielts-listening-${num}-p1`,
      part: 1,
      title: p1.title,
      text: p1.script,
      formLayout: {
        title: p1.form.title,
        example: p1.form.example,
        rows: p1.form.rows
      }
    },
    { id: `ielts-listening-${num}-p2`, part: 2, title: p2.title, text: p2.script },
    { id: `ielts-listening-${num}-p3`, part: 3, title: p3.title, text: p3.script },
    { id: `ielts-listening-${num}-p4`, part: 4, title: p4.title, text: p4.script }
  ];

  return {
    id: `ielts-listening-${num}`,
    exam: "ielts",
    section: "listening",
    title: `IELTS Listening Practice Test ${n}`,
    durationSeconds: 1800,
    questionCount: 40,
    listeningScripts: scripts,
    questions: allQ
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (let n = 1; n <= 30; n++) {
  const test = buildTest(n);
  const outPath = path.join(OUT_DIR, `test-${String(n).padStart(3, "0")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(test, null, 2), "utf8");
  console.log(`  Written test-${String(n).padStart(3, "0")}.json — ${test.questions.length} questions`);
}

console.log(`\nDone. 30 IELTS listening tests written to ${OUT_DIR}`);
