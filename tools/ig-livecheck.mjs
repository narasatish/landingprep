// LIVE health check of the production Instagram posting pipeline — READ-ONLY, posts nothing.
// Verifies the server, Firestore, the Instagram token, and the in-server scheduler. Exits
// non-zero on any problem, so it can run on a schedule as an early-warning (this is exactly
// the failure mode that took down posting: a silently-revoked token).
//   node tools/ig-livecheck.mjs            (checks https://landingprep.com)
//   LIVE_BASE=https://staging… node tools/ig-livecheck.mjs
const BASE = (process.env.LIVE_BASE || "https://landingprep.com").replace(/\/$/, "");
const T = 60000;

async function getJSON(path) {
  const r = await fetch(BASE + path, { signal: AbortSignal.timeout(T) });
  return r.json();
}

async function main() {
  let ok = true;
  const check = (good, msg) => { console.log((good ? "  ✓ " : "  ✗ ") + msg); if (!good) ok = false; };
  console.log("IG pipeline LIVE check @ " + BASE + "\n");

  try {
    const h = await getJSON("/api/health");
    check(h && h.status === "ok", "server is up (status: " + (h && h.status) + ")");
    check(h && h.firestore === "connected", "Firestore connected (" + (h && h.firestore) + ")");
  } catch (e) { check(false, "server unreachable: " + e.message); }

  try {
    const s = await getJSON("/api/ig/post-daily?selftest=1");
    const env = (s && s.env) || {};
    check(env.IG_USER_ID && env.IG_ACCESS_TOKEN && env.IG_POST_SECRET, "Instagram env vars all set");
    check(!!env.FIRESTORE, "Firestore configured for the poster");
    check(s && s.tokenValid === true, "Instagram token VALID" + (s && s.tokenError ? " — " + s.tokenError : ""));
    check(s && s.scheduler && s.scheduler.serverSideBackup === true, "in-server backup scheduler active");
    check(s && s.token && s.token.autoRefresh === true, "token auto-refresh enabled");
    if (s && s.today) console.log("    → today: " + s.today.postedSlots + "/" + s.today.ofSlots + " slots posted");
    if (s && s.recentAlerts) console.log("    → recentAlerts present (may be historical): " + Object.keys(s.recentAlerts).join(", "));
  } catch (e) { check(false, "self-test unreachable: " + e.message); }

  console.log(ok ? "\nLIVE PIPELINE: HEALTHY ✅" : "\nLIVE PIPELINE: PROBLEM DETECTED ❌  (regenerate the Instagram token / check the ✗ items)");
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error("livecheck crashed:", e.message); process.exit(1); });
