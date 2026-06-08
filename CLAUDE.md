# LandingPrep — Claude Code Operator Notes

## Health Doctor — Permanent Instructions

### The Anthropic Egress Proxy Problem

When Claude Code runs **on the web** (cloud/remote sessions), all outbound HTTP
requests are routed through Anthropic's egress proxy. That proxy **blocks
requests to `landingprep.com`** and returns HTTP 403. The `/api/health/report`
endpoint also returns `"Host not in allowlist"`.

This means `node tools/health-monitor.mjs` **cannot reliably reach the live site
from inside a Claude Code web session**. The script now detects this situation:

- If **all** failed checks returned HTTP 403 → it prints `⚠️  PROXY-BLOCKED` and
  exits **0** (not a real outage — don't create a PR or branch).
- If some checks pass and others fail with non-403 codes → real issue, exit 1.

### Step 1 — Authoritative health check via GitHub Actions (use this first)

The `health.yml` workflow runs `node tools/health-monitor.mjs` from **GitHub's
own infrastructure** (not blocked) every 15 minutes. It is always the
authoritative source of truth.

**Use `mcp__github__actions_list`** to fetch the latest run of `health.yml`:

```
repo:   narasatish/landingprep
workflow: health.yml
```

- Last run **conclusion = success** → site is healthy → **stop, no action**.
- Last run **conclusion = failure** → real issue → check the run logs, diagnose,
  fix, open a PR.

**Also check for open `health-alert` issues** (opened automatically by `health.yml`
on failure, closed on recovery):

```
mcp__github__list_issues  labels=["health-alert"]  state=open
```

No open `health-alert` issues + latest health.yml run succeeded → all good.

### Step 2 — Interpreting `node tools/health-monitor.mjs` locally

| Exit | Meaning |
|------|---------|
| 0, prints `✅ All … checks passed` | Site healthy |
| 0, prints `⚠️  PROXY-BLOCKED` | Egress proxy is blocking — fall back to GH Actions status (Step 1) |
| 1 | Real failures on specific endpoints — diagnose and fix |

### Step 3 — Fix workflow (only when Step 1 or Step 2 exit-1 confirms a real outage)

1. Read the failing endpoint logs / source files to diagnose root cause.
2. Write the **smallest** targeted fix. Never refactor unrelated code.
3. If you edited any `.jsx`, run `node scripts/precompile-jsx.mjs`.
4. Run `npm test` **and** `npm run build` — both must pass before committing.
5. Branch: `git checkout -b health-doctor/<short-slug>`
6. Commit and push; open a PR via `mcp__github__create_pull_request`.

### Absolute rules (do not override)

- **Never** merge a PR or push to `main`. A human approves every deploy.
- **Never** commit `.env` files or secrets.
- **Never** weaken CSP, auth, rate limits, or Gemini free-tier caps.
- If you cannot confidently diagnose, open a draft issue describing the symptom
  and your best hypothesis — do not guess and commit.

---

## Project layout (quick reference)

| Path | Purpose |
|------|---------|
| `server.js` | Node/Express backend — Gemini proxy, auth, static serving |
| `app.jsx` / `screens/*.jsx` | React SPA (precompiled → `.js` by `node scripts/precompile-jsx.mjs`) |
| `content/**/*.json` | Exam question banks |
| `tools/health-monitor.mjs` | Synthetic uptime monitor |
| `.github/workflows/health.yml` | Authoritative external health check (every 15 min) |
| `scripts/precompile-jsx.mjs` | JSX → JS build step (must run after editing any .jsx) |
