# ForgeStack — v1.1 Backlog

Items deferred from v1.0 because they didn't pass the "$150 product
for solo founders" bar. Each item has a brief description, a rough
effort estimate, and a note on what changes in the schema/code.

## Why a v1.1 backlog?

v1.0 ships a working, secure, well-tested auth module. v1.1 is
where the **enterprise-leaning** features go — things that solo
founders don't need but teams do. Each item below is opt-in, has a
clear path to ship, and is sized so a solo founder can knock out 1-2
per weekend.

---

## Critical (won't ship without these eventually)

### 1. OAuth access/refresh/id-token encryption at rest
- **Effort:** 1-2 days
- **What:** Encrypt `Account.refresh_token`, `Account.access_token`,
  `Account.id_token` columns at the application level using
  AES-256-GCM. Currently stored plaintext. A DB compromise
  yields account takeover on every linked OAuth account.
- **Changes:** Add `lib/crypto.ts` with `encryptToken` /
  `decryptToken`, an `OAUTH_TOKEN_ENC_KEY` env var, and a Prisma
  Client Extension that intercepts the `Account` model.

### 2. 2FA / TOTP enrollment
- **Effort:** 1 week
- **What:** Add `TwoFactor` model, enrollment flow, recovery
  codes. SOC2 requires it for enterprise sales.
- **Schema:**
  ```prisma
  model TwoFactorSecret {
    id         String   @id @default(cuid())
    userId     String   @unique
    secret     String   // encrypted at rest
    backupCodes String[] // hashed
    createdAt  DateTime @default(now())
    user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  }
  ```
- **Library:** `otplib` (battle-tested, zero deps for verification).

### 3. GDPR hard-delete (Article 17)
- **Effort:** 3-5 days
- **What:** `hardDeleteAccount` (super-admin only) that
  permanently deletes `Account`, `UserSession`, `PasswordResetToken`,
  `EmailVerificationToken`, `MagicLinkToken`, `EmailChangeToken`,
  the `User` row, and nulls PII in `LoginAttempt` / `SecurityEvent`
  (replace `email`, `ip`, `userAgent` with redacted values).
- **Plus:** a 30-day soft → hard-delete cron job.
- **Also:** `GET /api/account/export` (Article 20 data portability).

### 4. Multi-tenant scaffolding (`Organization` / `Membership`)
- **Effort:** 2 weeks
- **What:** Buyer demand. Add `Organization`, `Membership`
  (org-user-role), invite flow. `User` keeps its existing
  `roleId` for personal-tier use.

---

## Important (adds real value, not blocking)

### 5. WebAuthn / passkey support
- **Effort:** 1 week
- **Library:** `@simplewebauthn/server` + `@simplewebauthn/browser`.
- **Pairs with:** #2 (2FA — passkey is a stronger 2FA factor).

### 6. OAuth account-linking UI
- **Effort:** 1-2 days
- **What:** `/settings/accounts` page where users can list,
  link, and unlink Google/GitHub accounts. Also needs a "verify
  before link" flow that requires the user to sign in with their
  current password first.

### 7. Backup codes for 2FA
- **Effort:** 1 day
- **Piggybacks on:** #2.

### 8. Structured logging + Sentry
- **Effort:** 2-3 days
- **What:** Replace `console.log` / `console.error` with a
  `pino`-based logger. Add `@sentry/nextjs` for production error
  tracking.
- **Why:** You'll miss real errors in production without these.

### 9. Health check endpoint
- **Effort:** 30 minutes
- **What:** `app/api/health/route.ts` that returns
  `{ status, db, version }` after a `SELECT 1`.
- **Why:** Load balancers, uptime monitors, Kubernetes probes.

### 10. Sentry error tracking
- **Effort:** 1-2 hours
- **What:** Install `@sentry/nextjs`, add `sentry.config.ts`,
  wrap `lib/email.ts`'s send functions in Sentry capture.

### 11. `docker-compose.yml` for local dev
- **Effort:** 1-2 hours
- **What:** Postgres + MailHog for local development. The
  `Dockerfile` we shipped is for production; `docker-compose` is
  for the developer's laptop.
- **Why:** Buyers who clone the repo and want zero-config local dev.

### 12. `redirect(next as never)` cleanup
- **Effort:** 1 hour
- **What:** Type `sanitizeNext` to return `Route` and drop the
  `as never` cast. Trivial but it's currently a code smell.

### 13. HIBP password breach check
- **Effort:** 1 day
- **What:** Add a `lib/breached-passwords.ts` that calls the
  HaveIBeenPwned k-anonymity API. Off by default, opt-in via
  `CHECK_BREACHED_PASSWORDS=true`.

### 14. Bump argon2 parameters
- **Effort:** 1 hour
- **What:** Bump from `m=19MB, t=2, p=1` to `m=64MB, t=3, p=1`.
  Adds ~200ms to the first sign-in per user, then caching.

### 15. Auto-deploy `next-auth` v5 stable (when it ships)
- **Effort:** 1 day (when stable lands)
- **Why:** `next-auth@5.0.0-beta.25` is in our `package.json`.
  Procurement teams flag beta deps.

### 16. Move to `@node-rs/argon2` (pure-Rust)
- **Effort:** 1 day
- **What:** Drop `argon2` (native node-gyp binary). Switch to
  `@node-rs/argon2` (Rust, no native build). Simpler Docker,
  simpler CI.

### 17. Test database isolation
- **Effort:** 2 days
- **What:** v1.0 tests run against the dev database with a
  per-test cleanup pattern. v1.1 should spin up a dedicated
  `forgestack_test` schema in CI (and `docker compose up -d postgres`
  locally) and run migrations + tests in a true isolated env.

---

## Nice-to-have (defer until customer demand)

### 18. Magic-link rate-limiting per email (anti-flooding)
- Currently global per-IP. An attacker on a single IP can flood a
  victim with magic-link emails.

### 19. Stricter rate limits (CAPTCHA, device fingerprinting)
- After N failed logins, show a CAPTCHA. Off by default.

### 20. Email templates customization
- Buyers will want to swap "ForgeStack" → their own brand in
  emails. Currently the templates are hardcoded.

### 21. Per-tenant feature flags
- A `lib/feature-flags.ts` driven by env, with the option to
  upgrade to LaunchDarkly / Unleash / PostHog.

### 22. Webhook support
- For "user signed up" / "user verified" / "user deleted"
  events. Buyers integrating with their own systems will ask.

### 23. Public REST / tRPC API
- Currently the only API surface is `/api/auth/*` (Auth.js).
  Some buyers will want a typed API.

### 24. CLI to scaffold new projects
- `npx create-forgestack my-app`. Helps sales.

### 25. Docs site (`/docs`)
- A separate page (or Mintlify / Docusaurus / Nextra). Today
  README + `/license` is enough.

### 26. Pricing page + marketing upgrade
- A static `/pricing` page for the buyer. Currently the marketing
  page exists but the pricing is missing.

### 27. Backup + disaster-recovery runbook
- Document the Postgres backup schedule, RPO/RTO, and the
  restore procedure. Production deployments need this.

### 28. Real lawyer-reviewed EULA
- Today: 11 lines, "contact us". After first sale: have a
  lawyer write a real EULA, update LICENSE, link from
  `/(public)/license`.

### 29. CONTRIBUTING.md
- For when the project accepts external contributions. Today
  the project is closed-source (proprietary).

### 30. Move from `tailwindcss@4.0.0-beta.4` to stable
- Same as #15 — pin to stable when it ships.

---

## How to use this backlog

Each item has a one-paragraph spec and a rough effort estimate.
When a customer asks for a feature, point them at the relevant item
and say "in v1.1, ~X days of work." If a feature gets 3+ requests,
promote it to the next sprint.

The Critical tier is the right size for a 1-person sprint (4 weeks).
The Important tier is ~6 weeks of focused work. The Nice-to-have tier
is indefinite.

Total: **~6 months of solo-founder work** to go from v1.0 to "no
backlog." That's a healthy pipeline.
