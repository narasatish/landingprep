// publish-next-post.mjs — Daily auto-blog drip publisher.
// Moves ONE pre-vetted post from blog-queue.json into blog-data.jsx's EXTRA array,
// so the daily GitHub Action can publish fresh content automatically without any
// live LLM call in CI (keeps quality controlled — every post is human-reviewed
// before it enters the queue). The build step then prerenders its /blog page +
// sitemap + RSS, and IndexNow pings search engines.
//
//   node scripts/publish-next-post.mjs
// Exits 0 (no-op) if the queue is empty. Exits 1 only on a real error.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE_PATH = join(ROOT, "blog-queue.json");
const BLOG_PATH = join(ROOT, "blog-data.jsx");
// The insertion anchor is computed at runtime (below) to tolerate LF or CRLF
// line endings — git checks out CRLF on Windows, LF in Linux CI.

if (!existsSync(QUEUE_PATH)) {
  console.log("No blog-queue.json — nothing to publish.");
  process.exit(0);
}

let queue;
try {
  queue = JSON.parse(readFileSync(QUEUE_PATH, "utf8"));
} catch (e) {
  console.error("blog-queue.json is not valid JSON:", e.message);
  process.exit(1);
}
if (!Array.isArray(queue) || queue.length === 0) {
  console.log("Queue empty — nothing to publish today. (Refill blog-queue.json to resume.)");
  process.exit(0);
}

const post = queue[0];
if (!post || typeof post.id !== "string" || typeof post.title !== "string" || !Array.isArray(post.sections) || !post.sections.length) {
  console.error("First queued post is malformed (need id, title, sections[]). Leaving queue untouched.");
  process.exit(1);
}

let blog = readFileSync(BLOG_PATH, "utf8");

// Idempotency: if this id is already published, just drop it from the queue.
if (blog.includes(`id: "${post.id}"`) || blog.includes(`"id": "${post.id}"`)) {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue.slice(1), null, 2) + "\n");
  console.log(`"${post.id}" already in blog-data — removed from queue, nothing published.`);
  process.exit(0);
}

const nl = blog.includes("\r\n") ? "\r\n" : "\n";
const ANCHOR = `${nl}  ];${nl}${nl}  window.LP_BLOG_EXTRA = EXTRA;`;
if (!blog.includes(ANCHOR)) {
  console.error("Could not find the insertion anchor in blog-data.jsx — aborting.");
  process.exit(1);
}

const serialized = JSON.stringify(post, null, 2).split("\n").map((l) => "    " + l).join(nl);
const next = blog.replace(ANCHOR, `,${nl}${serialized}${nl}  ];${nl}${nl}  window.LP_BLOG_EXTRA = EXTRA;`);

// Safety: confirm the modified file still executes and produces a valid array
// BEFORE writing anything. A bad queue entry must never corrupt the live blog.
try {
  const w = {};
  // eslint-disable-next-line no-new-func
  new Function("window", next)(w);
  if (!Array.isArray(w.LP_BLOG_EXTRA) || !w.LP_BLOG_EXTRA.some((p) => p.id === post.id)) {
    throw new Error("post not present after insert");
  }
} catch (e) {
  console.error("Refusing to write — modified blog-data.jsx would not execute:", e.message);
  process.exit(1);
}

writeFileSync(BLOG_PATH, next);
writeFileSync(QUEUE_PATH, JSON.stringify(queue.slice(1), null, 2) + "\n");
console.log(`Published: ${post.id} — "${post.title}". ${queue.length - 1} post(s) left in queue.`);
