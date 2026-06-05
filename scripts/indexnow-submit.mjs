// IndexNow submitter — tells Bing, Yandex, Naver, Seznam (and any IndexNow
// participant) to (re)crawl our pages instantly. Google ignores IndexNow but
// picks the same URLs up via sitemap.xml in Search Console.
//
// Usage:
//   node scripts/indexnow-submit.mjs                 # submit ALL sitemap URLs
//   node scripts/indexnow-submit.mjs <url> <url> ... # submit only these URLs
//
// No secret needed: ownership is proven by the public key file served at
// https://landingprep.com/<KEY>.txt (committed at repo root).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "landingprep.com";
const KEY = "237c16b197efafd6888221c446b5f68e";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

function sitemapUrls() {
  try {
    const xml = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  } catch (e) {
    console.warn("Could not read sitemap.xml:", e.message);
    return [];
  }
}

async function main() {
  const cli = process.argv.slice(2).filter(Boolean);
  const urlList = (cli.length ? cli : sitemapUrls())
    .filter((u) => u.startsWith(`https://${HOST}/`));

  if (!urlList.length) {
    console.log("No URLs to submit — nothing to do.");
    return;
  }
  // IndexNow accepts up to 10,000 URLs per request.
  const batch = urlList.slice(0, 10000);
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch });

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    });
    console.log(`IndexNow: submitted ${batch.length} URLs → HTTP ${res.status} ${res.statusText}`);
    // 200/202 = accepted; 400/403/422 = key/ownership problem (worth surfacing in logs).
    if (res.status >= 400) console.warn("IndexNow returned an error status — check the key file is live at", KEY_LOCATION);
  } catch (e) {
    // Never fail CI over a best-effort ping.
    console.warn("IndexNow request failed (non-fatal):", e.message);
  }
}

main();
