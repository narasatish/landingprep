/* global window */
"use strict";
// LandingPrep — Language Learning Hub data (German = flagship, French secondary).
// Data-driven so courses/levels expand without touching the UI. Pronunciation uses
// the live natural voice (window.LP_TTS.speakOne). Schema:
//   { id, name, native, flag, blurb, why[], exams[{name,desc}], levels[],
//     course:[{id,level,title,grammar, vocab:[{w,en,ex}], phrases:[{w,en}]}],
//     quiz:[{q,options[],answer}] }
(function () {
  const GERMAN = {
    id: "german", name: "German", native: "Deutsch", flag: "🇩🇪",
    blurb: "Study tuition-free in Germany, Austria & Switzerland. German is the #1 language for affordable, high-quality study abroad.",
    why: [
      "Germany has world-class universities with little or no tuition — but most programmes and daily life need German.",
      "A1–B1 German unlocks the Germany student visa, blocked-account jobs, and far better part-time work.",
      "Austria, Switzerland and Liechtenstein also study in German.",
      "Speaking German makes settling, working and getting PR dramatically easier.",
    ],
    exams: [
      { name: "Goethe-Zertifikat (A1–C2)", desc: "The most recognised German exam worldwide — accepted for study, work and visas." },
      { name: "TestDaF", desc: "Academic German for university admission (level B2/C1). Required by many Master's programmes." },
      { name: "telc Deutsch", desc: "Widely accepted in Germany for jobs, residence and integration courses." },
      { name: "TestAS", desc: "Aptitude test for international students applying to German universities." },
      { name: "DSH", desc: "University-run German exam (DSH-1/2/3) for admission to German-taught degrees." },
    ],
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    course: [
      {
        id: "de-a1-u1", level: "A1", title: "Greetings & Introductions",
        grammar: "German has formal (Sie) and informal (du) 'you'. Use Sie with strangers and in formal settings, du with friends and family.",
        vocab: [
          { w: "Hallo", en: "Hello", ex: "Hallo! Wie geht es dir?" },
          { w: "Guten Morgen", en: "Good morning", ex: "Guten Morgen, Frau Müller." },
          { w: "Guten Tag", en: "Good day / Hello", ex: "Guten Tag, ich heiße Anna." },
          { w: "Guten Abend", en: "Good evening", ex: "Guten Abend zusammen!" },
          { w: "Tschüss", en: "Bye", ex: "Tschüss, bis morgen!" },
          { w: "Auf Wiedersehen", en: "Goodbye (formal)", ex: "Auf Wiedersehen, Herr Klein." },
          { w: "Ich heiße …", en: "My name is …", ex: "Ich heiße Sofia." },
          { w: "Wie heißt du?", en: "What's your name? (informal)", ex: "Hallo, wie heißt du?" },
          { w: "Wie geht es dir?", en: "How are you?", ex: "Wie geht es dir heute?" },
          { w: "Danke", en: "Thank you", ex: "Danke schön!" },
          { w: "Bitte", en: "Please / You're welcome", ex: "Bitte, gern geschehen." },
          { w: "Ja / Nein", en: "Yes / No", ex: "Ja, gern. Nein, danke." },
        ],
      },
      {
        id: "de-a1-u2", level: "A1", title: "Numbers, Days & Time",
        grammar: "German numbers above 20 are 'reversed': 21 = einundzwanzig (one-and-twenty). 'Uhr' = o'clock.",
        vocab: [
          { w: "eins, zwei, drei", en: "one, two, three", ex: "Ich habe drei Bücher." },
          { w: "vier, fünf, sechs", en: "four, five, six", ex: "Es ist sechs Uhr." },
          { w: "sieben, acht, neun, zehn", en: "seven, eight, nine, ten", ex: "Zehn Euro, bitte." },
          { w: "zwanzig", en: "twenty", ex: "Ich bin zwanzig Jahre alt." },
          { w: "hundert", en: "hundred", ex: "Das kostet hundert Euro." },
          { w: "Montag", en: "Monday", ex: "Am Montag habe ich Deutsch." },
          { w: "Wochenende", en: "weekend", ex: "Schönes Wochenende!" },
          { w: "heute / morgen", en: "today / tomorrow", ex: "Heute ist Dienstag." },
          { w: "Wie spät ist es?", en: "What time is it?", ex: "Entschuldigung, wie spät ist es?" },
          { w: "Es ist halb drei", en: "It's half past two (2:30)", ex: "Es ist halb drei." },
        ],
      },
      {
        id: "de-a1-u3", level: "A1", title: "Articles & Gender (der/die/das)",
        grammar: "Every German noun has a gender: der (m), die (f), das (n). Always learn the article WITH the noun. Plural article is always 'die'.",
        vocab: [
          { w: "der Mann", en: "the man", ex: "Der Mann ist nett." },
          { w: "die Frau", en: "the woman", ex: "Die Frau heißt Maria." },
          { w: "das Kind", en: "the child", ex: "Das Kind spielt." },
          { w: "der Tisch", en: "the table", ex: "Der Tisch ist groß." },
          { w: "die Lampe", en: "the lamp", ex: "Die Lampe ist neu." },
          { w: "das Buch", en: "the book", ex: "Das Buch ist interessant." },
          { w: "ein / eine", en: "a / an (m,n / f)", ex: "Ich habe eine Frage." },
          { w: "die Bücher", en: "the books (plural)", ex: "Die Bücher sind teuer." },
        ],
      },
      {
        id: "de-a1-u4", level: "A1", title: "Present Tense & Common Verbs",
        grammar: "Regular verbs: stem + endings -e, -st, -t, -en, -t, -en. 'sein' (to be) is irregular: ich bin, du bist, er ist, wir sind.",
        vocab: [
          { w: "sein (ich bin)", en: "to be (I am)", ex: "Ich bin Student." },
          { w: "haben (ich habe)", en: "to have (I have)", ex: "Ich habe Zeit." },
          { w: "kommen", en: "to come", ex: "Ich komme aus Indien." },
          { w: "wohnen", en: "to live", ex: "Ich wohne in Berlin." },
          { w: "sprechen", en: "to speak", ex: "Sprichst du Deutsch?" },
          { w: "lernen", en: "to learn", ex: "Ich lerne Deutsch." },
          { w: "arbeiten", en: "to work", ex: "Er arbeitet in München." },
          { w: "verstehen", en: "to understand", ex: "Ich verstehe das nicht." },
        ],
      },
      {
        id: "de-a1-u5", level: "A1", title: "Survival German (uni, shop, café)",
        grammar: "Polite requests use 'Ich möchte …' (I would like …) or 'Könnten Sie …?' (Could you …?).",
        vocab: [
          { w: "Ich möchte …", en: "I would like …", ex: "Ich möchte einen Kaffee, bitte." },
          { w: "Was kostet das?", en: "How much is that?", ex: "Was kostet das Ticket?" },
          { w: "Entschuldigung", en: "Excuse me / Sorry", ex: "Entschuldigung, wo ist die Uni?" },
          { w: "Ich verstehe nicht", en: "I don't understand", ex: "Langsam, bitte. Ich verstehe nicht." },
          { w: "Sprechen Sie Englisch?", en: "Do you speak English?", ex: "Sprechen Sie Englisch?" },
          { w: "die Universität", en: "the university", ex: "Die Universität ist groß." },
          { w: "die Wohnung", en: "the apartment", ex: "Ich suche eine Wohnung." },
          { w: "das Konto", en: "the (bank) account", ex: "Ich brauche ein Konto." },
        ],
      },
    ],
    quiz: [
      { q: "How do you say 'Good morning' in German?", options: ["Guten Abend", "Guten Morgen", "Gute Nacht", "Guten Tag"], answer: 1 },
      { q: "'Ich heiße Anna' means …", options: ["I live in Anna", "I like Anna", "My name is Anna", "I am from Anna"], answer: 2 },
      { q: "Which is the correct article for 'Frau' (woman)?", options: ["der", "die", "das", "den"], answer: 1 },
      { q: "'Danke' means …", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
      { q: "How do you ask 'What's your name?' (informal)?", options: ["Wie geht's?", "Wie heißt du?", "Wer bist du?", "Wo wohnst du?"], answer: 1 },
      { q: "The number 'zwanzig' is …", options: ["12", "20", "2", "200"], answer: 1 },
      { q: "'Ich komme aus Indien' means …", options: ["I live in India", "I come from India", "I go to India", "I like India"], answer: 1 },
      { q: "Formal 'you' in German is …", options: ["du", "ihr", "Sie", "es"], answer: 2 },
      { q: "'Was kostet das?' means …", options: ["What is that?", "Where is that?", "How much is that?", "Who is that?"], answer: 2 },
      { q: "The verb 'lernen' means …", options: ["to live", "to learn", "to work", "to come"], answer: 1 },
    ],
  };

  const FRENCH = {
    id: "french", name: "French", native: "Français", flag: "🇫🇷",
    blurb: "Study in France, Belgium, parts of Canada (Québec) and Switzerland. French opens affordable EU study and a huge job market.",
    why: [
      "France has low-tuition public universities and the Campus France pathway — French helps admission and daily life.",
      "Québec (Canada) actively recruits French-speaking students with fast PR routes.",
      "DELF/DALF and TCF are accepted for study and immigration across the Francophone world.",
    ],
    exams: [
      { name: "DELF (A1–B2)", desc: "Diplôme d'études en langue française — lifelong, recognised for study & immigration." },
      { name: "DALF (C1–C2)", desc: "Advanced French diploma for university and professional use." },
      { name: "TCF", desc: "Test de connaissance du français — used for Campus France, Québec immigration and citizenship." },
      { name: "TEF", desc: "Accepted for Canadian immigration (Express Entry) and French nationality." },
    ],
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    course: [
      {
        id: "fr-a1-u1", level: "A1", title: "Greetings & Introductions",
        grammar: "French has formal (vous) and informal (tu) 'you'. Use vous with strangers, tu with friends.",
        vocab: [
          { w: "Bonjour", en: "Hello / Good day", ex: "Bonjour, comment allez-vous ?" },
          { w: "Salut", en: "Hi (informal)", ex: "Salut ! Ça va ?" },
          { w: "Bonsoir", en: "Good evening", ex: "Bonsoir, madame." },
          { w: "Au revoir", en: "Goodbye", ex: "Au revoir, à demain !" },
          { w: "Je m'appelle …", en: "My name is …", ex: "Je m'appelle Léa." },
          { w: "Comment tu t'appelles ?", en: "What's your name? (informal)", ex: "Comment tu t'appelles ?" },
          { w: "Comment ça va ?", en: "How are you?", ex: "Salut, comment ça va ?" },
          { w: "Merci", en: "Thank you", ex: "Merci beaucoup !" },
          { w: "S'il vous plaît", en: "Please (formal)", ex: "Un café, s'il vous plaît." },
          { w: "Oui / Non", en: "Yes / No", ex: "Oui, merci. Non, merci." },
        ],
      },
      {
        id: "fr-a1-u2", level: "A1", title: "Numbers & Everyday Words",
        grammar: "French nouns are masculine (le) or feminine (la). Learn the article with the noun. Plural = les.",
        vocab: [
          { w: "un, deux, trois", en: "one, two, three", ex: "J'ai trois livres." },
          { w: "quatre, cinq, six", en: "four, five, six", ex: "Il est six heures." },
          { w: "dix", en: "ten", ex: "Dix euros, s'il vous plaît." },
          { w: "le / la / les", en: "the (m / f / plural)", ex: "La fille et le garçon." },
          { w: "aujourd'hui", en: "today", ex: "Aujourd'hui, c'est lundi." },
          { w: "Combien ça coûte ?", en: "How much is it?", ex: "Combien ça coûte ?" },
          { w: "l'université", en: "the university", ex: "L'université est grande." },
        ],
      },
      {
        id: "fr-a1-u3", level: "A1", title: "Survival French",
        grammar: "Polite requests: 'Je voudrais …' (I would like …) and 'Pouvez-vous …?' (Can you …?).",
        vocab: [
          { w: "Je voudrais …", en: "I would like …", ex: "Je voudrais un café." },
          { w: "Excusez-moi", en: "Excuse me", ex: "Excusez-moi, où est la gare ?" },
          { w: "Je ne comprends pas", en: "I don't understand", ex: "Désolé, je ne comprends pas." },
          { w: "Parlez-vous anglais ?", en: "Do you speak English?", ex: "Parlez-vous anglais ?" },
          { w: "l'appartement", en: "the apartment", ex: "Je cherche un appartement." },
        ],
      },
    ],
    quiz: [
      { q: "How do you say 'Hello / Good day' in French?", options: ["Bonsoir", "Au revoir", "Bonjour", "Merci"], answer: 2 },
      { q: "'Je m'appelle Léa' means …", options: ["I like Léa", "My name is Léa", "I live in Léa", "I call Léa"], answer: 1 },
      { q: "'Merci' means …", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
      { q: "The feminine article 'the' is …", options: ["le", "la", "les", "un"], answer: 1 },
      { q: "'Combien ça coûte ?' means …", options: ["Where is it?", "How much is it?", "What is it?", "Who is it?"], answer: 1 },
      { q: "Formal 'you' in French is …", options: ["tu", "il", "vous", "on"], answer: 2 },
      { q: "'Je voudrais un café' means …", options: ["I have a coffee", "I would like a coffee", "I make a coffee", "I see a coffee"], answer: 1 },
      { q: "Which exam is used for Canadian immigration?", options: ["DELF only", "TEF / TCF", "Goethe", "IELTS"], answer: 1 },
    ],
  };

  window.LP_LANGUAGES = { german: GERMAN, french: FRENCH };
  window.LP_LANGUAGE_ORDER = ["german", "french"];
})();
