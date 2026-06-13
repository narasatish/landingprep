# LandingPrep — Daily Instagram Auto-Poster (Setup)

Everything is built. It picks on-brand content from your own site every day, renders a
1080×1080 branded image, and posts it to your linked Instagram Business account — fully
automatically. You only do the one-time setup below (~15 min). After that: zero involvement.

**What's already built (in the repo):**
- `scripts/ig-poster.js` — content picker + image generator + Instagram Graph API publisher
- `server.js` → endpoint `POST /api/ig/post-daily` (`?preview=1` = test without posting)
- `.github/workflows/ig-daily.yml` — posts **5 times/day**, spaced (09:00 / 12:00 / 15:00 / 18:00 / 21:00 IST)
- **5 daily post themes (bold "news-page" cards, content pulled from the site's own data):**
  slot 0 visa/immigration news · 1 study-abroad/education news · 2 daily quiz (vocab + exam MCQ) ·
  3 exam spotlight (IELTS/TOEFL/GRE/GMAT/PTE/CELPIP/Duolingo) · 4 word of the day.
  A date offset rotates the content so every slot is fresh each day.

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
| `PEXELS_API_KEY` | *(optional)* free key from **pexels.com/api** → adds real photo backgrounds to the news cards. If unset, news cards use the dark-gradient style instead. |

Save → Render redeploys. **Never put these in code/git** — env only (same as your Firebase key).

## Step 4 — Add the GitHub secret (for the daily cron)
GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
- Name: `IG_POST_SECRET` — Value: **the exact same string** you used on Render.

## Step 5 — Test safely, then go live
1. **Preview all 5 of today's posts (no posting):** open in a browser —
   `https://landingprep.com/api/ig/post-daily?key=YOUR_SECRET&preview=all`
   You'll get JSON with 5 `imageUrl`s (open each to see the card) and captions.
   (Preview a single slot: add `&preview=1&slot=0` … `slot=4`.)
2. **First real test — post all 5 now:** GitHub repo → **Actions → "Daily Instagram posts" →
   Run workflow** → set **mode = `all`** → Run. Check your Instagram (5 posts in ~1–2 min).
3. After that it posts **5×/day automatically** at 09:00/12:00/15:00/18:00/21:00 IST. Nothing else to do.

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
