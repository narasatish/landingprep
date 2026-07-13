#!/usr/bin/env node
// LandingPrep — Firestore logical backup.
// Exports EVERY collection (accounts, questions, leaderboard, reviews, newsletter,
// push subscriptions, ig_* …) to a single timestamped JSON snapshot you can restore
// from. This is a *logical* backup you can run anywhere (locally, cron, CI) and is
// meant to COMPLEMENT — not replace — Firestore's native managed backups + PITR.
//
// USAGE
//   FIREBASE_SERVICE_ACCOUNT='<service-account-json>' \
//   [FIRESTORE_DATABASE_ID='<named-db>'] \
//   [BACKUP_DIR=./backups] \
//     node scripts/backup-firestore.mjs
//
// The dump lands in ./backups/firestore-<ISO>.json. That folder is git-ignored on
// purpose — the dump contains user emails + password hashes, so it must NEVER be
// committed. For the "nobody can delete" requirement, push these dumps to a
// write-once bucket (see docs/security-and-backups.md → Immutable off-site copies).
//
// RESTORE (manual, deliberate — there is no auto-restore, by design):
//   node scripts/backup-firestore.mjs --restore ./backups/firestore-<ISO>.json
// Restore is additive: it re-creates each doc by id with merge, so it never deletes
// anything already present. Review the file before restoring.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function initDb() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
  if (!raw) {
    console.error("[backup] FIREBASE_SERVICE_ACCOUNT is not set — nothing to back up.");
    console.error("[backup] Run this where the service-account JSON is available (e.g. a scheduled job with the same env as Render).");
    process.exit(2);
  }
  const admin = require("firebase-admin");
  const cred = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(cred), projectId: cred.project_id });
  const db = admin.firestore();
  const dbId = (process.env.FIRESTORE_DATABASE_ID || "").trim();
  if (dbId && dbId !== "(default)") db.settings({ databaseId: dbId });
  return { admin, db, project: cred.project_id, dbId: dbId || "(default)" };
}

async function backup() {
  const { db, project, dbId } = initDb();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = process.env.BACKUP_DIR || join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });

  const collections = await db.listCollections();
  const out = { meta: { project, database: dbId, takenAt: new Date().toISOString(), collections: [] }, data: {} };
  let totalDocs = 0;

  for (const col of collections) {
    const snap = await col.get();
    const docs = [];
    snap.forEach((doc) => docs.push({ id: doc.id, data: doc.data() }));
    out.data[col.id] = docs;
    out.meta.collections.push({ name: col.id, docs: docs.length });
    totalDocs += docs.length;
    console.log(`[backup] ${col.id}: ${docs.length} docs`);
  }

  const file = join(dir, `firestore-${stamp}.json`);
  writeFileSync(file, JSON.stringify(out, null, 2), "utf8");
  console.log(`[backup] wrote ${totalDocs} docs across ${out.meta.collections.length} collections → ${file}`);
  console.log("[backup] Reminder: copy this to a write-once (retention-locked) bucket — see docs/security-and-backups.md.");
  process.exit(0);
}

async function restore(file) {
  if (!existsSync(file)) { console.error(`[restore] file not found: ${file}`); process.exit(2); }
  const { db } = initDb();
  const snapshot = JSON.parse(readFileSync(file, "utf8"));
  let n = 0;
  for (const [colName, docs] of Object.entries(snapshot.data || {})) {
    for (const { id, data } of docs) {
      await db.collection(colName).doc(id).set(data, { merge: true });
      n++;
    }
    console.log(`[restore] ${colName}: ${docs.length} docs (merged, non-destructive)`);
  }
  console.log(`[restore] restored ${n} docs from ${file} (merge — nothing deleted).`);
  process.exit(0);
}

const args = process.argv.slice(2);
if (args[0] === "--restore") {
  if (!args[1]) { console.error("[restore] usage: --restore <path-to-backup.json>"); process.exit(2); }
  restore(args[1]).catch((e) => { console.error("[restore] failed:", e.message); process.exit(1); });
} else {
  backup().catch((e) => { console.error("[backup] failed:", e.message); process.exit(1); });
}
