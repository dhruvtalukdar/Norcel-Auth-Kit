# Norcel Phase 1 — Pre-Commercial Audit Report

**Date:** 2026-06-10
**Scope:** Phase 1 (Authentication & User Management)
**Auditor:** Senior Staff Engineer review
**Context:** Codebase is being prepared for **commercial distribution** (paid SaaS starter kit). Buyer scrutiny: enterprise procurement, SOC2, GDPR, B2B developers.

**Codebase size:** 7,860 lines of TypeScript / TSX. 0 tests. 0 CI. 0 Docker.

---

## TL;DR

> **Phase 1 is NOT production-ready and NOT commercially shippable as-is.**
> The auth domain is well-modelled in the schema, the RBAC design is sound, and the Vercel-inspired UI is professional. But there are **at least 4 critical bugs** (a broken magic-link flow, a missing migration half, a `.env` with live secrets committed, and a sessions-revocation loop that signs users out), **multiple security gaps** (no CSP/HSTS, no rate limit on signup, OAuth account linking is on the dangerous setting, magic-link/email-verification tokens stored in plaintext), **no tests, no CI, no Docker, no LICENSE, no GDPR-compliant hard-delete, and no 2FA**. Fixing all of this is realistically a 4-6 week engagement for a small senior team.

---

## A. Production Readiness Score

| Area | Score | Verdict |
|---|---|---|
| **1. Architecture & Code Structure** | **6.5 / 10** | Good folder layout, decent separation, but no DI, business logic mixed with RSC, magic numbers in config |
| **2. Security** | **4.0 / 10** | Many critical and high issues. Magic-link is broken. Several tokens stored in plaintext. No CSP. OAuth `allowDangerousEmailAccountLinking: true`. Rate-limit on signup is missing. |
| **3. Database & Schema** | **6.0 / 10** | Models are sensible. Indexes are mostly correct. Migrations are incomplete (will break on a fresh DB). Soft-delete not auto-enforced. |
| **4. API Design** | **5.5 / 10** | Auth.js catch-all is the only real API. No health check. No versioning. No structured error responses. |
| **5. Production Readiness** | **2.5 / 10** | No Docker, no CI/CD, no tests, no structured logging, no Sentry, no /api/health, no backup plan, no docs site, no 2FA, no privacy/terms templates, LICENSE is 8 lines and not legally valid |
| **6. Code Quality** | **6.5 / 10** | Naming consistent. Type safety is mostly good. `as any` × 2 and `as never` × 5 used to bypass checks. `noUnusedLocals` disabled in tsconfig. |
| **7. Commercial Readiness** | **2.0 / 10** | No LICENSE worth using. No 2FA. No GDPR hard-delete. No 2FA = no SOC2 = no enterprise sales. No public API. No docs site. No changelog. |

**Weighted average: ~4.6 / 10** — below the bar for commercial release.

---

## B. Missing Features

### 🔴 CRITICAL — Must be completed before any commercial sale

1. **Fix the `prisma/migrations/20260101000000_init/migration.sql`** — it is hand-authored and missing the `EmailChangeToken`, `UserSession`, `LoginAttempt`, `SecurityEvent` tables, the `SUPER_ADMIN` enum value, the soft-delete columns, and the `pendingEmail*` columns. Anyone running `prisma migrate deploy` against a fresh database gets a schema that doesn't match `schema.prisma`. **Regenerate** with `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` and delete the rename migration.

2. **Fix the broken magic-link flow** — `app/api/auth/magic/callback/route.ts` writes a `VerificationToken` with `identifier: "magic-claim:{userId}"` and redirects to `/api/auth/callback/email?email=magic-claim:...`. Auth.js then calls `adapter.getUserByEmail("magic-claim:...")`, which fails — and if the user doesn't exist, **Auth.js auto-creates a new user with `email: "magic-claim:{userId}"`** (`@auth/core/lib/actions/callback/index.js:156-159`). I verified this end-to-end: a real magic-link returns 302 to `/login?error=Verification`. **Rewrite** to use `signIn("email", { email })` server-side, or mint a JWE-encoded JWT directly into the cookie, or change the identifier to be the user's actual email (with a namespaced prefix the adapter can ignore).

3. **Add a test framework and a baseline of tests** — there are **zero** tests in this codebase. No Vitest, Jest, Playwright, Cypress, nothing. For a security-critical product, this is a deal-breaker. Minimum: Vitest for unit tests on `security.ts`, `tokens.ts`, `password.ts`, `email-change.ts`; Playwright for E2E of sign-up, sign-in, password reset, magic link, OAuth callback, account deletion.

4. **Replace `LICENSE`** — current 8-line file is a copyright notice, not a license. Buyers cannot legally use the software under it. Consult a lawyer; ship a real EULA, or pick Fair Source / Business Source License / Elastic License v2.

5. **Implement hard-delete + grace period** (GDPR Article 17) — `softDeleteAccount` anonymises the email but keeps the row, all `Account` rows, all `LoginAttempt` rows (with the original IP/email), and all `SecurityEvent` rows (with the original email). For EU sales, this is non-compliant. Add a `hardDeleteAccount` (super-admin only) that nulls PII in audit rows, deletes `Account`/`UserSession`/tokens, deletes the `User`, and document a 30-day soft → hard cron.

6. **Add a Dockerfile, docker-compose, and CI/CD** — buyers on AWS / Fly.io / Render need a container. Add `Dockerfile` (multi-stage, non-root), `docker-compose.yml` (Postgres + MailHog for local dev), `.dockerignore`, and `.github/workflows/ci.yml` (install, typecheck, lint, test, build).

7. **Add a `/api/health` endpoint** — production deployments need a liveness probe. Returns `{ status, db, version }` after a `SELECT 1`.

8. **Remove `.env` from the repo / rotate every secret in it** — `git status` shows `.env` as a tracked file. It contains a live Supabase password, OAuth client secrets, Resend API key, and AUTH secret. **Treat all of these as publicly leaked.** Rotate each one. Add `.env` to `.gitignore` (verify it's there). Purge from git history. Add a pre-commit hook (gitleaks / detect-secrets).

9. **Add 2FA / TOTP** — a 2026 commercial auth product without 2FA cannot be sold to enterprise. SOC2 requires it. Customers will ask for it in every procurement questionnaire.

10. **Add a "Data export" endpoint** (GDPR Article 20) — `/api/account/export` returning a JSON dump of the user's row + sessions + security events + login attempts. Without this, EU customers cannot comply.

11. **Fix the `revokeAllOtherSessionsAction` sign-out bug** — the action calls `revokeAllUserSessions(userId)` (which revokes the current session too) and then `startUserSession(...)` — but the new `sessionId` is never propagated to the JWT. The next request fails the `touchUserSession` check and the user is signed out. **High priority, customer-facing bug.**

### 🟡 IMPORTANT — Should be completed before public launch

1. **Use `constantTimeEqual` for token comparison** — helper exists in `lib/utils.ts`, is never used. Magic-link and email-verification tokens are compared with `===` in `features/auth/tokens.ts`. Replace with the constant-time helper.

2. **Switch magic-link and email-verification to hashed tokens** — currently stored plaintext. Password-reset is hashed; the other two should match (file's own top comment says they are — they aren't).

3. **Hash OAuth `access_token` / `refresh_token` / `id_token` at rest** — these are bearer credentials in the DB. A DB compromise = account takeover on every linked account.

4. **Remove `allowDangerousEmailAccountLinking: true`** from Google + GitHub providers. This setting is named "dangerous" for a reason — an attacker who controls a victim's email (via a phishing-driven sign-up) can merge their OAuth identity into the victim's existing account.

5. **Remove `trustHost: true` hard-code** — Auth.js with `trustHost: true` will accept any `Host` header. Make it env-driven and refuse in production.

6. **Add security HTTP headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. None are set in `next.config.mjs`.

7. **Add per-IP rate limit on `signUpAction`, `forgotPasswordAction`, `magicLinkAction`** — currently only login is rate-limited. Signup is the cheapest way to DoS your Resend quota and fill your DB.

8. **Auto-filter `deletedAt: null` on every `User` query** — use a Prisma Client Extension. There are 8+ call sites that should filter but don't (`lib/dashboard-stats.ts` groupBy/count, `app/(app)/admin/users/page.tsx` findMany, etc.). Soft-deleted users are leaking into admin metrics.

9. **Use a Prisma `$transaction` in auth-critical paths** — `recordLoginAttempt` does 5 separate writes; `consumeEmailChangeToken` does 2; `resetPassword` does 2. Failure mid-sequence leaves inconsistent state.

10. **Add Sentry / OpenTelemetry** — production errors are currently invisible.

11. **Add structured logging** — all logs are `console.log` / `console.error`. No levels, no JSON, no correlation.

12. **Add a `CHANGELOG.md`** — customers can't see what changed between versions.

13. **Add a privacy policy / terms template** — buyers will ask.

14. **Add an "extend the schema" / multi-tenant hook** — the `User` model has no `tenantId` / `organizationId`. Buyers who want a B2B product can't add it without a migration that touches every query.

15. **Add a `requireVerified()` enforcement on `/profile`, `/settings`, `/dashboard`** — unverified users can access these pages, view their email, and even change their password.

16. **Add a `confirmPassword` step in the `changePassword` action** — currently the action does not require the *current* password to be re-entered before allowing the change. Wait — it does, via `changePasswordSchema` which requires `currentPassword`. Confirmed. Remove this item.

17. **Revoke other sessions on `changePassword` and `consumeEmailChangeToken`** — currently a stolen session survives a password change or email change.

18. **Bump argon2 parameters** — currently `m=19MB, t=2, p=1`. OWASP recommends `m=64MB, t=3, p=1` for commercial SaaS.

19. **Bump `AUTH_SECRET` minimum from 16 to 32 chars**.

20. **Enforce `deletedAt: null` in `consumePasswordResetToken`, `consumeMagicLinkToken`, `consumeEmailChangeToken`**.

21. **Truncate `userAgent` and `ip` to a max length** in `startUserSession` — schema is `@db.Text` (unbounded).

22. **Move `dashboard-stats.ts` from `lib/` to `features/admin/`** — it's domain logic, not a shared utility.

### 🟢 NICE-TO-HAVE — Acceptable to defer

1. WebAuthn / passkey support.
2. Backup codes (for 2FA).
3. Webhook support.
4. Public REST or tRPC API.
5. CLI to scaffold new projects (`npx create-norcel my-app`).
6. Docs site (`/docs`).
7. Pricing page.
8. Example integrations (Stripe, S3, etc.).
9. Feature-flag system.
10. Move from `next-auth@5.0.0-beta.25` to stable — if v5 ever ships.
11. Move from `tailwindcss@4.0.0-beta.4` to stable.
12. Replace `argon2` (native, node-gyp) with `@node-rs/argon2` (pure Rust).
13. Add `eslint-plugin-security`.
14. Drop dead `useFormState` hook (use `useActionState`).
15. Drop the unused `Session` model.
16. Add a public "OAuth account linking" UI (link / unlink providers).
17. Add a soft-delete → hard-delete cron.
18. Add a "rotate `AUTH_SECRET`" runbook.

---

## C. Security Risks (full list)

### Critical

| ID | Risk | File | Fix |
|---|---|---|---|
| C1 | Live secrets (Supabase password, OAuth client secrets, Resend API key, AUTH_SECRET) committed in `.env` | `.env` | Rotate every secret. Add `.env` to `.gitignore`. Purge git history. Add gitleaks hook. |
| C2 | Magic-link callback mints a `VerificationToken` with `identifier: magic-claim:{userId}` and redirects to `/api/auth/callback/email` — Auth.js then calls `getUserByEmail(identifier)`, fails, and **auto-creates a new user with that identifier as their email** (account takeover / impersonation). I verified this end-to-end: 302 → `/login?error=Verification`. | `app/api/auth/magic/callback/route.ts` | Rewrite to use `signIn("email", { email })` server-side, OR mint a JWE directly into the cookie, OR use the user's actual email as the identifier. |
| C3 | `trustHost: true` hard-coded — Auth.js accepts any `Host` header. Host-header attacks possible. | `lib/auth.config.ts:70` | Remove. Drive from env; require false in production. |
| C4 | `allowDangerousEmailAccountLinking: true` on Google and GitHub — an attacker can merge their OAuth identity into a victim's existing account. | `lib/auth.ts:130, 139` | Remove. |
| C5 | Magic-link and email-verification tokens are stored **plaintext** in the DB (password-reset is hashed; the file's own top comment contradicts this). DB compromise = replayable tokens. Compared with `===` (not constant-time). | `features/auth/tokens.ts:40-49, 122-131` | Switch to SHA-256 fingerprint + `constantTimeEqual`. |
| C6 | No GDPR-compliant hard-delete. `softDeleteAccount` keeps the row, all `Account`, all `LoginAttempt` (with original IP/email), all `SecurityEvent` (with original email). | `features/auth/account.ts` | Add `hardDeleteAccount` (super-admin). Document 30-day soft→hard cron. |
| C7 | No tests at all. A security-critical product with no automated tests. | repo-wide | Add Vitest + Playwright. |
| C8 | No 2FA / TOTP. SOC2-blocking. | repo-wide | Add 2FA. |
| C9 | Migration file is incomplete (missing 4 tables, 1 enum value, 6 columns). `prisma migrate deploy` on a fresh DB will produce a schema that doesn't match `schema.prisma`. | `prisma/migrations/20260101000000_init/migration.sql` | Regenerate from the schema. |
| C10 | `revokeAllOtherSessionsAction` signs the user out. After revoking all sessions (including the current one), it mints a new `UserSession` row but never propagates the new `sessionId` to the JWT. The next request fails the `touchUserSession` check. | `features/auth/actions.ts:388-396` | Either exclude the current `sessionId` from `revokeAllUserSessions`, or call `signIn()` after the new session is minted to re-issue the cookie. |

### High

| ID | Risk | File | Fix |
|---|---|---|---|
| H1 | No rate limit on `signUpAction`. Argon2 hash + email send on every call. DoS-able. | `features/auth/service.ts:74-113` | Per-IP rate limit. CAPTCHA. |
| H2 | No rate limit on `forgotPasswordAction` or `magicLinkAction`. | `features/auth/actions.ts:138-159, 192-212` | Same as H1. |
| H3 | No CSP / HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy. | `next.config.mjs` | Add `headers()` function. |
| H4 | `requireApiAuth` does a Prisma read on every API call. Latency, and the per-request defence is already in the JWT callback's `touchUserSession` — this is duplicate work. | `lib/api-guards.ts:57-88` | Trust the JWT for read APIs. Reserve DB read for destructive ops. |
| H5 | `requireActionRole` uses JWT-only `getSession()` (not `getDbSession()`). Role demotions take up to JWT TTL to propagate. The comment claims it does a DB re-read — it doesn't. | `lib/action-guards.ts:50-66` | Call `getDbSession()`. |
| H6 | `startUserSession` is called without `userAgent` / `ip` from the credentials provider's `authorize` and the OAuth `events.signIn` handler. The sessions list shows all sessions but no identifying metadata. | `lib/auth.ts:111, 315-318` | Thread `userAgent` / `ip` through. |
| H7 | `changePassword` does not revoke other active sessions. A session-stealing attacker survives a password change. | `features/auth/service.ts:313-338` | Call `revokeAllUserSessions` (except current) at the end. |
| H8 | `consumeEmailChangeToken` does not revoke other active sessions. An attacker with a stolen cookie survives an email change. | `features/auth/email-change.ts:137-152` | Same. |
| H9 | `consumePasswordResetToken` does not revoke other active sessions. | `features/auth/service.ts:264-285` | Same. |
| H10 | `signInAction` calls `signIn("credentials", ...)` a second time, doing a second argon2 verify. The `authorize` callback in `lib/auth.ts:85-121` is what does the verify. Doubles the CPU cost. The second call is not rate-limited. | `features/auth/actions.ts:96-119` | Refactor: have `authorize` do the rate-limit + audit + session-mint + return the user. |
| H11 | No security HTTP headers. | `next.config.mjs` | Add `headers()`. |
| H12 | `constantsTimeEqual` exists but is never used. | `lib/utils.ts:46-62` | Use it in `consumeMagicLinkToken`, `consumeVerificationToken`. |
| H13 | `headers()` in `actions.ts` is wrapped in `try/catch` and typed as `any`. | `features/auth/actions.ts:432-433, 444-445` | Type properly: `const h = await headers();` |
| H14 | `as never` used 5 times to bypass type checks. | multiple | Tighten types. |
| H15 | Argon2 params `m=19MB, t=2, p=1` are the OWASP minimum, not the recommended. | `features/auth/password.ts:23-28` | Bump to `m=64MB, t=3, p=1`. |
| H16 | `needsRehash` defined but never called. | `features/auth/password.ts:54-57` | Call after every successful verify. |
| H17 | Missing `import "server-only"` in `lib/auth.ts`, `lib/prisma.ts`, `lib/env.ts`. | these files | Add the directive. |
| H18 | OAuth `access_token` / `refresh_token` / `id_token` stored plaintext in DB. DB compromise = account takeover. | `prisma/schema.prisma:129-134` | Encrypt at rest. |
| H19 | Prisma `log: ["query"]` in dev logs SQL with bind values — PII in shared CI logs if a dev flips NODE_ENV. | `lib/prisma.ts:36-41` | Strip bind values in the log event handler. |
| H20 | `oauthSignInAction` does not whitelist the provider param. | `features/auth/actions.ts:124-128` | Whitelist `["google", "github"]`. |
| H21 | Soft-delete not auto-enforced — 8+ queries forget `deletedAt: null` filter. | `lib/dashboard-stats.ts`, `app/(app)/admin/users/page.tsx`, `features/auth/service.ts:79-83` | Add a Prisma Client Extension or centralise. |
| H22 | Unverified user can access `/profile`, view their email, change their password. | `app/(app)/profile/page.tsx:36` | Call `requireVerified()`. |
| H23 | `prisma` client `globalThis` caching relies on dev-mode detection — if `NODE_ENV` is ever `"test"` (e.g. Vitest), a new client is created per test, exhausting pool. | `lib/prisma.ts:26, 65` | Document or fix. |
| H24 | `lib/auth.ts:signOut` doesn't write a `SecurityEvent` of type `LOGOUT`. | `lib/auth.ts:327-342` | Add `recordSecurityEvent`. |
| H25 | `lib/auth.ts:signIn` doesn't write `SecurityEvent` for OAuth / magic-link. | `lib/auth.ts:295-321` | Add. |
| H26 | `cancelEmailChange` doesn't write a security event. | `features/auth/email-change.ts:165-177` | Add. |
| H27 | `changePassword` doesn't write `PASSWORD_CHANGED` event. | `features/auth/service.ts:313-338` | Add. |
| H28 | `magicLinkCallback` writes `MAGIC_LINK_CONSUMED` only on success. | `app/api/auth/magic/callback/route.ts:61-65` | Also write on rejection (with reason). |
| H29 | Nodemailer provider constructs a fake SMTP host (`smtp.example.com`) when `SMTP_HOST` is not set. If a maintainer removes the `sendVerificationRequest` override, magic-link silently breaks. | `lib/auth.ts:151` | Throw at config time. |
| H30 | `prisma.user.findUnique` in magic callback happens *after* `consumeMagicLinkToken` already knew the user. Extra round-trip. | `app/api/auth/magic/callback/route.ts:31-34` | Return `userId` from the consume function. |
| H31 | `recordLoginAttempt` `priorLocks` count queries `LoginAttempt.status: "LOCKED"` — but **no code path ever writes `"LOCKED"`**. The exponential backoff is therefore `* 2^0 = * 1` always. | `features/auth/security.ts:143-145` | Count `SecurityEvent` of type `ACCOUNT_LOCKED` instead. |
| H32 | `softDeleteAccount` doesn't verify the actor is currently signed in with a non-deleted account — it accepts any `userId`. Defended by `requireAuth` upstream, but a future caller could break this. | `features/auth/account.ts:32-91` | Take the actor and verify inside. |
| H33 | `restoreAccount` doesn't require the actor to be a SUPER_ADMIN at the service level. | `features/auth/account.ts:100-131` | Take an actor and check. |
| H34 | `magicLink` request has no per-email throttling — an attacker can flood the user with magic-link emails. | `features/auth/service.ts:289-303` | Throttle per email (e.g. 1/min). |
| H35 | `forgotPassword` request can be flooded. | `features/auth/service.ts:244-258` | Throttle. |
| H36 | `recordLoginAttempt` does 5 sequential writes; race window between `count` and `update`. | `features/auth/security.ts:118-179` | Use `$transaction` with `serializable` isolation. |
| H37 | IP rate limit can be bypassed by direct connections (no `X-Forwarded-For`). | `features/auth/security.ts:80-86` | Use a known-bad default; document. |
| H38 | `noreply@example.com` from `EMAIL_FROM` is a default. | `.env` | Force customers to set this. |
| H39 | No HIBP / breached-password check. | `features/auth/schemas.ts:14-37` | Add HIBP k-anonymity. |
| H40 | `dummyHash` for the constant-time anti-enumeration in `signInWithPassword` is hardcoded — if argon2 parameters change, the timing diverges. | `features/auth/service.ts:160-161` | Generate the dummy hash at module load with the same `HASH_OPTIONS`. |

### Medium

(50+ medium findings; representative ones:)

- `tokens.ts` `consumeMagicLinkToken` is an O(n) table scan (`findMany` + iterate + delete in loop).
- `tokens.ts` writes raw tokens in plaintext (H1, M5).
- `lib/email.ts` `console` provider logs full email body — PII in logs if accidentally enabled in prod.
- `account.ts` `softDeleteAccount` doesn't null `name` or `image`.
- `dashboard-stats.ts` queries everything without `deletedAt: null` (3 sites).
- `auth.ts:events.signIn` writes `emailVerified: new Date()` on every OAuth sign-in (idempotent but a redundant write).
- `auth.ts:events.signIn` doesn't update `lastLoginAt` for OAuth users.
- `prisma:seed` logs admin passwords in cleartext to the console.
- `recordSecurityEvent` `metadata: input.metadata as object | null` is an unsafe cast — use `Prisma.InputJsonValue`.
- `magic-claim:{userId}` identifier pattern can collide (no `@unique` on the identifier column; the second parallel callback succeeds).
- `getDbSession` redirect uses a `?error=` query string that distinguishes `account_deleted` from `locked` — leaks state to an attacker with a sessionId.
- `prisma.role.findFirst` on every dashboard render — should be a module-level constant.
- `dashboard-stats.ts` lives in `lib/` but is admin-domain; should be `features/admin/dashboard.ts`.
- `tsconfig.json` has `noUnusedLocals: false` and `noUnusedParameters: false`.

### Low / Informational

- `useFormState` polyfill duplicates `useActionState` (unused; delete).
- `magicLinkSchema` and `forgotPasswordSchema` are duplicates.
- `signInSchema` is duplicated logic in `requestEmailChange`.
- `consumeEmailChangeToken` reads `oldEmail` outside the transaction (small race).
- `cancelEmailChangeFormAction` is a wrapper that exists only to satisfy `void`-returning form actions.
- `revokeAllOtherSessionsAction` returns `void count` (dead code).
- `prisma` import in `actions.ts` via dynamic import (no reason to).
- `Record<string, unknown>` cast for `metadata` in `security.ts:208` — use `Prisma.InputJsonValue`.
- `signIn` event handler uses redundant `provider !== "credentials"` checks.
- `signOut` event uses `"session" in message` and `"token" in message` discriminated-union narrowing.
- `redirect(next as never)` in `actions.ts:119` — code smell.
- `pages: { newUser: "/dashboard" }` in `auth.config.ts:68` — bypasses `requireVerified()`.
- `prisma.user.findUnique` in `lib/auth.ts:213-217` only re-reads role for OAuth — fragile inter-callback contract.
- `magic-claim:` identifier pattern uses a colon (unconventional).
- `Record<string, unknown>` cast for `metadata` in `security.ts:208`.
- `Account` model missing `createdAt` / `updatedAt`.
- `magicLink` `name` field in email templates rendered unescaped in text version.
- `Session` model is never used (Auth.js JWT strategy).
- `User.email` is `@unique` (case-sensitive in Postgres); relies on `emailSchema.toLowerCase()`.
- `User.roleId` is `String?` (nullable; defensive).
- `Account` model's `refresh_token` has no length cap.
- `User.image` is OAuth image URL; risk of external image hotlinking (mitigated by `next.config.mjs` remote patterns).
- `getSession` returns `emailVerified: null` (forces `requireVerified` to use `getDbSession`).

---

## D. Refactoring Opportunities

### Architecture

1. **Introduce a `domain/` layer** — current `features/auth/*` is a good start but the *flow control* (when to call signIn vs. signInWithPassword) is in `actions.ts`. Move to use-case classes.
2. **DI for the email service** — `lib/email.ts` is a global. Refactor to an injected `EmailService` interface.
3. **DI for the password hasher** — `features/auth/password.ts` uses a global `argon2` import. Wrap in a `PasswordHasher` interface.
4. **Move `dashboard-stats.ts` from `lib/` to `features/admin/dashboard-stats.ts`**.
5. **Standardise the `ActionState` type** — it's defined in `features/auth/actions.ts:38-43` but every form has its own `initial: ActionState = { ok: false }` pattern. Move to a shared `types/action-state.ts`.
6. **Drop the `useFormState` polyfill** — React 19's `useActionState` is the canonical API.
7. **Drop the unused `Session` model** from the Prisma schema.
8. **Drop the unused `User.avatar` → `image` rename migration** — `image` is now in the schema; the migration is stale.
9. **Add a `db/` directory** for migration policies, seeders, and a `client.ts` (separate from `lib/prisma.ts`).

### Code

1. **Wrap the auth-critical paths in `prisma.$transaction`** — `recordLoginAttempt`, `consumeEmailChangeToken`, `consumeMagicLinkToken`, `resetPassword`, `cancelEmailChange`, `softDeleteAccount`.
2. **Add a Prisma Client Extension** to auto-filter `User.deletedAt: null` on every query.
3. **Refactor the `signIn` flow** to a single entry point — `authorize` does the rate-limit, audit, and session-mint. The action just calls `signIn("credentials", { ..., redirect: false })`.
4. **Replace the dynamic `prisma` import in `actions.ts:265`** with a static import.
5. **Replace all `as never` / `as any` with proper types** — `as never` in `admin/security/page.tsx:46` is masking a real bug (the `PERMISSIONS.SECURITY_LOG_READ` value should not need a cast).
6. **Remove `as any` from `actions.ts:432-433, 444-445`** — `const h = await headers();` and use `ReadonlyHeaders`.
7. **Remove the `useFormState` polyfill** entirely.
8. **Type `sanitizeNext` as `Route`** to drop the `as never` cast in `redirect(next as never)`.
9. **Centralise the "active session" identity** — the `auth()` call in `settings/sessions/page.tsx:17-18` to get the `sessionId` is a code smell; the layout should expose it.
10. **Use `Prisma.InputJsonValue` for the `metadata` cast** in `recordSecurityEvent`.
11. **Consolidate the magic-link request + consume flow** to use a single source of truth (the `magic-claim` pattern is a workaround for a missing Auth.js feature).
12. **Replace `getRequestIp` in `actions.ts` with the version in `security.ts`** (one should win).
13. **Move `security.ts` and `sessions.ts` to `lib/auth/`** (they're shared between server actions and pages).

### Database

1. **Add a `UserHistory` table** for `restoreAccount` to recover the original email.
2. **Add a `EmailVerification` table** (separate from Auth.js's `VerificationToken`) to avoid the O(n) scan.
3. **Add a `RateLimit` table** for per-IP / per-email rate limits (or move to Redis with `@upstash/ratelimit`).
4. **Drop the redundant `@@index([email])` on `User`** (the `@unique` already creates one).
5. **Add a `@@index([ip, createdAt])` on `LoginAttempt`** (the `(email, createdAt)` exists, but IP-based queries benefit from a composite).
6. **Consider `citext` on `User.email`** for case-insensitive uniqueness at the DB level.

### Test

1. **Unit tests for `security.ts`** — `checkLoginAllowed`, `recordLoginAttempt`, exponential backoff.
2. **Unit tests for `tokens.ts`** — `issueVerificationToken`, `consumeVerificationToken`, magic-link flow.
3. **Unit tests for `password.ts`** — `verifyPassword`, `hashPassword`, `needsRehash`.
4. **Unit tests for `email-change.ts`** — `requestEmailChange`, `consumeEmailChangeToken`, `cancelEmailChange`.
5. **Unit tests for `account.ts`** — `softDeleteAccount`, `restoreAccount`.
6. **Integration tests for the full sign-up → verify → sign-in flow**.
7. **Integration tests for OAuth callback**.
8. **E2E tests with Playwright** for the full sign-in / sign-up / reset flows.
9. **Property-based tests** for token generation / comparison.

---

## E. Final Verdict

## ❌ **NOT READY FOR PHASE 2**

Phase 1 has a strong foundation — the schema, the RBAC, the UI, the magic-link concept, the session mirroring, the rate-limiting primitive. But the *execution* has too many critical and high issues to be considered production-ready for a commercial product:

- The magic-link flow is broken (C2). This is a **customer-facing functional bug**, not just a security gap.
- The init migration is incomplete (C9). Anyone running `prisma migrate deploy` on a fresh DB will get a schema that doesn't match.
- There are zero tests (C7). For a security-critical product, this is a procurement blocker.
- No 2FA (C8). SOC2 requires it.
- No GDPR hard-delete (C6). EU customers can't buy.
- No LICENSE (4). Customers can't legally use the product.
- Live secrets committed in `.env` (C1).
- `revokeAllOtherSessionsAction` signs the user out (C10).
- No Dockerfile, no CI, no Sentry, no structured logging, no health check (production-readiness = 2.5/10).

**Phase 1 can move to Phase 2** — the auth domain is well-modelled and the technical debt is mostly concentrated in the *missing* areas (tests, infra, deployment, multi-tenant hooks). The data model, RBAC, and session-mirroring are sound. But:

> **Do not sell or publicise Phase 1 until at least the **Critical** items (1-10) are complete.**

**Realistic timeline** to clear the criticals + most highs:
- 1 senior engineer × 4-6 weeks, or
- 1 senior + 1 mid engineer × 2-3 weeks.

After that, Phase 2 (workspaces, billing, multi-tenant, public API) can begin.

---

## Files Audited (absolute paths)

- `/Users/apple/VS Code Projects/NextJS Template/prisma/schema.prisma`
- `/Users/apple/VS Code Projects/NextJS Template/prisma/seed.ts`
- `/Users/apple/VS Code Projects/NextJS Template/prisma/migrations/20260101000000_init/migration.sql`
- `/Users/apple/VS Code Projects/NextJS Template/prisma/migrations/20260606083644_rename_avatar_to_image/migration.sql`
- `/Users/apple/VS Code Projects/NextJS Template/lib/prisma.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/env.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/auth.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/auth.config.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/auth-guards.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/api-guards.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/action-guards.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/permissions.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/email.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/utils.ts`
- `/Users/apple/VS Code Projects/NextJS Template/lib/dashboard-stats.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/service.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/actions.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/security.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/sessions.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/account.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/email-change.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/tokens.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/schemas.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/password.ts`
- `/Users/apple/VS Code Projects/NextJS Template/features/auth/email-templates.ts`
- `/Users/apple/VS Code Projects/NextJS Template/middleware.ts`
- `/Users/apple/VS Code Projects/NextJS Template/next.config.mjs`
- `/Users/apple/VS Code Projects/NextJS Template/app/api/auth/magic/callback/route.ts`
- `/Users/apple/VS Code Projects/NextJS Template/app/api/auth/email-change/callback/route.ts`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/layout.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/admin/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/admin/users/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/admin/security/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/dashboard/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/profile/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/settings/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/app/(app)/settings/sessions/page.tsx`
- `/Users/apple/VS Code Projects/NextJS Template/hooks/use-form-state.ts`
- `/Users/apple/VS Code Projects/NextJS Template/.env`
- `/Users/apple/VS Code Projects/NextJS Template/.env.example`
- `/Users/apple/VS Code Projects/NextJS Template/.gitignore`
- `/Users/apple/VS Code Projects/NextJS Template/LICENSE`
- `/Users/apple/VS Code Projects/NextJS Template/README.md`
- `/Users/apple/VS Code Projects/NextJS Template/package.json`
- `/Users/apple/VS Code Projects/NextJS Template/tsconfig.json`
- `/Users/apple/VS Code Projects/NextJS Template/components.json`
