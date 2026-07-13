# Security & Backups — LandingPrep

Honest split: some controls are **in code** (already done — see ✅), the rest are
**Firebase/GCP console + billing settings only you can apply** (a coding agent cannot
touch your GCP IAM, retention locks, or billing). The "nobody can delete the backups"
guarantee lives entirely in the second list — it is a bucket-retention/IAM setting,
not something code can enforce. Do the ⛔ items to reach a top-company posture.

---

## What's already in code ✅

| Control | Where |
|---|---|
| Passwords stored as **scrypt hashes + per-user salt** (never plaintext) | `server.js` `hashPw()` |
| **HMAC session tokens** (not guessable/forgeable) | `server.js` |
| **CSP + HSTS + X-Frame-Options** security headers | `server.js` (~L61–92) |
| **Rate limiting** — 120 req/min/IP overall; **20 auth attempts / 15 min** (brute-force block) | `server.js` (~L114–120) |
| **User-generated content escaped** on write + React auto-escapes on render (XSS-safe) | `server.js` `esc()`, `sanitize` |
| **Firestore rules: client `delete` always denied**, writes shape-validated | `firestore.rules` |
| **Fail-closed catch-all** — any collection not explicitly opened is denied to clients | `firestore.rules` `match /{document=**}` |
| **Logical backup + restore script** (all collections → timestamped JSON) | `scripts/backup-firestore.mjs` |
| Backups + `.env` **git-ignored** (never committed) | `.gitignore` |
| User accounts reachable **only server-side** (Admin SDK), never by the browser | `firestore.rules` + Admin SDK |

---

## What only you can do (console/billing) ⛔

### 1. Make the database durable (stop the ephemeral fallback)
On Render free disk, data is wiped every redeploy. Durability requires Firestore:
- Firebase Console → ⚙ **Project settings → Service accounts → Generate new private key**.
- In **Render → Environment**, set `FIREBASE_SERVICE_ACCOUNT` to the whole JSON (one line),
  and `FIRESTORE_DATABASE_ID` if you used a named (non-`(default)`) database.
- Boot log should read `[firestore] connected … user accounts are now durable.`
  If it says `not configured`, you are still on the ephemeral store — **fix first**.

### 2. Turn on Firestore's native backups (needs Blaze / pay-as-you-go)
- **Point-in-Time Recovery (PITR):** Firestore → **Backups** → enable PITR
  (rolling ~7-day continuous recovery — undoes accidental mass writes/deletes).
- **Scheduled backups:** create a **daily** schedule with the **longest retention** you'll pay
  for (e.g. 14 days). `gcloud firestore backups schedules create --database='(default)' \
  --recurrence=daily --retention=14d`.

### 3. Immutable off-site copies — the "nobody can delete" part 🔒
Native backups live inside the same project (a compromised owner account could delete them).
For true write-once protection, push the logical dumps to a **retention-locked bucket**:
- Create a bucket with **Bucket Lock + a retention policy**, then **LOCK** it (irreversible —
  not even the project owner can delete objects until retention expires):
  ```
  gcloud storage buckets create gs://landingprep-backups --location=us --uniform-bucket-level-access
  gcloud storage buckets update gs://landingprep-backups --retention-period=30d
  gcloud storage buckets update gs://landingprep-backups --lock-retention-period   # IRREVERSIBLE
  ```
- Run `scripts/backup-firestore.mjs` on a daily job (Cloud Scheduler / GitHub Action /
  cron on a box that has `FIREBASE_SERVICE_ACCOUNT`) and `gcloud storage cp` the dump into
  the locked bucket. Once written, objects **cannot be deleted or overwritten** for 30 days.
- **IAM least privilege:** the backup job's service account gets `roles/storage.objectCreator`
  **only** (create, not delete). Remove `storage.objectAdmin`/`Owner` from day-to-day accounts.

### 4. Lock down access (top-company hygiene)
- **Firebase App Check** (reCAPTCHA Enterprise / Play Integrity) — enforce on Firestore so only
  your real app can hit the public `questions`/`leaderboard` collections (kills API abuse/spam).
- **2FA on every Firebase/GCP/Render/GitHub owner account.** This is the single biggest real-world
  risk — a phished owner login beats any code control.
- **Least-privilege IAM:** no personal Google account should have project `Owner`. Use `Editor`/
  scoped roles; keep `Owner` on a locked-down break-glass account with 2FA.
- **Secret rotation:** rotate `FIREBASE_SERVICE_ACCOUNT`, `SMTP_PASS`, any API tokens if ever
  exposed; store only in Render env, never in the repo (already git-ignored).
- **Publish the rules:** paste `firestore.rules` into Console → Firestore → **Rules → Publish**
  (the file in the repo is not live until published).

### 5. Restore drill (do once, so you know it works)
A backup you've never restored is a hope, not a backup. Once:
```
FIREBASE_SERVICE_ACCOUNT='…' node scripts/backup-firestore.mjs            # take a dump
FIREBASE_SERVICE_ACCOUNT='…' node scripts/backup-firestore.mjs --restore ./backups/firestore-<ISO>.json
```
Restore is **merge-only** (never deletes) — safe to run against a staging DB to verify.

---

## Priority order
1. **§1** (durability) + **§4 2FA** — without these, everything else is moot.
2. **§2** (PITR + scheduled backups) — protects against accidental mass deletes.
3. **§3** (locked bucket) — the literal "nobody can delete" requirement.
4. **§4 App Check / IAM / rotation** — hardens against abuse and account compromise.
