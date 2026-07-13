# Getting started with ForgeStack

> **Last updated:** 2026-07-12 · ForgeStack v1.0
>
> This is the single source of truth for "how do I get this running". The same content is rendered at `/getting-started` in the running app. If something is wrong here, it's wrong there too.

Get ForgeStack running locally in **~5 minutes**. Then read on for OAuth setup, project structure, and going to production.

---

## 1. Prerequisites

You need:

- **Node.js 20 or later** — `node --version` to check
- **pnpm or npm** — examples use `pnpm`, but `npm` works too (replace `pnpm` with `npm run` in the commands)
- **A Postgres database** — Supabase, Neon, or local. The free tier of Supabase works.
- **A code editor** — VS Code is fine

You do **not** need a verified domain or paid services to run the dev server. The seed creates three demo users you can sign in as immediately.

---

## 2. Install

```bash
git clone <your-fork-or-clone-url> forgestack
cd forgestack
pnpm install
```

The first install takes about 1–2 minutes. If you see peer-dependency warnings, ignore them.

---

## 3. Set up the database

ForgeStack needs a Postgres database. The free Supabase tier works.

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **Project Settings → Database**.
3. Copy the **Transaction-mode** connection string into `DATABASE_URL`.
4. Copy the **Direct** connection string into `DIRECT_URL`.
5. Add these to your `.env` (use the format below — Supabase requires `?pgbouncer=true` for the transaction pooler):

```bash
DATABASE_URL="postgresql://postgres.PROJECTREF:PASSWORD@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=15"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/forgestack"
```

> **Note on the `DIRECT_URL`**: Supabase's free tier pauses the direct connection (port 5432). For local dev, point `DIRECT_URL` at a local Postgres (the example above uses `localhost:5432`). For production, point it at your paid Supabase direct endpoint or a local Postgres in your self-hosted setup.

If you'd rather use **local Postgres** (no Supabase):

```bash
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=forgestack \
  --name forgestack-test-pg \
  postgres:16
```

Then both URLs become `postgresql://postgres:postgres@localhost:5432/forgestack`.

---

## 4. Run migrations + seed

This creates all the tables and inserts three demo users:

```bash
pnpm prisma:generate    # generate the Prisma client
pnpm prisma:migrate     # apply the schema to your database
pnpm prisma:seed        # create USER / ADMIN / SUPER_ADMIN demo users
```

The seed creates these accounts (the **password is `UserDemo123!`** for all three unless you set `SEED_*_PASSWORD` env vars):

| Email | Role |
|---|---|
| `user@forgestack.dev` | `USER` |
| `admin@forgestack.dev` | `ADMIN` |
| `superadmin@forgestack.dev` | `SUPER_ADMIN` |

---

## 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the marketing landing page.

Sign in with `user@forgestack.dev` / `UserDemo123!` to see the regular user dashboard, or `admin@forgestack.dev` / `UserDemo123!` for the admin view.

---

## 6. Configure email (Resend)

**This is the #1 gotcha.** Without configuring email, signups, password resets, and magic links **silently fail** — the API returns success but no email is sent.

### The default state

`EMAIL_PROVIDER=resend` is the default, with a placeholder `RESEND_API_KEY` in `.env.example`. You need to set a real one.

### The "test domain" gotcha

`EMAIL_FROM=onboarding@resend.dev` is Resend's **test domain**. By default, Resend only delivers emails from the test domain to the **Resend account owner's verified email address**. Emails to anyone else are silently dropped.

**If you sign in as `dhruvajyoti90@gmail.com` (your Resend account email) and a magic link arrives — that's expected.** If you sign in as anyone else, the email will not arrive. The Resend API will return success; the email simply won't be delivered.

### Option A: test in dev with the console provider (recommended for local dev)

Set this in your `.env`:

```bash
EMAIL_PROVIDER="console"
```

Now every email will be **logged to your terminal** instead of being sent. Look for the divider in your dev server output:

```
────────────────────────────────────────────────────────────────
📧 [email/console] → user@forgestack.dev
   subject: Your sign-in link
────────────────────────────────────────────────────────────────
Click this link to sign in: http://localhost:3000/api/auth/magic/callback?token=...
────────────────────────────────────────────────────────────────
```

This is the fastest way to develop and test email flows locally. No third-party account needed.

### Option B: test with Resend (closer to production)

1. Sign up at [resend.com](https://resend.com) and verify your email.
2. Create an API key in the Resend dashboard.
3. Set it in your `.env`:

   ```bash
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="re_..."
   EMAIL_FROM="onboarding@resend.dev"   # default; only delivers to you
   ```

4. To test multi-user flows, you have two options:
   - Use the Resend account email (`dhruvajyoti90@gmail.com` in your case) for all test signups
   - Add a custom domain in Resend (free, takes 5 minutes), verify it, and set `EMAIL_FROM=noreply@yourdomain.com`

### Option C: production (real domain)

For production, you need a verified custom domain. Add it in the Resend dashboard, follow the DNS verification steps, then set `EMAIL_FROM` to a real address on that domain.

### The "magic link silently fails for non-existent users" gotcha

ForgeStack's magic-link service uses **anti-enumeration**: it returns the same success message whether the user exists or not. If you sign in with `nonexistent@example.com`, you get the "Check your inbox" message but **no email is sent** (because no user matches).

This is correct security behavior, not a bug. If you want to test magic links, use an email that **exists in your database** (one of the seeded users, or sign up first).

---

## 7. Configure OAuth (Google + GitHub)

Optional but most buyers want it.

### Google

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (or use an existing one).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and your production URL when you deploy).
6. Copy the **Client ID** and **Client secret** to your `.env`:

```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

7. Restart the dev server (`pnpm dev`).

### GitHub

1. Go to [github.com/settings/developers](https://github.com/settings/developers).
2. **New OAuth App**.
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`.
4. Copy the **Client ID** and generate a **Client secret** to your `.env`:

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

5. Restart the dev server.

### The "OAuth user stuck on /verify-email" gotcha

When a new user signs in with Google or GitHub for the first time, the `events.signIn` handler automatically sets `emailVerified` to the current time. This is intentional — OAuth providers verify the email, so we trust them.

If you find a user stuck on `/verify-email` after a fresh OAuth sign-in, that's a bug. Check the dev server logs for any `signIn` event errors.

---

## 8. Project structure (5 min skim)

```
forgestack/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── admin/               # Admin-only
│   ├── (public)/                # Public marketing + auth pages
│   │   ├── login/
│   │   ├── register/
│   │   └── magic-link/
│   ├── api/auth/                # Auth.js routes
│   ├── getting-started/         # The page you're reading
│   ├── page.tsx                 # Marketing landing
│   └── globals.css              # Design tokens
│
├── components/                   # UI components (shadcn/ui-based)
│   ├── ui/                      # Base primitives (button, card, ...)
│   ├── auth/                    # Auth-specific (login form, etc.)
│   └── account/                 # Profile / settings
│
├── features/                     # Domain logic, by feature
│   └── auth/                    # The entire auth domain lives here
│       ├── service.ts           # Sign in, sign up, etc.
│       ├── actions.ts           # Server actions
│       ├── schemas.ts           # Zod validators
│       ├── security.ts          # Rate limits, lockout
│       ├── sessions.ts          # Server-side session mirror
│       ├── password.ts          # Argon2id hashing
│       ├── tokens.ts            # Verification / reset / magic-link
│       ├── email-change.ts      # Two-step email change
│       └── account.ts            # Soft delete
│
├── lib/                          # Shared utilities
│   ├── auth.ts                  # Full Auth.js config (Node runtime)
│   ├── auth.config.ts           # Edge-safe config (for middleware)
│   ├── auth-guards.ts           # requireAuth, requireAdmin, etc.
│   ├── permissions.ts           # RBAC permission system
│   ├── prisma.ts                # Singleton Prisma client
│   ├── env.ts                   # Zod-validated env vars
│   ├── email.ts                 # Resend / SMTP / console provider
│   └── dashboard-stats.ts       # Admin dashboard metrics
│
├── prisma/
│   ├── schema.prisma            # User, Role, Account, Session, etc.
│   ├── migrations/              # Auto-generated
│   └── seed.ts                  # Demo users + roles
│
├── middleware.ts                # Path-based auth gate
│
├── docs/                         # This file lives here
│   ├── README.md
│   ├── INDEX.md
│   ├── concepts/
│   ├── flows/
│   ├── operations/
│   └── security/
│
└── package.json
```

### Where to add a new route

- **Public route** (e.g. `/pricing`): create `app/(public)/pricing/page.tsx`
- **Protected route** (e.g. `/account/settings`): create `app/(app)/account/settings/page.tsx` and call `requireAuth()` at the top
- **Admin-only**: same, but call `requireAdmin()` instead

### Where to add a new server action

- For auth (sign in, sign up, etc.): extend `features/auth/actions.ts`
- For other features: create `features/<feature>/actions.ts` (e.g. `features/billing/actions.ts`)

---

## 9. Common customization tasks

### Add a new OAuth provider

Edit `lib/auth.ts` and add a new entry to the `providers` array. For example, to add Discord:

```ts
import Discord from "next-auth/providers/discord";

// In the providers array:
Discord({
  clientId: serverEnv.DISCORD_CLIENT_ID,
  clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
}),
```

Add the matching env vars to `lib/env.ts`:

```ts
DISCORD_CLIENT_ID: z.string().optional(),
DISCORD_CLIENT_SECRET: z.string().optional(),
```

### Change the brand color

Edit `app/globals.css`. The brand color is the CSS variable `--brand`:

```css
@theme {
  --brand: oklch(0.72 0.18 220);  /* change this to your brand */
}
```

The hero gradient, the active sidebar item, the primary button, and a few other elements use this variable. Search for `--brand` to find them all.

### Customize the email templates

Edit `features/auth/email-templates.ts`. The templates are React Email components. The available templates are:

- `verification` — email verification link
- `password-reset` — password reset link
- `magic-link` — passwordless sign-in link
- `email-change` — email change verification link

Each template takes props (name, url, etc.) and returns `{ subject, html, text }`.

### Add a new role

1. Add the role name to the `UserRole` enum in `prisma/schema.prisma`:
   ```prisma
   enum UserRole {
     USER
     ADMIN
     SUPER_ADMIN
     BILLING_ADMIN   // ← your new role
   }
   ```

2. Add the role to the seed script in `prisma/seed.ts`:
   ```ts
   await prisma.role.upsert({
     where: { name: "BILLING_ADMIN" },
     update: {},
     create: { name: "BILLING_ADMIN", description: "Manages subscriptions" },
   });
   ```

3. Add a permission to `lib/permissions.ts`:
   ```ts
   BILLING_READ: "billing:read",
   BILLING_WRITE: "billing:write",
   ```

4. Add the role's permissions to the `ROLE_PERMISSIONS` map.

### Change the session timeout

Edit `lib/auth.config.ts`:

```ts
session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
```

And the server-side session mirroring in `features/auth/sessions.ts`:

```ts
const REMEMBER_ME_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
```

---

## 10. Going to production

A pre-launch checklist:

- [ ] Hosted Postgres (Supabase paid, Neon, RDS, or self-hosted)
- [ ] `AUTH_URL` set to your production domain (`https://yourapp.com`)
- [ ] `AUTH_TRUST_HOST=true` if behind a reverse proxy
- [ ] OAuth redirect URIs updated for your production domain
- [ ] Verified custom domain in Resend
- [ ] `EMAIL_FROM` set to a real address (`noreply@yourdomain.com`)
- [ ] `AUTH_SECRET` rotated — `openssl rand -base64 32`
- [ ] Build succeeds: `pnpm build`
- [ ] Post-deploy smoke test: sign up, sign in, sign out, password reset, magic link

### Deploying to Vercel (recommended)

1. Push your repo to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Add all the env vars from `.env` to the Vercel project settings.
4. Deploy. Vercel auto-detects Next.js and runs `pnpm build`.

### Deploying with Docker

See `docs/self-hosting/docker.md` (planned for v1.1).

---

## 11. Troubleshooting

### "Sign-in redirects to /login in a loop"

Usually a stale JWT cookie. **Hard-refresh your browser** (`Cmd+Shift+R` / `Ctrl+Shift+R`). If that doesn't work, open DevTools → Application → Storage → Clear site data for `localhost:3000`.

### `PrismaClientInitializationError: Can't reach database server`

The Supabase free-tier pooler rotates IPs every few minutes. Wait 30 seconds and retry. If it persists:

1. Check [status.supabase.com](https://status.supabase.com) for outages
2. Verify your `DATABASE_URL` is correct
3. Try switching to the `DIRECT_URL` for runtime if the pooler is the issue

### Resend emails not arriving

1. Check the [Resend dashboard → Logs](https://resend.com/logs) — was the email sent? If not, your `RESEND_API_KEY` is wrong.
2. If the email was sent but never arrived, **the recipient is not your Resend account email**. This is the test-domain gotcha (see section 6).
3. Use `EMAIL_PROVIDER=console` to verify the email is being sent at all.

### "Magic link says 'check your inbox' but no email"

Either:
- The email doesn't exist in the database (sign up first)
- The recipient isn't your Resend account email
- The email is in spam

Use `EMAIL_PROVIDER=console` to debug — you'll see exactly what the system tries to send.

### OAuth callback fails with `redirect_uri_mismatch`

The redirect URI in your OAuth app doesn't match what Auth.js is sending. Make sure the URI in your Google / GitHub OAuth app exactly matches `<AUTH_URL>/api/auth/callback/<provider>` (e.g. `http://localhost:3000/api/auth/callback/google` for local dev).

---

## Next steps

- [Project structure](#8-project-structure-5-min-skim) — find your way around the codebase
- [Common customizations](#9-common-customization-tasks) — change the brand, add roles, customize emails
- [Going to production](#10-going-to-production) — when you're ready to ship
- [Troubleshooting](#11-troubleshooting) — when something breaks

Or browse the [full documentation](./README.md) for deeper coverage.
