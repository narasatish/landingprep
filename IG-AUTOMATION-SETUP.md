# LandingPrep — Daily Instagram Auto-Poster (Setup)

Everything is built. It picks on-brand content from your own site every day, renders a
1080×1080 branded image, and posts it to your linked Instagram Business account — fully
automatically. You only do the one-time setup below (~15 min). After that: zero involvement.

**What's already built (in the repo):**
- `scripts/ig-poster.js` — content picker + image generator + Instagram Graph API publisher
- `server.js` → endpoint `POST /api/ig/post-daily` (`?preview=1` = test without posting)
- `.github/workflows/ig-daily.yml` — runs every day at 03:30 UTC (09:00 IST)
- Weekly content rotation: Mon word-of-day · Tue exam tip · Wed country · Thu scholarship ·
  Fri blog · Sat university requirement · Sun motivation

---

## Step 1 — Make sure Instagram is API-ready
1. Instagram app → Settings → **Switch to Professional → Business**.
2. In **Meta Business Suite** (business.facebook.com) → link the IG account to your **Facebook Page**.

## Step 2 — Create a Meta app + get your IDs/token (~10 min)
1. Go to **developers.facebook.com** → My Apps → **Create App** → type **Business**.
2. Add the **Instagram Graph API** product.
3. In **Graph API Explorer** (developers.facebook.com/tools/explorer): select your app,
   click **Generate Access Token**, and grant these permissions:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`.
4. **Get your Instagram Business Account ID:** in the Explorer run
   `me/accounts` → copy your Page `id` → then run `{page-id}?fields=instagram_business_account`
   → copy the `instagram_business_account.id`. **That's your `IG_USER_ID`.**
5. **Get a non-expiring token (important for "no involvement"):** Business Suite → **Settings →
   Business settings → Users → System Users → Add** (Admin). Assign your app + Page to it, then
   **Generate token** with the 5 permissions above and pick **"Never" expire**. Copy it.
   *(A normal token expires in ~60 days and posting would stop — the System User token never does.)*

## Step 3 — Add environment variables on Render (your web service → Environment)
| Key | Value |
|---|---|
| `IG_USER_ID` | the Instagram Business Account ID from Step 2.4 |
| `IG_ACCESS_TOKEN` | the never-expiring System User token from Step 2.5 |
| `IG_POST_SECRET` | any long random string you invent (e.g. a 32-char password) |
| `PUBLIC_BASE_URL` | `https://landingprep.com` |

Save → Render redeploys. **Never put these in code/git** — env only (same as your Firebase key).

## Step 4 — Add the GitHub secret (for the daily cron)
GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
- Name: `IG_POST_SECRET` — Value: **the exact same string** you used on Render.

## Step 5 — Test safely, then go live
1. **Preview (no posting):** open in a browser —
   `https://landingprep.com/api/ig/post-daily?key=YOUR_SECRET&preview=1`
   You'll get JSON with an `imageUrl` (open it to see today's image) and the `caption`.
2. **First real post:** GitHub repo → **Actions → "Daily Instagram post" → Run workflow**.
   Check your Instagram — the post should appear within a minute.
3. After that it posts **automatically every day**. Nothing else to do.

---

## Customize (optional)
- **Time:** edit the `cron:` line in `.github/workflows/ig-daily.yml` (UTC).
- **Content/themes/captions/colors:** all in `scripts/ig-poster.js` (the `pick*` functions and
  `buildSvg`). Add a "link in bio" tool like Linktree pointing to landingprep.com.
- **Add a profile link:** put `landingprep.com` (or a Linktree) in your IG bio so the
  "link in bio" CTA works.

## Troubleshooting
- Preview works but posting fails → check `IG_USER_ID`/`IG_ACCESS_TOKEN` on Render and that IG is
  a **Business** account linked to the Page.
- Action fails on first try then passes → that's the Render free-tier cold start (the workflow
  retries automatically).
- Posts stopped after ~2 months → your token expired; use the **System User "Never" token** (Step 2.5).
