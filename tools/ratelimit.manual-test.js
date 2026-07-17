// Fast in-process burst to test rate limiting (curl-per-request is too slow to stay in window)
const http = require("http");

function hit(path, token) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "localhost", port: 3015, path, method: "GET", headers: token ? { Authorization: "Bearer " + token } : {} },
      (res) => { res.resume(); resolve(res.statusCode); }
    );
    req.on("error", () => resolve(0));
    req.end();
  });
}

async function burst(label, n, tokenFn) {
  const codes = [];
  for (let i = 0; i < n; i++) codes.push(await hit("/api/health", tokenFn ? tokenFn(i) : null));
  const c200 = codes.filter((c) => c === 200).length;
  const c429 = codes.filter((c) => c === 429).length;
  console.log(`${label.padEnd(40)} 200=${String(c200).padStart(3)}  429=${String(c429).padStart(3)}`);
  return { c200, c429 };
}

(async () => {
  const t0 = Date.now();
  // Each unique forged token would be its own bucket IF the limiter trusted the header.
  const r = await burst("135x FORGED token (rotating)", 135, (i) => `forged.${i}.token`);
  console.log(`elapsed: ${((Date.now() - t0) / 1000).toFixed(1)}s (window is 60s)`);
  console.log("");
  if (r.c429 > 0) console.log("PASS: limit held -> forged tokens fall back to IP (no bypass)");
  else console.log("FAIL/INCONCLUSIVE: no 429 seen");
})();
