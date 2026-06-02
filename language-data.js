"use strict";
(function() {
  const GERMAN = {
    id: "german",
    name: "German",
    native: "Deutsch",
    flag: "\u{1F1E9}\u{1F1EA}",
    blurb: "Study tuition-free in Germany, Austria & Switzerland. German is the #1 language for affordable, high-quality study abroad.",
    why: [
      "Germany has world-class universities with little or no tuition \u2014 but most programmes and daily life need German.",
      "A1\u2013B1 German unlocks the Germany student visa, blocked-account jobs, and far better part-time work.",
      "Austria, Switzerland and Liechtenstein also study in German.",
      "Speaking German makes settling, working and getting PR dramatically easier."
    ],
    exams: [
      { name: "Goethe-Zertifikat (A1\u2013C2)", desc: "The most recognised German exam worldwide \u2014 accepted for study, work and visas." },
      { name: "TestDaF", desc: "Academic German for university admission (level B2/C1). Required by many Master's programmes." },
      { name: "telc Deutsch", desc: "Widely accepted in Germany for jobs, residence and integration courses." },
      { name: "TestAS", desc: "Aptitude test for international students applying to German universities." },
      { name: "DSH", desc: "University-run German exam (DSH-1/2/3) for admission to German-taught degrees." }
    ],
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    course: [
      {
        id: "de-a1-u1",
        level: "A1",
        title: "Greetings & Introductions",
        grammar: "German has formal (Sie) and informal (du) 'you'. Use Sie with strangers and in formal settings, du with friends and family.",
        vocab: [
          { w: "Hallo", en: "Hello", ex: "Hallo! Wie geht es dir?" },
          { w: "Guten Morgen", en: "Good morning", ex: "Guten Morgen, Frau M\xFCller." },
          { w: "Guten Tag", en: "Good day / Hello", ex: "Guten Tag, ich hei\xDFe Anna." },
          { w: "Guten Abend", en: "Good evening", ex: "Guten Abend zusammen!" },
          { w: "Gute Nacht", en: "Good night", ex: "Gute Nacht, schlaf gut!" },
          { w: "Tsch\xFCss", en: "Bye", ex: "Tsch\xFCss, bis morgen!" },
          { w: "Auf Wiedersehen", en: "Goodbye (formal)", ex: "Auf Wiedersehen, Herr Klein." },
          { w: "Ich hei\xDFe \u2026", en: "My name is \u2026", ex: "Ich hei\xDFe Sofia." },
          { w: "Wie hei\xDFt du?", en: "What's your name? (informal)", ex: "Hallo, wie hei\xDFt du?" },
          { w: "Wie geht es dir?", en: "How are you?", ex: "Wie geht es dir heute?" },
          { w: "Mir geht es gut", en: "I'm fine", ex: "Danke, mir geht es gut." },
          { w: "Danke", en: "Thank you", ex: "Danke sch\xF6n!" },
          { w: "Bitte", en: "Please / You're welcome", ex: "Bitte, gern geschehen." },
          { w: "Ja / Nein", en: "Yes / No", ex: "Ja, gern. Nein, danke." }
        ]
      },
      {
        id: "de-a1-u2",
        level: "A1",
        title: "Numbers, Days & Time",
        grammar: "German numbers above 20 are 'reversed': 21 = einundzwanzig (one-and-twenty). 'Uhr' = o'clock; 'halb drei' = 2:30 (half to three).",
        vocab: [
          { w: "eins, zwei, drei", en: "one, two, three", ex: "Ich habe drei B\xFCcher." },
          { w: "vier, f\xFCnf, sechs", en: "four, five, six", ex: "Es ist sechs Uhr." },
          { w: "sieben, acht, neun, zehn", en: "seven \u2026 ten", ex: "Zehn Euro, bitte." },
          { w: "elf, zw\xF6lf", en: "eleven, twelve", ex: "Es ist zw\xF6lf Uhr." },
          { w: "zwanzig", en: "twenty", ex: "Ich bin zwanzig Jahre alt." },
          { w: "einundzwanzig", en: "twenty-one", ex: "Er ist einundzwanzig." },
          { w: "hundert", en: "hundred", ex: "Das kostet hundert Euro." },
          { w: "Montag, Dienstag", en: "Monday, Tuesday", ex: "Am Montag habe ich Deutsch." },
          { w: "Samstag, Sonntag", en: "Saturday, Sunday", ex: "Am Sonntag schlafe ich lange." },
          { w: "Wochenende", en: "weekend", ex: "Sch\xF6nes Wochenende!" },
          { w: "heute / morgen / gestern", en: "today / tomorrow / yesterday", ex: "Heute ist Dienstag." },
          { w: "Wie sp\xE4t ist es?", en: "What time is it?", ex: "Entschuldigung, wie sp\xE4t ist es?" },
          { w: "Es ist halb drei", en: "It's half past two (2:30)", ex: "Es ist halb drei." },
          { w: "Viertel nach / vor", en: "quarter past / to", ex: "Viertel nach acht." }
        ]
      },
      {
        id: "de-a1-u3",
        level: "A1",
        title: "Articles & Gender (der/die/das)",
        grammar: "Every German noun has a gender: der (m), die (f), das (n). Always learn the article WITH the noun. The plural article is always 'die'.",
        vocab: [
          { w: "der Mann", en: "the man", ex: "Der Mann ist nett." },
          { w: "die Frau", en: "the woman", ex: "Die Frau hei\xDFt Maria." },
          { w: "das Kind", en: "the child", ex: "Das Kind spielt." },
          { w: "der Tisch", en: "the table", ex: "Der Tisch ist gro\xDF." },
          { w: "die Lampe", en: "the lamp", ex: "Die Lampe ist neu." },
          { w: "das Buch", en: "the book", ex: "Das Buch ist interessant." },
          { w: "der Stuhl", en: "the chair", ex: "Der Stuhl ist bequem." },
          { w: "die T\xFCr", en: "the door", ex: "Die T\xFCr ist offen." },
          { w: "das Fenster", en: "the window", ex: "Das Fenster ist gro\xDF." },
          { w: "ein / eine", en: "a / an (m,n / f)", ex: "Ich habe eine Frage." },
          { w: "kein / keine", en: "no / not a", ex: "Ich habe keine Zeit." },
          { w: "die B\xFCcher", en: "the books (plural)", ex: "Die B\xFCcher sind teuer." }
        ]
      },
      {
        id: "de-a1-u4",
        level: "A1",
        title: "Present Tense & Common Verbs",
        grammar: "Regular verbs: stem + endings -e, -st, -t, -en, -t, -en. 'sein' (to be): ich bin, du bist, er ist, wir sind. 'haben' (to have): ich habe, du hast, er hat.",
        vocab: [
          { w: "sein (ich bin)", en: "to be (I am)", ex: "Ich bin Student." },
          { w: "haben (ich habe)", en: "to have (I have)", ex: "Ich habe Zeit." },
          { w: "kommen", en: "to come", ex: "Ich komme aus Indien." },
          { w: "wohnen", en: "to live", ex: "Ich wohne in Berlin." },
          { w: "sprechen", en: "to speak", ex: "Sprichst du Deutsch?" },
          { w: "lernen", en: "to learn", ex: "Ich lerne Deutsch." },
          { w: "arbeiten", en: "to work", ex: "Er arbeitet in M\xFCnchen." },
          { w: "verstehen", en: "to understand", ex: "Ich verstehe das nicht." },
          { w: "gehen", en: "to go", ex: "Ich gehe zur Uni." },
          { w: "machen", en: "to do / make", ex: "Was machst du?" },
          { w: "essen / trinken", en: "to eat / drink", ex: "Ich esse einen Apfel." },
          { w: "hei\xDFen", en: "to be called", ex: "Wie hei\xDFt du?" }
        ]
      },
      {
        id: "de-a1-u5",
        level: "A1",
        title: "Family & People",
        grammar: "Possessives: mein (my), dein (your), sein/ihr (his/her). They take -e before feminine/plural nouns: meine Mutter, mein Vater.",
        vocab: [
          { w: "die Familie", en: "the family", ex: "Meine Familie ist gro\xDF." },
          { w: "die Mutter", en: "the mother", ex: "Meine Mutter hei\xDFt Petra." },
          { w: "der Vater", en: "the father", ex: "Mein Vater arbeitet viel." },
          { w: "die Eltern", en: "the parents", ex: "Meine Eltern wohnen in Indien." },
          { w: "der Bruder", en: "the brother", ex: "Mein Bruder ist 18." },
          { w: "die Schwester", en: "the sister", ex: "Meine Schwester studiert." },
          { w: "der Freund / die Freundin", en: "friend (m / f)", ex: "Mein Freund hei\xDFt Tom." },
          { w: "der Mann / die Frau", en: "husband / wife", ex: "Das ist meine Frau." },
          { w: "das Kind / die Kinder", en: "child / children", ex: "Sie haben zwei Kinder." },
          { w: "jung / alt", en: "young / old", ex: "Mein Bruder ist jung." },
          { w: "verheiratet / ledig", en: "married / single", ex: "Ich bin ledig." }
        ]
      },
      {
        id: "de-a1-u6",
        level: "A1",
        title: "Food, Drink & the Caf\xE9",
        grammar: "Order politely with 'Ich m\xF6chte \u2026' or 'Ich nehme \u2026' (I'll take \u2026). 'einen' (m), 'eine' (f), 'ein' (n) are accusative articles after these verbs.",
        vocab: [
          { w: "das Wasser", en: "water", ex: "Ein Wasser, bitte." },
          { w: "der Kaffee", en: "coffee", ex: "Ich m\xF6chte einen Kaffee." },
          { w: "der Tee", en: "tea", ex: "Ich trinke gern Tee." },
          { w: "das Brot", en: "bread", ex: "Das Brot ist frisch." },
          { w: "der Apfel", en: "apple", ex: "Ich esse einen Apfel." },
          { w: "das Ei / die Eier", en: "egg / eggs", ex: "Ich m\xF6chte zwei Eier." },
          { w: "der K\xE4se", en: "cheese", ex: "Der K\xE4se ist lecker." },
          { w: "die Milch", en: "milk", ex: "Mit Milch, bitte." },
          { w: "das Bier", en: "beer", ex: "Ein Bier, bitte." },
          { w: "Ich m\xF6chte \u2026", en: "I would like \u2026", ex: "Ich m\xF6chte ein Brot, bitte." },
          { w: "die Rechnung, bitte", en: "the bill, please", ex: "Die Rechnung, bitte!" },
          { w: "lecker", en: "tasty", ex: "Das schmeckt lecker." }
        ]
      },
      {
        id: "de-a1-u7",
        level: "A1",
        title: "Shopping & Prices",
        grammar: "Ask prices with 'Was kostet \u2026?' (singular) / 'Was kosten \u2026?' (plural). Euro amounts: 'drei Euro f\xFCnfzig' = \u20AC3.50.",
        vocab: [
          { w: "Was kostet das?", en: "How much is that?", ex: "Was kostet das Ticket?" },
          { w: "der Euro / der Cent", en: "euro / cent", ex: "Das kostet f\xFCnf Euro." },
          { w: "billig / teuer", en: "cheap / expensive", ex: "Das ist zu teuer." },
          { w: "das Geld", en: "money", ex: "Ich habe kein Geld dabei." },
          { w: "der Supermarkt", en: "supermarket", ex: "Ich gehe in den Supermarkt." },
          { w: "die Kasse", en: "the checkout", ex: "Die Kasse ist dort." },
          { w: "bar / mit Karte", en: "cash / by card", ex: "Mit Karte, bitte." },
          { w: "die T\xFCte", en: "the bag", ex: "Eine T\xFCte, bitte." },
          { w: "kaufen", en: "to buy", ex: "Ich kaufe Brot und Milch." },
          { w: "die Gr\xF6\xDFe", en: "the size", ex: "Welche Gr\xF6\xDFe haben Sie?" },
          { w: "zusammen / getrennt", en: "together / separately", ex: "Zusammen oder getrennt?" }
        ]
      },
      {
        id: "de-a1-u8",
        level: "A1",
        title: "Daily Routine & Hobbies",
        grammar: "Frequency words go after the verb: 'Ich spiele oft Fu\xDFball.' Use 'gern' to say you like doing something: 'Ich lese gern.'",
        vocab: [
          { w: "aufstehen", en: "to get up", ex: "Ich stehe um sieben Uhr auf." },
          { w: "fr\xFChst\xFCcken", en: "to have breakfast", ex: "Ich fr\xFChst\xFCcke um acht." },
          { w: "schlafen", en: "to sleep", ex: "Ich schlafe acht Stunden." },
          { w: "spielen", en: "to play", ex: "Ich spiele gern Tennis." },
          { w: "lesen", en: "to read", ex: "Am Abend lese ich ein Buch." },
          { w: "h\xF6ren", en: "to listen", ex: "Ich h\xF6re gern Musik." },
          { w: "der Sport / der Fu\xDFball", en: "sport / football", ex: "Fu\xDFball ist mein Hobby." },
          { w: "die Musik / der Film", en: "music / film", ex: "Ich sehe gern Filme." },
          { w: "oft / manchmal / nie", en: "often / sometimes / never", ex: "Ich koche manchmal." },
          { w: "gern", en: "(to like doing)", ex: "Ich schwimme gern." },
          { w: "das Hobby", en: "the hobby", ex: "Was ist dein Hobby?" }
        ]
      },
      {
        id: "de-a1-u9",
        level: "A1",
        title: "City, Directions & Transport",
        grammar: "Ask the way with 'Wo ist \u2026?' (Where is \u2026?). Answer with 'links' (left), 'rechts' (right), 'geradeaus' (straight ahead).",
        vocab: [
          { w: "Wo ist \u2026?", en: "Where is \u2026?", ex: "Wo ist der Bahnhof?" },
          { w: "der Bahnhof", en: "the train station", ex: "Der Bahnhof ist dort." },
          { w: "die Haltestelle", en: "the (bus) stop", ex: "Die Haltestelle ist hier." },
          { w: "der Bus / die U-Bahn", en: "bus / underground", ex: "Ich fahre mit dem Bus." },
          { w: "der Zug", en: "the train", ex: "Der Zug kommt um neun." },
          { w: "links / rechts", en: "left / right", ex: "Gehen Sie nach links." },
          { w: "geradeaus", en: "straight ahead", ex: "Gehen Sie geradeaus." },
          { w: "die Stra\xDFe", en: "the street", ex: "Die Stra\xDFe ist lang." },
          { w: "die Apotheke", en: "the pharmacy", ex: "Wo ist die Apotheke?" },
          { w: "das Krankenhaus", en: "the hospital", ex: "Das Krankenhaus ist gro\xDF." },
          { w: "die Karte / das Ticket", en: "map / ticket", ex: "Ein Ticket, bitte." }
        ]
      },
      {
        id: "de-a1-u10",
        level: "A1",
        title: "Survival German (uni, bank, doctor)",
        grammar: "Polite requests: 'K\xF6nnten Sie \u2026?' (Could you \u2026?) and 'Ich brauche \u2026' (I need \u2026). Say you don't understand: 'Ich verstehe nicht. Langsam, bitte.'",
        vocab: [
          { w: "Entschuldigung", en: "Excuse me / Sorry", ex: "Entschuldigung, wo ist die Uni?" },
          { w: "Ich verstehe nicht", en: "I don't understand", ex: "Langsam, bitte. Ich verstehe nicht." },
          { w: "Sprechen Sie Englisch?", en: "Do you speak English?", ex: "Sprechen Sie Englisch?" },
          { w: "K\xF6nnen Sie das wiederholen?", en: "Can you repeat that?", ex: "K\xF6nnen Sie das bitte wiederholen?" },
          { w: "die Universit\xE4t", en: "the university", ex: "Die Universit\xE4t ist gro\xDF." },
          { w: "die Wohnung", en: "the apartment", ex: "Ich suche eine Wohnung." },
          { w: "das Konto", en: "the (bank) account", ex: "Ich brauche ein Konto." },
          { w: "der Termin", en: "the appointment", ex: "Ich habe einen Termin." },
          { w: "der Arzt / die \xC4rztin", en: "doctor (m / f)", ex: "Ich gehe zum Arzt." },
          { w: "der Ausweis / der Pass", en: "ID / passport", ex: "Hier ist mein Pass." },
          { w: "Hilfe!", en: "Help!", ex: "K\xF6nnen Sie mir helfen?" }
        ]
      }
    ],
    quiz: [
      { q: "How do you say 'Good morning' in German?", options: ["Guten Abend", "Guten Morgen", "Gute Nacht", "Guten Tag"], answer: 1 },
      { q: "'Ich hei\xDFe Anna' means \u2026", options: ["I live in Anna", "I like Anna", "My name is Anna", "I am from Anna"], answer: 2 },
      { q: "Which is the correct article for 'Frau' (woman)?", options: ["der", "die", "das", "den"], answer: 1 },
      { q: "'Danke' means \u2026", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
      { q: "How do you ask 'What's your name?' (informal)?", options: ["Wie geht's?", "Wie hei\xDFt du?", "Wer bist du?", "Wo wohnst du?"], answer: 1 },
      { q: "The number 'zwanzig' is \u2026", options: ["12", "20", "2", "200"], answer: 1 },
      { q: "'Ich komme aus Indien' means \u2026", options: ["I live in India", "I come from India", "I go to India", "I like India"], answer: 1 },
      { q: "Formal 'you' in German is \u2026", options: ["du", "ihr", "Sie", "es"], answer: 2 },
      { q: "'Was kostet das?' means \u2026", options: ["What is that?", "Where is that?", "How much is that?", "Who is that?"], answer: 2 },
      { q: "The verb 'lernen' means \u2026", options: ["to live", "to learn", "to work", "to come"], answer: 1 },
      { q: "'Meine Mutter' means \u2026", options: ["my father", "my sister", "my mother", "my friend"], answer: 2 },
      { q: "Which means 'turn left'?", options: ["nach rechts", "geradeaus", "nach links", "zur\xFCck"], answer: 2 },
      { q: "'Ich m\xF6chte einen Kaffee' means \u2026", options: ["I have a coffee", "I would like a coffee", "I make a coffee", "I see a coffee"], answer: 1 },
      { q: "The plural of 'das Buch' is \u2026", options: ["die Buchs", "die B\xFCcher", "die Buche", "der B\xFCcher"], answer: 1 }
    ]
  };
  const FRENCH = {
    id: "french",
    name: "French",
    native: "Fran\xE7ais",
    flag: "\u{1F1EB}\u{1F1F7}",
    blurb: "Study in France, Belgium, parts of Canada (Qu\xE9bec) and Switzerland. French opens affordable EU study and a huge job market.",
    why: [
      "France has low-tuition public universities and the Campus France pathway \u2014 French helps admission and daily life.",
      "Qu\xE9bec (Canada) actively recruits French-speaking students with fast PR routes.",
      "DELF/DALF and TCF are accepted for study and immigration across the Francophone world."
    ],
    exams: [
      { name: "DELF (A1\u2013B2)", desc: "Dipl\xF4me d'\xE9tudes en langue fran\xE7aise \u2014 lifelong, recognised for study & immigration." },
      { name: "DALF (C1\u2013C2)", desc: "Advanced French diploma for university and professional use." },
      { name: "TCF", desc: "Test de connaissance du fran\xE7ais \u2014 used for Campus France, Qu\xE9bec immigration and citizenship." },
      { name: "TEF", desc: "Accepted for Canadian immigration (Express Entry) and French nationality." }
    ],
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    course: [
      {
        id: "fr-a1-u1",
        level: "A1",
        title: "Greetings & Introductions",
        grammar: "French has formal (vous) and informal (tu) 'you'. Use vous with strangers, tu with friends. 'Je m'appelle \u2026' = my name is \u2026",
        vocab: [
          { w: "Bonjour", en: "Hello / Good day", ex: "Bonjour, comment allez-vous ?" },
          { w: "Salut", en: "Hi (informal)", ex: "Salut ! \xC7a va ?" },
          { w: "Bonsoir", en: "Good evening", ex: "Bonsoir, madame." },
          { w: "Au revoir", en: "Goodbye", ex: "Au revoir, \xE0 demain !" },
          { w: "\xC0 bient\xF4t", en: "See you soon", ex: "\xC0 bient\xF4t !" },
          { w: "Je m'appelle \u2026", en: "My name is \u2026", ex: "Je m'appelle L\xE9a." },
          { w: "Comment tu t'appelles ?", en: "What's your name? (informal)", ex: "Comment tu t'appelles ?" },
          { w: "Comment \xE7a va ?", en: "How are you?", ex: "Salut, comment \xE7a va ?" },
          { w: "\xC7a va bien", en: "I'm fine", ex: "\xC7a va bien, merci." },
          { w: "Enchant\xE9(e)", en: "Nice to meet you", ex: "Enchant\xE9 de vous rencontrer." },
          { w: "Merci", en: "Thank you", ex: "Merci beaucoup !" },
          { w: "S'il vous pla\xEEt", en: "Please (formal)", ex: "Un caf\xE9, s'il vous pla\xEEt." },
          { w: "Oui / Non", en: "Yes / No", ex: "Oui, merci. Non, merci." }
        ]
      },
      {
        id: "fr-a1-u2",
        level: "A1",
        title: "Numbers, Days & Time",
        grammar: "French nouns are masculine (le) or feminine (la). Learn the article with the noun. Plural = les. Time: 'Il est trois heures' = it's 3 o'clock.",
        vocab: [
          { w: "un, deux, trois", en: "one, two, three", ex: "J'ai trois livres." },
          { w: "quatre, cinq, six", en: "four, five, six", ex: "Il est six heures." },
          { w: "sept, huit, neuf, dix", en: "seven \u2026 ten", ex: "Dix euros, s'il vous pla\xEEt." },
          { w: "vingt", en: "twenty", ex: "J'ai vingt ans." },
          { w: "cent", en: "hundred", ex: "\xC7a co\xFBte cent euros." },
          { w: "lundi, mardi", en: "Monday, Tuesday", ex: "Lundi, j'ai un cours." },
          { w: "le week-end", en: "the weekend", ex: "Bon week-end !" },
          { w: "aujourd'hui / demain", en: "today / tomorrow", ex: "Aujourd'hui, c'est lundi." },
          { w: "Quelle heure est-il ?", en: "What time is it?", ex: "Excusez-moi, quelle heure est-il ?" },
          { w: "Il est midi", en: "It's noon", ex: "Il est midi pile." },
          { w: "et demie / et quart", en: "half past / quarter past", ex: "Il est huit heures et demie." }
        ]
      },
      {
        id: "fr-a1-u3",
        level: "A1",
        title: "Articles, Gender & Common Verbs",
        grammar: "le (m) / la (f) / les (plural). Key verbs: \xEAtre (je suis, tu es, il est) and avoir (j'ai, tu as, il a). Regular -er: je parle, tu parles, nous parlons.",
        vocab: [
          { w: "le / la / les", en: "the (m / f / plural)", ex: "La fille et le gar\xE7on." },
          { w: "un / une", en: "a / an (m / f)", ex: "J'ai une question." },
          { w: "\xEAtre (je suis)", en: "to be (I am)", ex: "Je suis \xE9tudiant." },
          { w: "avoir (j'ai)", en: "to have (I have)", ex: "J'ai un livre." },
          { w: "parler", en: "to speak", ex: "Je parle fran\xE7ais." },
          { w: "habiter", en: "to live", ex: "J'habite \xE0 Lyon." },
          { w: "venir", en: "to come", ex: "Je viens d'Inde." },
          { w: "aller", en: "to go", ex: "Je vais \xE0 l'universit\xE9." },
          { w: "faire", en: "to do / make", ex: "Qu'est-ce que tu fais ?" },
          { w: "comprendre", en: "to understand", ex: "Je ne comprends pas." },
          { w: "ne \u2026 pas", en: "not (negation)", ex: "Je ne parle pas allemand." }
        ]
      },
      {
        id: "fr-a1-u4",
        level: "A1",
        title: "Family & People",
        grammar: "Possessives: mon/ma/mes (my), ton/ta/tes (your). Use mon before masculine, ma before feminine: mon p\xE8re, ma m\xE8re, mes parents.",
        vocab: [
          { w: "la famille", en: "the family", ex: "Ma famille est grande." },
          { w: "la m\xE8re / le p\xE8re", en: "mother / father", ex: "Ma m\xE8re s'appelle Marie." },
          { w: "les parents", en: "parents", ex: "Mes parents habitent en Inde." },
          { w: "le fr\xE8re / la s\u0153ur", en: "brother / sister", ex: "Mon fr\xE8re a 18 ans." },
          { w: "l'ami / l'amie", en: "friend (m / f)", ex: "Mon ami s'appelle Paul." },
          { w: "le mari / la femme", en: "husband / wife", ex: "C'est ma femme." },
          { w: "l'enfant / les enfants", en: "child / children", ex: "Ils ont deux enfants." },
          { w: "jeune / vieux", en: "young / old", ex: "Mon fr\xE8re est jeune." },
          { w: "mari\xE9(e) / c\xE9libataire", en: "married / single", ex: "Je suis c\xE9libataire." },
          { w: "le gar\xE7on / la fille", en: "boy / girl", ex: "La fille est gentille." }
        ]
      },
      {
        id: "fr-a1-u5",
        level: "A1",
        title: "Food, Drink & the Caf\xE9",
        grammar: "Order with 'Je voudrais \u2026' (I would like \u2026) or 'Je prends \u2026' (I'll have \u2026). 'un' (m), 'une' (f), 'du/de la' (some).",
        vocab: [
          { w: "l'eau", en: "water", ex: "Une eau, s'il vous pla\xEEt." },
          { w: "le caf\xE9", en: "coffee", ex: "Je voudrais un caf\xE9." },
          { w: "le th\xE9", en: "tea", ex: "J'aime le th\xE9." },
          { w: "le pain", en: "bread", ex: "Le pain est frais." },
          { w: "la pomme", en: "apple", ex: "Je mange une pomme." },
          { w: "le fromage", en: "cheese", ex: "Le fromage est bon." },
          { w: "le lait", en: "milk", ex: "Avec du lait, s'il vous pla\xEEt." },
          { w: "le vin", en: "wine", ex: "Un verre de vin, s'il vous pla\xEEt." },
          { w: "Je voudrais \u2026", en: "I would like \u2026", ex: "Je voudrais un th\xE9." },
          { w: "L'addition, s'il vous pla\xEEt", en: "The bill, please", ex: "L'addition, s'il vous pla\xEEt !" },
          { w: "d\xE9licieux", en: "delicious", ex: "C'est d\xE9licieux !" }
        ]
      },
      {
        id: "fr-a1-u6",
        level: "A1",
        title: "Shopping & Prices",
        grammar: "Ask prices with 'Combien \xE7a co\xFBte ?' or 'C'est combien ?'. Euro amounts: 'trois euros cinquante' = \u20AC3.50.",
        vocab: [
          { w: "Combien \xE7a co\xFBte ?", en: "How much is it?", ex: "Combien \xE7a co\xFBte ?" },
          { w: "l'euro / le centime", en: "euro / cent", ex: "\xC7a co\xFBte cinq euros." },
          { w: "cher / pas cher", en: "expensive / cheap", ex: "C'est trop cher." },
          { w: "l'argent", en: "money", ex: "Je n'ai pas d'argent." },
          { w: "le supermarch\xE9", en: "supermarket", ex: "Je vais au supermarch\xE9." },
          { w: "la caisse", en: "the checkout", ex: "La caisse est l\xE0-bas." },
          { w: "en esp\xE8ces / par carte", en: "cash / by card", ex: "Par carte, s'il vous pla\xEEt." },
          { w: "le sac", en: "the bag", ex: "Un sac, s'il vous pla\xEEt." },
          { w: "acheter", en: "to buy", ex: "J'ach\xE8te du pain." },
          { w: "la taille", en: "the size", ex: "Quelle taille ?" }
        ]
      },
      {
        id: "fr-a1-u7",
        level: "A1",
        title: "Daily Routine & Hobbies",
        grammar: "Say what you like with 'J'aime \u2026' + verb: 'J'aime lire.' Frequency: souvent (often), parfois (sometimes), jamais (never).",
        vocab: [
          { w: "se lever", en: "to get up", ex: "Je me l\xE8ve \xE0 sept heures." },
          { w: "dormir", en: "to sleep", ex: "Je dors huit heures." },
          { w: "manger", en: "to eat", ex: "Je mange \xE0 midi." },
          { w: "jouer", en: "to play", ex: "Je joue au foot." },
          { w: "lire", en: "to read", ex: "J'aime lire le soir." },
          { w: "\xE9couter", en: "to listen", ex: "J'\xE9coute de la musique." },
          { w: "regarder", en: "to watch", ex: "Je regarde un film." },
          { w: "le sport / le foot", en: "sport / football", ex: "Le foot est mon hobby." },
          { w: "souvent / parfois / jamais", en: "often / sometimes / never", ex: "Je cuisine parfois." },
          { w: "J'aime \u2026", en: "I like \u2026", ex: "J'aime nager." }
        ]
      },
      {
        id: "fr-a1-u8",
        level: "A1",
        title: "City, Directions & Survival",
        grammar: "Ask the way with 'O\xF9 est \u2026?'. Directions: \xE0 gauche (left), \xE0 droite (right), tout droit (straight ahead). 'Je ne comprends pas' = I don't understand.",
        vocab: [
          { w: "O\xF9 est \u2026?", en: "Where is \u2026?", ex: "O\xF9 est la gare ?" },
          { w: "la gare", en: "the train station", ex: "La gare est l\xE0-bas." },
          { w: "l'arr\xEAt de bus", en: "the bus stop", ex: "L'arr\xEAt de bus est ici." },
          { w: "le bus / le m\xE9tro", en: "bus / underground", ex: "Je prends le m\xE9tro." },
          { w: "\xE0 gauche / \xE0 droite", en: "left / right", ex: "Tournez \xE0 gauche." },
          { w: "tout droit", en: "straight ahead", ex: "Allez tout droit." },
          { w: "la rue", en: "the street", ex: "La rue est longue." },
          { w: "Excusez-moi", en: "Excuse me", ex: "Excusez-moi, o\xF9 est la gare ?" },
          { w: "Je ne comprends pas", en: "I don't understand", ex: "D\xE9sol\xE9, je ne comprends pas." },
          { w: "Parlez-vous anglais ?", en: "Do you speak English?", ex: "Parlez-vous anglais ?" },
          { w: "l'universit\xE9 / l'appartement", en: "university / apartment", ex: "Je cherche un appartement." }
        ]
      }
    ],
    quiz: [
      { q: "How do you say 'Hello / Good day' in French?", options: ["Bonsoir", "Au revoir", "Bonjour", "Merci"], answer: 2 },
      { q: "'Je m'appelle L\xE9a' means \u2026", options: ["I like L\xE9a", "My name is L\xE9a", "I live in L\xE9a", "I call L\xE9a"], answer: 1 },
      { q: "'Merci' means \u2026", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
      { q: "The feminine article 'the' is \u2026", options: ["le", "la", "les", "un"], answer: 1 },
      { q: "'Combien \xE7a co\xFBte ?' means \u2026", options: ["Where is it?", "How much is it?", "What is it?", "Who is it?"], answer: 1 },
      { q: "Formal 'you' in French is \u2026", options: ["tu", "il", "vous", "on"], answer: 2 },
      { q: "'Je voudrais un caf\xE9' means \u2026", options: ["I have a coffee", "I would like a coffee", "I make a coffee", "I see a coffee"], answer: 1 },
      { q: "Which exam is used for Canadian immigration?", options: ["DELF only", "TEF / TCF", "Goethe", "IELTS"], answer: 1 },
      { q: "'Ma m\xE8re' means \u2026", options: ["my father", "my sister", "my mother", "my friend"], answer: 2 },
      { q: "Which means 'turn right'?", options: ["\xE0 gauche", "tout droit", "\xE0 droite", "en arri\xE8re"], answer: 2 },
      { q: "The verb 'habiter' means \u2026", options: ["to eat", "to live", "to buy", "to read"], answer: 1 },
      { q: "'Quelle heure est-il ?' asks about \u2026", options: ["the price", "the time", "the name", "the place"], answer: 1 }
    ]
  };
  window.LP_LANGUAGES = { german: GERMAN, french: FRENCH };
  window.LP_LANGUAGE_ORDER = ["german", "french"];
})();
