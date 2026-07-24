# Changelog

All notable changes to Norcel are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-06-10

### Added
- Email + password sign-up with email verification
- Google and GitHub OAuth sign-in
- Magic-link (passwordless) sign-in
- Password reset flow
- Two-step email change with verification link
- Server-side session list with per-device revoke
- Account soft-delete (recoverable by super-admin)
- Admin panel: user list with search/pagination, full security-event audit log
- RBAC with three roles: USER, ADMIN, SUPER_ADMIN
- Permission system (`hasPermission` / `requirePermission`)
- Rate limiting on sign-in (5 fails / 15 min → 15 min lockout, exponential backoff)
- Per-IP sign-in rate limit (20 fails / 15 min)
- Argon2id password hashing (m=19MB, t=2, p=1)
- SHA-256-fingerprinted password-reset tokens
- Constant-time token comparison
- Append-only `SecurityEvent` audit log
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Auto-filter on soft-deleted users
- `requireVerified` enforcement on /profile, /settings, /dashboard
- Vitest unit tests for auth security primitives
- GitHub Actions CI (typecheck, lint, test, build)
- Dockerfile (multi-stage, non-root, production-ready)
- /license route (commercial license terms)

### Security
- All auth-critical paths wrapped in `prisma.$transaction`
- Magic-link and email-verification tokens are stored as SHA-256 fingerprints (not raw)
- Sessions are revoked on password change, password reset, and email change
- Other sessions are auto-signed-out on password change
- `allowDangerousEmailAccountLinking` removed
- `trustHost: true` no longer hard-coded; env-driven
- OAuth `access_token` / `refresh_token` / `id_token` are encrypted at rest (AES-256-GCM)

[1.0.0]: https://github.com/norcel/norcel/releases/tag/v1.0.0
