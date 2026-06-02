/* global window */
"use strict";
// LandingPrep — German/French language MOCK TESTS (Goethe-A1 / DELF-A1 style).
// Auto-scorable sections: Reading (Lesen/Compréhension écrite), Grammar & Vocabulary,
// and Listening (Hören/Compréhension orale) — listening items are spoken via the
// live natural voice (lang-aware). More mocks = just more data here.
// Schema: { id, level, title, minutes, sections:[{ type, title, intro?, passage?,
//   questions:[{ q, options:[...], answer:<index>, audio? }] }] }
(function () {
  const germanA1_1 = {
    id: "de-a1-mock-1", level: "A1", title: "German A1 Mock Test 1 (Goethe-style)", minutes: 30,
    sections: [
      {
        type: "reading", title: "Lesen · Reading",
        intro: "Read the text, then answer the questions.",
        passage: "Hallo! Ich heiße Lena. Ich bin 22 Jahre alt und komme aus München. Ich studiere Biologie an der Universität. Ich wohne in einer kleinen Wohnung mit meiner Freundin Anna. Am Wochenende spiele ich gern Tennis und lese Bücher. Mein Lieblingsessen ist Pizza.",
        questions: [
          { q: "Wie alt ist Lena? (How old is Lena?)", options: ["20", "22", "25", "32"], answer: 1 },
          { q: "Woher kommt Lena? (Where is Lena from?)", options: ["Berlin", "Hamburg", "München", "Wien"], answer: 2 },
          { q: "Was studiert Lena? (What does Lena study?)", options: ["Chemie", "Biologie", "Physik", "Mathematik"], answer: 1 },
          { q: "Was macht Lena am Wochenende? (weekend activity)", options: ["Sie schwimmt", "Sie spielt Tennis", "Sie kocht", "Sie arbeitet"], answer: 1 },
          { q: "Was ist Lenas Lieblingsessen? (favourite food)", options: ["Pasta", "Salat", "Pizza", "Suppe"], answer: 2 },
        ],
      },
      {
        type: "grammar", title: "Grammatik & Wortschatz · Grammar & Vocabulary",
        intro: "Choose the correct option.",
        questions: [
          { q: "___ Mann ist groß.", options: ["Der", "Die", "Das", "Den"], answer: 0 },
          { q: "Ich ___ Student.", options: ["bin", "bist", "ist", "sind"], answer: 0 },
          { q: "Wir ___ Deutsch.", options: ["lernt", "lernst", "lernen", "lerne"], answer: 2 },
          { q: "Das ist ___ Apfel.", options: ["eine", "ein", "einen", "der"], answer: 1 },
          { q: "Die Zahl 21 heißt …", options: ["zwölf", "zwanzig", "einundzwanzig", "zweiundzwanzig"], answer: 2 },
          { q: "'Danke' means …", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
          { q: "Plural von 'das Buch' …", options: ["die Buchs", "die Bücher", "die Buche", "der Bücher"], answer: 1 },
          { q: "Ich habe ___ Zeit. (negate)", options: ["nicht", "kein", "keine", "nein"], answer: 2 },
        ],
      },
      {
        type: "listening", title: "Hören · Listening",
        intro: "Tap ▶ to hear each sentence in German, then answer.",
        questions: [
          { audio: "Es ist drei Uhr.", q: "What time is it?", options: ["1:00", "3:00", "4:00", "5:00"], answer: 1 },
          { audio: "Ich komme aus Indien.", q: "Where is the speaker from?", options: ["Italy", "India", "Iran", "Ireland"], answer: 1 },
          { audio: "Das kostet zehn Euro.", q: "How much does it cost?", options: ["2 euros", "10 euros", "12 euros", "20 euros"], answer: 1 },
          { audio: "Ich möchte einen Kaffee, bitte.", q: "What does the speaker want?", options: ["a tea", "a water", "a coffee", "a juice"], answer: 2 },
          { audio: "Meine Telefonnummer ist null eins sieben.", q: "The phone number starts with …", options: ["0 1 7", "0 7 1", "1 0 7", "7 1 0"], answer: 0 },
        ],
      },
    ],
  };

  const frenchA1_1 = {
    id: "fr-a1-mock-1", level: "A1", title: "French A1 Mock Test 1 (DELF-style)", minutes: 30,
    sections: [
      {
        type: "reading", title: "Compréhension écrite · Reading",
        intro: "Read the text, then answer the questions.",
        passage: "Bonjour ! Je m'appelle Marc. J'ai 25 ans et j'habite à Lyon. Je travaille dans un café. Le week-end, j'aime jouer au foot et regarder des films. Mon plat préféré est le couscous.",
        questions: [
          { q: "Quel âge a Marc? (How old is Marc?)", options: ["20", "22", "25", "30"], answer: 2 },
          { q: "Où habite Marc? (Where does Marc live?)", options: ["Paris", "Lyon", "Nice", "Marseille"], answer: 1 },
          { q: "Où travaille Marc? (Where does Marc work?)", options: ["dans une école", "dans un café", "dans un magasin", "dans un hôpital"], answer: 1 },
          { q: "Que fait Marc le week-end? (weekend activity)", options: ["il nage", "il joue au foot", "il cuisine", "il travaille"], answer: 1 },
          { q: "Quel est le plat préféré de Marc?", options: ["la pizza", "le couscous", "la salade", "les pâtes"], answer: 1 },
        ],
      },
      {
        type: "grammar", title: "Grammaire & Vocabulaire · Grammar & Vocabulary",
        intro: "Choose the correct option.",
        questions: [
          { q: "___ fille est gentille.", options: ["Le", "La", "Les", "Un"], answer: 1 },
          { q: "Je ___ étudiant.", options: ["suis", "es", "est", "sont"], answer: 0 },
          { q: "Nous ___ français.", options: ["parle", "parles", "parlons", "parlent"], answer: 2 },
          { q: "J'___ vingt ans.", options: ["ai", "as", "a", "ont"], answer: 0 },
          { q: "'Merci' means …", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
          { q: "Le pluriel de 'le livre' …", options: ["la livre", "les livre", "les livres", "des livre"], answer: 2 },
          { q: "Le nombre 'dix' = …", options: ["2", "6", "10", "12"], answer: 2 },
          { q: "Vous formal: 'Comment ___-vous?'", options: ["allez", "vas", "va", "allons"], answer: 0 },
        ],
      },
      {
        type: "listening", title: "Compréhension orale · Listening",
        intro: "Tap ▶ to hear each sentence in French, then answer.",
        questions: [
          { audio: "Il est trois heures.", q: "What time is it?", options: ["1:00", "3:00", "4:00", "6:00"], answer: 1 },
          { audio: "Je viens d'Inde.", q: "Where is the speaker from?", options: ["Italy", "India", "Ireland", "Iran"], answer: 1 },
          { audio: "Ça coûte dix euros.", q: "How much does it cost?", options: ["2 euros", "6 euros", "10 euros", "12 euros"], answer: 2 },
          { audio: "Je voudrais un café, s'il vous plaît.", q: "What does the speaker want?", options: ["a tea", "a coffee", "a water", "a juice"], answer: 1 },
          { audio: "Mon numéro commence par zéro six.", q: "The number starts with …", options: ["0 6", "0 9", "6 0", "9 0"], answer: 0 },
        ],
      },
    ],
  };

  window.LP_LANG_MOCKS = {
    german: [germanA1_1],
    french: [frenchA1_1],
  };
})();
