(function() {
  const MANIFEST_URL = "content/manifest.json";
  let manifestPromise = null;
  const testCache = /* @__PURE__ */ new Map();
  const MAX_CACHE = 12;
  function cachePut(file, data) {
    if (testCache.has(file)) testCache.delete(file);
    testCache.set(file, data);
    if (testCache.size > MAX_CACHE) {
      const oldest = testCache.keys().next().value;
      testCache.delete(oldest);
    }
  }
  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL + "?v=" + Date.now()).then((r) => r.ok ? r.json() : Promise.reject(new Error("manifest " + r.status))).catch((e) => {
        console.warn("Manifest load failed:", e.message);
        return { exams: {} };
      });
    }
    return manifestPromise;
  }
  async function listTests(examId, section) {
    var _a, _b, _c;
    const m = await loadManifest();
    const entries = ((_c = (_b = (_a = m == null ? void 0 : m.exams) == null ? void 0 : _a[examId]) == null ? void 0 : _b.sections) == null ? void 0 : _c[section]) || [];
    return entries;
  }
  async function listFullMocks(examId) {
    var _a, _b;
    const m = await loadManifest();
    return ((_b = (_a = m == null ? void 0 : m.exams) == null ? void 0 : _a[examId]) == null ? void 0 : _b.fullMocks) || [];
  }
  async function listSections(examId) {
    var _a, _b;
    const m = await loadManifest();
    return Object.keys(((_b = (_a = m == null ? void 0 : m.exams) == null ? void 0 : _a[examId]) == null ? void 0 : _b.sections) || {});
  }
  async function loadTest(entryOrFile) {
    const file = typeof entryOrFile === "string" ? entryOrFile : entryOrFile == null ? void 0 : entryOrFile.file;
    if (!file) throw new Error("loadTest: no file path");
    if (testCache.has(file)) return testCache.get(file);
    const url = "content/" + file + "?v=" + (typeof entryOrFile === "object" ? entryOrFile.version || 1 : 1);
    const test = await fetch(url).then((r) => r.ok ? r.json() : Promise.reject(new Error("test " + r.status)));
    cachePut(file, test);
    return test;
  }
  async function loadFullMock(entry) {
    const composition = await loadTest(entry);
    return composition;
  }
  async function loadMockSection(mockSectionRef) {
    return loadTest(mockSectionRef.file);
  }
  async function getCounts() {
    const m = await loadManifest();
    const out = {};
    for (const [examId, exam] of Object.entries((m == null ? void 0 : m.exams) || {})) {
      out[examId] = { label: exam.label || examId.toUpperCase(), full: (exam.fullMocks || []).length, sections: {}, total: 0 };
      for (const [sec, arr] of Object.entries(exam.sections || {})) {
        out[examId].sections[sec] = arr.length;
        out[examId].total += arr.length;
      }
      out[examId].total += out[examId].full;
    }
    return out;
  }
  async function getExam(examId) {
    var _a;
    const m = await loadManifest();
    return ((_a = m == null ? void 0 : m.exams) == null ? void 0 : _a[examId]) || null;
  }
  window.LP_CATALOG = {
    loadManifest,
    listTests,
    listFullMocks,
    listSections,
    loadTest,
    loadFullMock,
    loadMockSection,
    getCounts,
    getExam
  };
})();
