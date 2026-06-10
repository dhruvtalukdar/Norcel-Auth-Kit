# ForgeStack — Bug Tracker

## Pre-Phase-2 hardening audit (resolved 2026-06-09)

A clean-room audit was run before phase 2. Each finding was either fixed
or confirmed fixed during the audit. This file is the canonical log.

## Original reports

- /register : **working**
- email verification : **working**
- /login -> dashboard : **working**
- /forgot-password : **working**

1. **Magic link allowed sign-in for non-existent users** — **FIXED**
   - Symptom: a magic-link request for any address (whether registered
     or not) could end up minting a session.
   - Root cause: the magic callback used Auth.js's `Nodemailer` provider
     directly, which auto-creates user rows on first use via the
     PrismaAdapter.
   - Fix: `app/api/auth/magic/callback/route.ts` now mints a one-time
     `VerificationToken` row keyed `magic-claim:{userId}` *only after*
     looking up the user, and refuses to redirect if the user is
     missing, soft-deleted, or locked. Smoke-tested:
     - bogus token → `/login?error=expired` (no session)
     - real token for real user → 307 to
       `/api/auth/callback/email?token=...&email=magic-claim:{id}`
   - Anti-enumeration: `requestMagicLink` silently no-ops on unknown
     addresses, so probing doesn't reveal account existence.

2. **Google OAuth sign-in left users unverified** — **FIXED**
   - Symptom: signing in with Google produced a session but
     `emailVerified` was null, so `requireVerified()` redirected the
     user back to the verify-email page.
   - Root cause: Auth.js's adapter doesn't auto-populate
     `emailVerified` from a verified OAuth email.
   - Fix: `events.signIn` in `lib/auth.ts` now writes
     `emailVerified: new Date()` for any non-credentials provider.
     Idempotent on subsequent sign-ins. Also cleaned up the OAuth
     `sessionId` path: the `jwt` callback now re-reads the role from
     the DB on first OAuth/email sign-in (the adapter's `User` only
     carries the base fields, not our `role` / `sessionId` extras).

3. **GitHub OAuth untested** — **VERIFIED WIRED UP**
   - `/api/auth/providers` returns `credentials`, `google`, and
     `github`. The provider is added to the `providers` array
     whenever `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
     in `.env` (both are present), so the GitHub flow uses the same
     verified `events.signIn` handler as Google. End-to-end test
     still requires clicking through the real GitHub OAuth screen.

## Type / lint audit (also resolved)

`npx tsc --noEmit` exits 0. `npm run build` succeeds (19 routes,
middleware 85.4 kB).

Fixes during the audit:

| File | Issue | Fix |
| --- | --- | --- |
| `lib/auth.ts` | `declare module "next-auth/jwt"` couldn't resolve the augmentation under `moduleResolution: "Bundler"` | Added `import "next-auth/jwt"` side-effect import so the augmentation merges into the real module |
| `lib/auth.ts` | `events.signIn` callback destructured `isNewUser` (unused) | Removed from destructure |
| `lib/auth.ts` | `events.signOut` used `AdapterSession` (no `sessionId` field) | Restructured to read the JWT claims from the `token` branch only |
| `lib/auth.ts` | OAuth `jwt` first-sign-in branch read `user.role` (always undefined for OAuth) | Re-read role from the DB on first sign-in when the adapter's `User.role` is missing |
| `middleware.ts` | Edge `session.user.role` typed `"USER" \| "ADMIN"` only — `SUPER_ADMIN` comparison was unreachable | Updated `lib/auth.config.ts` `EdgeSession` type and the narrowing in the `session` callback to include `SUPER_ADMIN` |
| `components/ui/alert.tsx` | `AlertProps` extended `HTMLAttributes<HTMLDivElement>` which has `title?: string` conflicting with our `title?: ReactNode` | Changed to `Omit<HTMLAttributes<HTMLDivElement>, "title">` |
| `components/ui/toaster.tsx` | `export type { ToastActionElement }` re-exported a name that was never imported | Removed the dead re-export |
| `components/app-sidebar.tsx` | `Item.href: string` widened the literal so typedRoutes couldn't verify it | Typed as `Route` from `next` |
| `components/site-footer.tsx` | Same widening | Typed as `Route` |
| `components/site-header.tsx` | Same widening | Typed as `Route` |
| `app/login/page.tsx` | `Link href={\`/register${...}\`}` template string didn't satisfy typedRoutes | Cast to `Route` |
| `app/register/page.tsx` | Same | Cast to `Route` |
| `components/auth/register-form.tsx` | `<a href="/#terms">` and `<a href="/#privacy">` flagged by `no-html-link-for-pages` | Replaced with `next/link` `Link` |
| `features/auth/actions.ts` | `redirect(next)` expected a `Route`; `deleteAccountAction` lacked a terminating return | Cast `next as never`; added explicit return for the `signOut`-redirect path |

## Behavioural checks

- Public routes (`/`, `/login`, `/register`, `/forgot-password`,
  `/magic-link`, `/verify-email`) all return **200**.
- Protected routes (`/dashboard`, `/admin`, `/profile`,
  `/settings/sessions`) all return **307** to `/login?next=…` for
  unauthenticated requests, with the original path preserved.
- `/api/auth/providers` returns 200 with `credentials`, `google`,
  and `github` keys.
- Magic-link callback with a bogus token → `/login?error=expired`.
- Magic-link callback with a real token → 307 to
  `/api/auth/callback/email?token=…&email=magic-claim:{id}`.
- Magic-link callback with no token → `/login?error=invalid`.
- Email-change callback with a bogus token → 307 to
  `/profile?email_change=error&reason=…`.
- 5 failed logins within 15 minutes → `User.lockedUntil` set 15
  minutes into the future; `failedLoginCount` set to 5.

## DB schema

All hardening tables are present in the public schema:

```
Account
EmailChangeToken
LoginAttempt
PasswordResetToken
Role
SecurityEvent
Session
User
UserSession
VerificationToken
_prisma_migrations
```

`prisma migrate status` reports "Database schema is up to date".
