(function() {
  const cache = /* @__PURE__ */ new Map();
  const pending = /* @__PURE__ */ new Map();
  function pickArray(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    for (const k of ["samples", "items", "topics", "strategies", "words"]) {
      if (Array.isArray(json[k])) return json[k];
    }
    return [];
  }
  async function fetchOne(url) {
    if (cache.has(url)) return cache.get(url);
    if (pending.has(url)) return pending.get(url);
    const p = fetch(url + "?v=" + Date.now()).then((r) => r.ok ? r.json() : null).then((json) => {
      const arr = pickArray(json);
      cache.set(url, arr);
      pending.delete(url);
      return arr;
    }).catch(() => {
      cache.set(url, []);
      pending.delete(url);
      return [];
    });
    pending.set(url, p);
    return p;
  }
  async function loadSection(exam, section) {
    const candidates = [
      `content/learning-hub/${exam}/${section}-samples.json`,
      `content/learning-hub/${exam}/${section}.json`
    ];
    const results = await Promise.all(candidates.map(fetchOne));
    return mergeById(results.flat());
  }
  async function loadVocabulary(exam) {
    return fetchOne(`content/learning-hub/${exam}/vocabulary.json`);
  }
  async function loadStrategies(exam) {
    return fetchOne(`content/learning-hub/${exam}/strategies.json`);
  }
  function mergeById(items) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const it of items || []) {
      const id = it == null ? void 0 : it.id;
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);
      out.push(it);
    }
    return out;
  }
  function mergeSamples(inCode, jsonSamples) {
    return mergeById([...inCode || [], ...jsonSamples || []]);
  }
  function pickRandom(samples, excludeId) {
    const pool = (samples || []).filter((s) => s && s.id !== excludeId);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  async function getHubCounts() {
    const exams = ["ielts", "toefl", "pte", "celpip", "duolingo", "gre", "gmat"];
    const sections = ["writing", "speaking"];
    const out = {};
    for (const exam of exams) {
      out[exam] = { writing: 0, speaking: 0, vocab: 0 };
      for (const sec of sections) {
        const arr = await loadSection(exam, sec);
        out[exam][sec] = arr.length;
      }
      const vocab = await loadVocabulary(exam);
      out[exam].vocab = (vocab || []).reduce((s, t) => s + (Array.isArray(t.items) ? t.items.length : 0), 0);
    }
    return out;
  }
  window.LP_HUB = {
    loadSection,
    loadVocabulary,
    loadStrategies,
    mergeSamples,
    pickRandom,
    getHubCounts
  };
})();
