"use strict";
(function() {
  const FIREBASE_CONFIG = {
    apiKey: "REPLACE_ME",
    authDomain: "REPLACE_ME.firebaseapp.com",
    projectId: "REPLACE_ME",
    storageBucket: "REPLACE_ME.appspot.com",
    messagingSenderId: "REPLACE_ME",
    appId: "REPLACE_ME"
  };
  const ENABLED = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "REPLACE_ME";
  if (!ENABLED) return;
  const SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
  const clean = (s, max) => String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max || 2e3);
  (async () => {
    try {
      const appMod = await import(SDK + "firebase-app.js");
      const fs = await import(SDK + "firebase-firestore.js");
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      const db = fs.getFirestore(app);
      const { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc, increment, where, serverTimestamp } = fs;
      const community = {
        async list() {
          const snap = await getDocs(query(collection(db, "questions"), orderBy("ts", "desc"), limit(200)));
          return snap.docs.map((d) => ({ id: d.id, ...d.data() })).map((q) => ({ ...q, answers: (q.answers || []).slice().sort((a, b) => (b.votes || 0) - (a.votes || 0)) }));
        },
        async addQuestion(q) {
          const title = clean(q.title, 140);
          if (title.length < 8) throw new Error("title too short");
          await addDoc(collection(db, "questions"), {
            title,
            body: clean(q.body, 2e3),
            country: clean(q.country, 40) || "Multiple",
            tag: clean(q.tag, 30) || "General",
            author: clean(q.author, 40) || "Anonymous",
            ts: Date.now(),
            votes: 0,
            answers: []
          });
        },
        async addAnswer(qid, a) {
          const ref = doc(db, "questions", qid);
          const snap = await getDocs(query(collection(db, "questions"), where("__name__", "==", qid)));
          const cur = snap.docs[0] ? snap.docs[0].data().answers || [] : [];
          const ans = { id: "a" + Date.now() + Math.floor(Math.random() * 1e5), body: clean(a.body, 2e3), author: clean(a.author, 40) || "Anonymous", ts: Date.now(), votes: 0 };
          await updateDoc(ref, { answers: [...cur, ans] });
        },
        async vote(qid) {
          await updateDoc(doc(db, "questions", qid), { votes: increment(1) });
        }
      };
      const leaderboard = {
        async get(exam) {
          const snap = await getDocs(query(collection(db, "leaderboard"), orderBy("pct", "desc"), limit(50)));
          const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return exam ? all.filter((e) => e.exam === exam) : all;
        },
        async submit(e) {
          await addDoc(collection(db, "leaderboard"), {
            name: clean(e.name, 40) || "Anonymous",
            exam: clean(e.exam, 20),
            pct: Math.max(0, Math.min(100, Math.round(Number(e.pct) || 0))),
            scoreLabel: clean(e.scoreLabel, 30),
            ts: Date.now()
          });
        }
      };
      window.LP_FIRESTORE = { community, leaderboard, ready: true };
      window.dispatchEvent(new Event("lp-firestore-ready"));
      console.info("[LP] Firestore connected \u2014 Community & Leaderboard now use Firebase.");
    } catch (e) {
      console.warn("[LP] Firebase init failed; falling back to /api backend.", e);
    }
  })();
})();
