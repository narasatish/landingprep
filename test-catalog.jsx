// test-catalog.jsx — lazy-loading test bank backed by content/manifest.json
//
// Production-scale platforms cannot bundle 990+ test JSON files into one
// payload. The manifest (~350 KB) loads at boot; individual test files
// (~10-30 KB each) load only when the user opens them.
//
// Schema (from final_mock_test_bank_v2):
//   manifest.exams[examId].sections[section] = [TestEntry, ...]
//   manifest.exams[examId].fullMocks         = [MockEntry, ...]
//   manifest.exams[examId].label             = "IELTS Academic" etc.
//
// TestEntry  : { id, title, exam, section, type:"section",
//                durationSeconds, questionCount, file, version }
// MockEntry  : { id, title, exam, type:"full",
//                durationSeconds, sectionCount, file, version }
// Full mock JSON: { id, title, durationSeconds, instructions,
//                   sections:[{ section, testId, file }] }

(function () {
  const MANIFEST_URL = "content/manifest.json";
  let manifestPromise = null;
  const testCache = new Map();        // file path -> parsed test JSON
  const MAX_CACHE = 12;               // simple LRU bound

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
      manifestPromise = fetch(MANIFEST_URL + "?v=" + Date.now())
        .then(r => r.ok ? r.json() : Promise.reject(new Error("manifest " + r.status)))
        .catch((e) => {
          console.warn("Manifest load failed:", e.message);
          return { exams: {} };
        });
    }
    return manifestPromise;
  }

  // List the available section tests for an exam (metadata only)
  async function listTests(examId, section) {
    const m = await loadManifest();
    const entries = m?.exams?.[examId]?.sections?.[section] || [];
    return entries;
  }

  // List full mocks for an exam
  async function listFullMocks(examId) {
    const m = await loadManifest();
    return m?.exams?.[examId]?.fullMocks || [];
  }

  // List section IDs for an exam (in the manifest's declared order)
  async function listSections(examId) {
    const m = await loadManifest();
    return Object.keys(m?.exams?.[examId]?.sections || {});
  }

  // Get a single test file (cached). Accepts either a path string or an entry.
  async function loadTest(entryOrFile) {
    const file = typeof entryOrFile === "string" ? entryOrFile : entryOrFile?.file;
    if (!file) throw new Error("loadTest: no file path");
    if (testCache.has(file)) return testCache.get(file);
    const url = "content/" + file + "?v=" + (
      typeof entryOrFile === "object" ? (entryOrFile.version || 1) : 1
    );
    const test = await fetch(url).then(r => r.ok ? r.json() : Promise.reject(new Error("test " + r.status)));
    cachePut(file, test);
    return test;
  }

  // Load a full mock composition file. Does NOT eagerly load section files
  // (those load on demand as the user enters each section).
  async function loadFullMock(entry) {
    const composition = await loadTest(entry);
    return composition;          // { sections:[{section, testId, file}], ... }
  }

  // Convenience: load a section referenced inside a full mock
  async function loadMockSection(mockSectionRef) {
    return loadTest(mockSectionRef.file);
  }

  // Summary counts for SEO / dashboards
  async function getCounts() {
    const m = await loadManifest();
    const out = {};
    for (const [examId, exam] of Object.entries(m?.exams || {})) {
      out[examId] = { label: exam.label || examId.toUpperCase(), full: (exam.fullMocks || []).length, sections: {}, total: 0 };
      for (const [sec, arr] of Object.entries(exam.sections || {})) {
        out[examId].sections[sec] = arr.length;
        out[examId].total += arr.length;
      }
      out[examId].total += out[examId].full;
    }
    return out;
  }

  // Get exam metadata (label, declared section list)
  async function getExam(examId) {
    const m = await loadManifest();
    return m?.exams?.[examId] || null;
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
    getExam,
  };
})();
