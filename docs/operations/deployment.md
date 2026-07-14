# Deployment

> **Last updated:** 2026-07-14 · ForgeStack v1.0

How to deploy ForgeStack to Vercel, step by step. Assumes you have:
- A Vercel account (free tier is fine)
- A GitHub account
- A Supabase project (or any hosted Postgres)
- A Resend account (or another email provider)
- About 30 minutes

If you haven't set up these accounts yet, see [`docs/getting-started.md`](../getting-started.md) first.

---

## TL;DR

Three Vercel projects, one Supabase database, one Resend account, one custom domain. Total cost: **$10–20/year** for the domain + **$0/mo** on Vercel + Supabase free tiers.

1. Push the repo to GitHub
2. Create the database
3. Deploy the **landing page** project
4. Deploy the **template demo** project
5. Deploy the **UI kit** project (if you have one)
6. Wire up the custom domain
7. Post-deploy smoke test

---

## 0. Push the repo to GitHub

If your code is already in a GitHub repo, skip this. Otherwise:

1. Create a new GitHub repo (e.g. `yourname/forge` or `yourname/forgestack-site`)
2. Push your code:
   ```bash
   git init
   git add -A
   git commit -m "initial commit"
   git branch -M main
   git remote add origin git@github.com:yourname/forge.git
   git push -u origin main
   ```

If you have **three separate repos** (landing page, template, UI kit), push each to its own repo. If you have **one repo with three apps**, the Vercel project setup will be different (point at the subdirectory).

> **Recommendation**: keep the landing page, template, and UI kit as **separate repos**. They're deployed independently and have different release cadences.

---

## 1. Create the Supabase database

The same database serves the template demo. You can also use Neon, RDS, or any hosted Postgres.

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Save the database password somewhere safe (you'll need it for the connection string).
3. Wait for the project to provision (~2 minutes).
4. In **Project Settings → Database**, copy two connection strings:
   - **Transaction mode** (port 6543) — for `DATABASE_URL`
   - **Direct connection** (port 5432) — for `DIRECT_URL`
5. The strings look like:
   ```
   # Transaction mode (runtime queries)
   postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15

   # Direct connection (migrations)
   postgresql://postgres.PROJECTREF:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres
   ```

> **Why the split?** Supabase's transaction pooler (port 6543) is fast but can't do DDL (schema migrations, `prisma migrate deploy`). The direct connection (port 5432) is slower but supports DDL.

> **Free-tier caveat**: Supabase pauses the **direct** endpoint on the free tier. If `prisma migrate deploy` fails with a connection error, you can use the **transaction mode** URL for both `DATABASE_URL` and `DIRECT_URL` during the migration step, then switch `DIRECT_URL` to the local Postgres in your dev environment.

---

## 2. Generate secrets

These need to be set in Vercel. Generate them now and store them somewhere safe (1Password, `.env.local` on your laptop, etc.).

```bash
# Auth.js session signing secret — 32 random bytes
openssl rand -base64 32

# (Optional) Cron secret for any background jobs
openssl rand -base64 32
```

The first one becomes `AUTH_SECRET` in Vercel. Don't commit it.

---

## 3. Get your email-provider credentials

Pick **one**:

### Resend (recommended)
1. Sign up at [resend.com](https://resend.com).
2. **API Keys → Create API Key** → copy the `re_...` value.
3. For production, add a **domain** in Resend, verify the DNS records, and copy the verified address (e.g. `noreply@yourdomain.com`).

### Console (dev only)
1. Set `EMAIL_PROVIDER=console` in Vercel.
2. Emails will be... wait, they won't be. The Vercel function logs don't render the console output. Use this for local dev only.

For v1.0, **use Resend** with a verified domain. Free tier is 100 emails/day.

---

## 4. (Optional) Get your OAuth credentials

You can ship without these, but the demo won't have the "Sign in with Google" button. Skip if you want to do this in a follow-up.

### Google
1. [console.cloud.google.com](https://console.cloud.google.com) → New Project.
2. **APIs & Services → OAuth consent screen** → fill in the basics, save.
3. **Credentials → Create OAuth client ID** → Web application.
4. Authorized redirect URIs:
   ```
   https://demo.yourdomain.com/api/auth/callback/google
   ```
5. Copy the **Client ID** and **Client secret**.

### GitHub
1. [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App.
2. Authorization callback URL:
   ```
   https://demo.yourdomain.com/api/auth/callback/github
   ```
3. Copy the **Client ID** and generate a **Client secret**.

---

## 5. Deploy the **landing page** project

The landing page is in this repo (`app/page.tsx`, the marketing site).

### 5.1 Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** the GitHub repo.
3. Vercel will detect Next.js automatically.
4. **Project Name**: `forge-landing` (or your choice).
5. **Framework Preset**: Next.js (auto-detected).
6. **Root Directory**: `.` (the project root — the landing page is in this repo).
7. Click **Deploy**. (It will fail on the first deploy because of missing env vars — that's fine.)

### 5.2 Set environment variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...pooler.supabase.com:6543/...?pgbouncer=true&connection_limit=1&connect_timeout=15` | The transaction-mode URL from step 1 |
| `DIRECT_URL` | `postgresql://...db.PROJECTREF.supabase.co:5432/postgres` | The direct URL from step 1 |
| `AUTH_SECRET` | the random string you generated | from step 2 |
| `AUTH_URL` | `https://yourdomain.com` | **production URL**, not localhost |
| `EMAIL_PROVIDER` | `resend` | |
| `RESEND_API_KEY` | `re_...` | from step 3 |
| `EMAIL_FROM` | `noreply@yourdomain.com` | the verified Resend address |

> **Environment targeting**: in Vercel, you can scope vars to Production, Preview, and Development. For now, set them on all three.

### 5.3 Run migrations against the production DB

You need to apply the schema to the production database. **Do this from your local machine**, not from Vercel.

```bash
# Set the env vars locally to point at the PRODUCTION database
export DATABASE_URL="postgresql://...pooler.supabase.com:6543/..."
export DIRECT_URL="postgresql://...db.PROJECTREF.supabase.co:5432/postgres"

# Apply the migrations
pnpm prisma migrate deploy

# Seed the demo users (you can do this once)
pnpm prisma:seed
```

The seed creates:
- `superadmin@yourdomain.com` (password: `UserDemo123!`)
- `admin@yourdomain.com` (password: `UserDemo123!`)
- `user@yourdomain.com` (password: `UserDemo123!`)

> **Don't keep these seed users in production.** Change the passwords or delete them after your first login. They're for showing what the demo looks like.

### 5.4 Re-deploy

1. In Vercel → Project → Deployments, click the latest failed deployment → **Redeploy**.
2. This time the build will succeed.
3. Visit the deployment URL — you should see the landing page.

### 5.5 Add the custom domain

1. **Vercel → Project → Settings → Domains**.
2. Add `yourdomain.com` (and `www.yourdomain.com`).
3. Vercel will show the DNS records to add. Common case:
   - `yourdomain.com` → `A 76.76.21.21`
   - `www.yourdomain.com` → `CNAME cname.vercel-dns.com`
4. Add those records at your registrar (Cloudflare, Porkbun, Namecheap, etc.).
5. Wait for DNS to propagate (5 min – 24 hr, usually 5 min).
6. Vercel will issue a free SSL certificate automatically.

---

## 6. Deploy the **template demo** project

The template demo is the **same codebase** as the landing page, just configured differently. It's a separate Vercel project.

> **Wait — same codebase?** Yes. The repo has a single Next.js app. The landing page *is* the marketing site, and the *demo* is what the user sees when they sign up. The "demo" is just the **app routes** (dashboard, profile, etc.) within the same project.

Actually, this needs clarification. There are two architectures:

### Option A: One Vercel project, two routes
The landing page is the marketing surface. The "demo" is the same site, just viewed at `/dashboard`, `/profile`, etc. **Recommended for v1** — one project, one deployment.

### Option B: Two separate Vercel projects
The landing page is a separate project from the demo. Two deployments, two env-var sets, two URLs. **More complex but cleaner separation.**

> **For v1.0, do Option A.** One repo, one Vercel project, one deployment. The "demo" is at `yourdomain.com` after sign-up. The landing page *is* the same site, just the public side.

If you decide later that you want a clean separation (e.g. for white-labeling the demo), you can split it then.

### If you go with Option A

You're done. The landing page and the demo are the same deployment. The buy link in the header points to the demo's pricing.

### If you go with Option B

Follow the same steps as section 5, but:
- Use a different **Project Name** (`forge-demo`)
- Set `AUTH_URL` to the demo's URL (e.g. `https://demo.yourdomain.com`)
- Use a **separate Supabase database** for the demo
- The same Vercel account can host both projects

---

## 7. (Optional) Deploy the **UI kit** project

If you have a separate UI kit, it's its own repo and Vercel project. The deployment steps are the same as section 5. No database, no auth — just a static-ish Next.js site.

If you have the UI kit as a subfolder of the same repo, point Vercel's **Root Directory** to that subfolder.

---

## 8. Post-deploy smoke test

Run through this checklist. It should take ~10 minutes.

### Landing page

- [ ] Visit `https://yourdomain.com` — landing page renders
- [ ] Click "Get started" → goes to `/register`
- [ ] Click "Sign in" → goes to `/login`
- [ ] Click "Docs" in nav → goes to `/getting-started`
- [ ] The "Get ForgeStack — $150" button in the buy section → opens Gumroad in a new tab
- [ ] Open browser dev tools → Network tab → reload the page → no console errors, no 404s, no missing assets

### Sign-up & sign-in

- [ ] Sign up with a new email (use your real email so you can receive the verification)
- [ ] Email verification link arrives in your inbox
- [ ] Click the link → redirected to `/dashboard`
- [ ] Sign out
- [ ] Sign in with the same email + password → redirected to `/dashboard`
- [ ] (If you set up Google OAuth) Click "Sign in with Google" → OAuth flow completes → you land on `/dashboard`

### Template demo

- [ ] Visit `/dashboard` — the dashboard renders with your data
- [ ] Visit `/profile` — shows your name, email, the "change password" form (or "set a password" if you signed up via Google)
- [ ] Visit `/settings` — shows the settings hub with live counts
- [ ] Visit `/settings/sessions` — shows your active session with browser + OS info
- [ ] Click the **amber "Get ForgeStack" pill** in the top-right → opens Gumroad in a new tab

### Security headers

- [ ] Open dev tools → Network → click the landing page → Response Headers
- [ ] Verify these are present:
  - `strict-transport-security: max-age=63072000`
  - `x-content-type-options: nosniff`
  - `x-frame-options: DENY`
  - `referrer-policy: strict-origin-when-cross-origin`
  - `content-security-policy: ...` (should have a long value, not empty)

### Performance

- [ ] Visit [pagespeed.web.dev](https://pagespeed.web.dev) and test your domain
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

If performance is bad, see the [Supabase pooler gotcha](#the-supabase-pooler-gotcha) below.

---

## The Supabase pooler gotcha

The free Supabase pooler is a 700ms-per-query bottleneck. After the first minute or two, every page load is slow because every page does at least one Prisma query through the pooler.

**Why**: with `connection_limit=1`, only one query is in flight at a time. Multiple parallel queries (e.g. the security log's `findMany` + `count`) queue.

**Symptoms**:
- Every page takes 2–4 seconds to load
- After a few minutes, errors like "Timed out fetching a new connection from the connection pool"

**Fixes** (in order of preference):

1. **Upgrade to Supabase paid plan** (~$25/mo) — the pooler becomes faster. **Best fix.**
2. **Point `DATABASE_URL` at a local Postgres** in dev, or a self-hosted Postgres close to your Vercel region. Saves you the pooler round-trip.
3. **Cache pages** — add `export const dynamic = "force-static"` to pages that don't need to be dynamic. Trades freshness for speed.
4. **Reduce the number of queries per page** — for example, the security log page does `findMany` + `count` sequentially instead of in parallel.

If you go with option 2, your local development database and your production database are different. Migrations still need to be applied to both.

---

## Updating the deployment

Every commit you push to the main branch automatically deploys to Vercel. Preview branches get their own URLs (e.g. `forge-landing-git-feature-xyz-yourname.vercel.app`).

To deploy a critical hotfix:
1. Commit to `main`.
2. Vercel builds and deploys automatically.
3. Watch the deployment log for errors.

To roll back:
1. Vercel → Project → Deployments → click on a previous successful deployment → **Promote to Production**.

---

## Common deployment issues

### "Build failed: Can't reach database server"

The build step needs `DATABASE_URL` to be set. If it's not, the build fails when Prisma tries to generate the client. Check that all env vars from section 5.2 are set.

### "Auth.js: MissingSecret"

`AUTH_SECRET` is not set. Add it in Vercel → Project → Settings → Environment Variables.

### "OAuth callback fails with redirect_uri_mismatch"

The redirect URI in your Google/GitHub OAuth app doesn't match what Auth.js is sending. The exact URL must be:
- `https://yourdomain.com/api/auth/callback/google` (for Google)
- `https://yourdomain.com/api/auth/callback/github` (for GitHub)

If you're using a sub-domain like `demo.yourdomain.com`, the URI should be:
- `https://demo.yourdomain.com/api/auth/callback/google`

### "PrismaClientInitializationError: Can't reach database server" in production

The Supabase free-tier pooler is rotating IPs. See the [Supabase pooler gotcha](#the-supabase-pooler-gotcha).

### "Email verification link goes to localhost"

`AUTH_URL` is not set, or is set to `http://localhost:3000`. Set it to your production domain:
```
AUTH_URL=https://yourdomain.com
```

**No trailing slash.** This is the most common deployment bug — the env var in your local `.env` is `http://localhost:3000` for dev, but it must be updated in Vercel for prod.

> ForgeStack v1.0 includes a **fail-fast guard**: if `NODE_ENV=production` and `AUTH_URL` starts with `http://localhost`, the app refuses to boot with a clear error message. So the next person who deploys will see the problem at startup, not at first sign-in.

### "Google sign-in redirects to localhost:3000"

Same root cause as the email case: `AUTH_URL` is still set to `http://localhost:3000`. The OAuth callback URL is constructed from `AUTH_URL`, so the Google redirect goes to a URL that doesn't exist in production.

**Fix**:
1. Set `AUTH_URL` in Vercel to `https://forge-stack-alpha.vercel.app` (no trailing slash)
2. Add `https://forge-stack-alpha.vercel.app/api/auth/callback/google` to your Google OAuth app's authorized redirect URIs
3. Redeploy — env var changes don't take effect on the current deployment

Same applies to GitHub: the redirect URI must be `https://forge-stack-alpha.vercel.app/api/auth/callback/github`.

---

## Cost summary

| Item | Cost | Recurrence |
|---|---|---|
| Custom domain (`yourbrand.dev`) | $10–20 | Yearly |
| Vercel free tier | $0 | — |
| Supabase free tier | $0 | — |
| Resend free tier | $0 | — |
| Total v1.0 | $10–20 | Yearly |

When you outgrow free tiers:
- Vercel Pro: $20/mo (faster builds, more bandwidth)
- Supabase Pro: $25/mo (faster pooler, 8GB database)
- Resend Pro: $20/mo (50k emails/mo)

---

## Related docs

- [`docs/getting-started.md`](../getting-started.md) — local development setup
- [`docs/operations/domains.md`](./domains.md) — domain strategy
- [`docs/operations/observability.md`](./observability.md) — Sentry, logs, alerts (planned for v1.1)
- [`docs/INDEX.md`](../INDEX.md) — topic index
