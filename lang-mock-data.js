"use strict";
(function() {
  const germanA1_1 = {
    id: "de-a1-mock-1",
    level: "A1",
    title: "German A1 Mock Test 1 (Goethe-style)",
    minutes: 30,
    sections: [
      {
        type: "reading",
        title: "Lesen \xB7 Reading",
        intro: "Read the text, then answer the questions.",
        passage: "Hallo! Ich hei\xDFe Lena. Ich bin 22 Jahre alt und komme aus M\xFCnchen. Ich studiere Biologie an der Universit\xE4t. Ich wohne in einer kleinen Wohnung mit meiner Freundin Anna. Am Wochenende spiele ich gern Tennis und lese B\xFCcher. Mein Lieblingsessen ist Pizza.",
        questions: [
          { q: "Wie alt ist Lena? (How old is Lena?)", options: ["20", "22", "25", "32"], answer: 1 },
          { q: "Woher kommt Lena? (Where is Lena from?)", options: ["Berlin", "Hamburg", "M\xFCnchen", "Wien"], answer: 2 },
          { q: "Was studiert Lena? (What does Lena study?)", options: ["Chemie", "Biologie", "Physik", "Mathematik"], answer: 1 },
          { q: "Was macht Lena am Wochenende? (weekend activity)", options: ["Sie schwimmt", "Sie spielt Tennis", "Sie kocht", "Sie arbeitet"], answer: 1 },
          { q: "Was ist Lenas Lieblingsessen? (favourite food)", options: ["Pasta", "Salat", "Pizza", "Suppe"], answer: 2 }
        ]
      },
      {
        type: "grammar",
        title: "Grammatik & Wortschatz \xB7 Grammar & Vocabulary",
        intro: "Choose the correct option.",
        questions: [
          { q: "___ Mann ist gro\xDF.", options: ["Der", "Die", "Das", "Den"], answer: 0 },
          { q: "Ich ___ Student.", options: ["bin", "bist", "ist", "sind"], answer: 0 },
          { q: "Wir ___ Deutsch.", options: ["lernt", "lernst", "lernen", "lerne"], answer: 2 },
          { q: "Das ist ___ Apfel.", options: ["eine", "ein", "einen", "der"], answer: 1 },
          { q: "Die Zahl 21 hei\xDFt \u2026", options: ["zw\xF6lf", "zwanzig", "einundzwanzig", "zweiundzwanzig"], answer: 2 },
          { q: "'Danke' means \u2026", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
          { q: "Plural von 'das Buch' \u2026", options: ["die Buchs", "die B\xFCcher", "die Buche", "der B\xFCcher"], answer: 1 },
          { q: "Ich habe ___ Zeit. (negate)", options: ["nicht", "kein", "keine", "nein"], answer: 2 }
        ]
      },
      {
        type: "listening",
        title: "H\xF6ren \xB7 Listening",
        intro: "Tap \u25B6 to hear each sentence in German, then answer.",
        questions: [
          { audio: "Es ist drei Uhr.", q: "What time is it?", options: ["1:00", "3:00", "4:00", "5:00"], answer: 1 },
          { audio: "Ich komme aus Indien.", q: "Where is the speaker from?", options: ["Italy", "India", "Iran", "Ireland"], answer: 1 },
          { audio: "Das kostet zehn Euro.", q: "How much does it cost?", options: ["2 euros", "10 euros", "12 euros", "20 euros"], answer: 1 },
          { audio: "Ich m\xF6chte einen Kaffee, bitte.", q: "What does the speaker want?", options: ["a tea", "a water", "a coffee", "a juice"], answer: 2 },
          { audio: "Meine Telefonnummer ist null eins sieben.", q: "The phone number starts with \u2026", options: ["0 1 7", "0 7 1", "1 0 7", "7 1 0"], answer: 0 }
        ]
      }
    ]
  };
  const frenchA1_1 = {
    id: "fr-a1-mock-1",
    level: "A1",
    title: "French A1 Mock Test 1 (DELF-style)",
    minutes: 30,
    sections: [
      {
        type: "reading",
        title: "Compr\xE9hension \xE9crite \xB7 Reading",
        intro: "Read the text, then answer the questions.",
        passage: "Bonjour ! Je m'appelle Marc. J'ai 25 ans et j'habite \xE0 Lyon. Je travaille dans un caf\xE9. Le week-end, j'aime jouer au foot et regarder des films. Mon plat pr\xE9f\xE9r\xE9 est le couscous.",
        questions: [
          { q: "Quel \xE2ge a Marc? (How old is Marc?)", options: ["20", "22", "25", "30"], answer: 2 },
          { q: "O\xF9 habite Marc? (Where does Marc live?)", options: ["Paris", "Lyon", "Nice", "Marseille"], answer: 1 },
          { q: "O\xF9 travaille Marc? (Where does Marc work?)", options: ["dans une \xE9cole", "dans un caf\xE9", "dans un magasin", "dans un h\xF4pital"], answer: 1 },
          { q: "Que fait Marc le week-end? (weekend activity)", options: ["il nage", "il joue au foot", "il cuisine", "il travaille"], answer: 1 },
          { q: "Quel est le plat pr\xE9f\xE9r\xE9 de Marc?", options: ["la pizza", "le couscous", "la salade", "les p\xE2tes"], answer: 1 }
        ]
      },
      {
        type: "grammar",
        title: "Grammaire & Vocabulaire \xB7 Grammar & Vocabulary",
        intro: "Choose the correct option.",
        questions: [
          { q: "___ fille est gentille.", options: ["Le", "La", "Les", "Un"], answer: 1 },
          { q: "Je ___ \xE9tudiant.", options: ["suis", "es", "est", "sont"], answer: 0 },
          { q: "Nous ___ fran\xE7ais.", options: ["parle", "parles", "parlons", "parlent"], answer: 2 },
          { q: "J'___ vingt ans.", options: ["ai", "as", "a", "ont"], answer: 0 },
          { q: "'Merci' means \u2026", options: ["Please", "Sorry", "Thank you", "Hello"], answer: 2 },
          { q: "Le pluriel de 'le livre' \u2026", options: ["la livre", "les livre", "les livres", "des livre"], answer: 2 },
          { q: "Le nombre 'dix' = \u2026", options: ["2", "6", "10", "12"], answer: 2 },
          { q: "Vous formal: 'Comment ___-vous?'", options: ["allez", "vas", "va", "allons"], answer: 0 }
        ]
      },
      {
        type: "listening",
        title: "Compr\xE9hension orale \xB7 Listening",
        intro: "Tap \u25B6 to hear each sentence in French, then answer.",
        questions: [
          { audio: "Il est trois heures.", q: "What time is it?", options: ["1:00", "3:00", "4:00", "6:00"], answer: 1 },
          { audio: "Je viens d'Inde.", q: "Where is the speaker from?", options: ["Italy", "India", "Ireland", "Iran"], answer: 1 },
          { audio: "\xC7a co\xFBte dix euros.", q: "How much does it cost?", options: ["2 euros", "6 euros", "10 euros", "12 euros"], answer: 2 },
          { audio: "Je voudrais un caf\xE9, s'il vous pla\xEEt.", q: "What does the speaker want?", options: ["a tea", "a coffee", "a water", "a juice"], answer: 1 },
          { audio: "Mon num\xE9ro commence par z\xE9ro six.", q: "The number starts with \u2026", options: ["0 6", "0 9", "6 0", "9 0"], answer: 0 }
        ]
      }
    ]
  };
  window.LP_LANG_MOCKS = {
    german: [germanA1_1],
    french: [frenchA1_1]
  };
})();
