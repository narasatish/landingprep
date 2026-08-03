# Enabling web-push reminders (VAPID_PRIVATE)

Push reminders — the **daily practice nudge** and the **exam-date countdown (7/3/1/0 days before)** —
only *send* once the server has a `VAPID_PRIVATE` key that matches the committed public key. Until then
everything degrades gracefully: subscriptions and exam dates are still stored, the exam reminder still
fires client-side when the app is open, and nothing errors. This doc turns "send" on.

> **Why you (not the agent) must do this:** `VAPID_PRIVATE` is a private key. It must never be committed
> to git, pasted into chat, or handled by anyone but you. Generate it on your own machine and paste it
> straight into Render.

---

## Step 0 — check whether it's already on

You may already have set this (the daily-practice push uses the same key). Quick test — run with **your**
`ADMIN_SECRET`:

```bash
curl "https://landingprep.com/api/admin/run-exam-reminders?key=YOUR_ADMIN_SECRET"
```

- `{"ok":true, ...}` → **already configured. You're done — nothing to do.**
- `{"error":"Push not configured — set VAPID_PRIVATE ..."}` → not set yet. Continue below.
- `{"error":"Forbidden ..."}` → wrong/missing `ADMIN_SECRET` (that's a different secret; fix that first).

---

## Step 1 — get the private key that pairs with the committed public key

The public key is already committed in **two** places (they must always match the private key):
- `index.html` → `window.LP_VAPID_PUBLIC = "BKc84WZ_..."`
- `server.js` → `const VAPID_PUBLIC = "BKc84WZ_..."`

**If you still have the original private key** for that public key (from when it was first generated),
skip to Step 3 and use it.

**If you don't have it** (most likely), you must generate a **fresh pair** — you can't recover a private
key from a public one (that's the whole point of the cryptography). Generating a fresh pair means the
public key changes too, so you update both files. This is safe: there are effectively no live
subscriptions yet to invalidate.

---

## Step 2 — generate a fresh pair (only if you don't have the original private key)

Run this **on your own machine** (the private key prints to *your* terminal, never to git or chat):

```bash
npx web-push generate-vapid-keys
```

It prints a **Public Key** and a **Private Key**. Then:

1. Replace the public key in **both** files with the new **Public Key**:
   - `index.html` → `window.LP_VAPID_PUBLIC = "NEW_PUBLIC_KEY";`
   - `server.js` → `const VAPID_PUBLIC = "NEW_PUBLIC_KEY";`
2. Rebuild + commit **only the public-key change** (public keys are safe to commit):
   ```bash
   npm run build && git add index.html server.js && git commit -m "chore: rotate VAPID public key" && git push
   ```
   (Do **not** put the private key anywhere in the repo.)

---

## Step 3 — set the private key in Render

1. Render dashboard → your **landingprep-api** service → **Environment**.
2. Add a variable: key `VAPID_PRIVATE`, value = your **Private Key**. Save.
3. Render redeploys automatically. In the deploy **Logs** you should see:
   `[push] web-push configured.`  (If you instead see `VAPID_PRIVATE not set`, the value didn't save.)

---

## Step 4 — verify it sends

1. Re-run the Step 0 curl → it should now return `{"ok":true, "checked":N, "sent":M, ...}`.
2. On the live site, open the homepage, click **🔔 Daily practice reminder**, allow notifications, then set
   an exam date a few days out. The GitHub Action `push-reminder.yml` (already scheduled daily, and it also
   calls `run-exam-reminders`) will fire the countdown pushes — or trigger it manually from the repo's
   **Actions** tab → *Daily Practice Reminder (Push)* → **Run workflow**.

That's it. One `ADMIN_SECRET` (already used by the daily push) drives both the daily nudge and the exam
countdown — no extra GitHub secret needed.
