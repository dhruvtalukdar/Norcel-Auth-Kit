# Index

A curated path through the ForgeStack docs. Pick the track that matches your goal.

> **Last updated:** 2026-07-11 — covers ForgeStack v1.0.

---

## I'm shipping a side project this weekend

1. **[`/getting-started`](../../app/getting-started/page.tsx)** or [`getting-started.md`](./getting-started.md) — the **only** doc you need today. 5-min install, OAuth, project structure, going to production.
2. [`flows/sign-up.md`](./flows/sign-up.md) — read this if you're customising the sign-up flow
3. [`concepts/auth.md`](./concepts/auth.md) — skim the auth model (5 min)
4. [`operations/env-vars.md`](./operations/env-vars.md) — every env var, defaults, gotchas
5. [`operations/deployment.md`](./operations/deployment.md) — Vercel + Supabase path
   · also: [`operations/domains.md`](./operations/domains.md) — domain strategy for landing page, demo, and UI kit

**Skip**: security/, threat model, the full concepts section.

---

## I'm building a B2B SaaS

1. [`concepts/auth.md`](./concepts/auth.md)
2. [`concepts/rbac.md`](./concepts/rbac.md)
3. [`concepts/sessions.md`](./concepts/sessions.md) — server-side session mirroring matters for B2B
4. [`concepts/soft-delete.md`](./concepts/soft-delete.md) — GDPR Article 17
5. [`security/threat-model.md`](./security/threat-model.md)
6. [`operations/observability.md`](./operations/observability.md) — Sentry, health check, logs
7. [`flows/role-change.md`](./flows/role-change.md) — read this before changing roles in production

---

## I'm auditing for security

1. [`security/threat-model.md`](./security/threat-model.md) — start here
2. [`security/headers.md`](./security/headers.md) — CSP, HSTS, etc.
3. [`security/tokens.md`](./security/tokens.md) — token formats and rotation
4. [`security/oauth.md`](./security/oauth.md) — OAuth-specific risks
5. [`security/data-handling.md`](./security/data-handling.md) — PII, anonymisation, audit log
6. [`concepts/rate-limiting.md`](./concepts/rate-limiting.md)
7. [`concepts/auth.md`](./concepts/auth.md) — deep dive

---

## I'm deploying to production

1. [`operations/env-vars.md`](./operations/env-vars.md) — every var, every default
2. [`operations/database.md`](./operations/database.md) — Supabase, Neon, RDS
3. [`operations/deployment.md`](./operations/deployment.md) — Vercel, Fly.io, Docker
4. [`operations/observability.md`](./operations/observability.md) — Sentry, health check
5. [`operations/troubleshooting.md`](./operations/troubleshooting.md) — common issues

---

## I'm self-hosting on my own infra

1. [`self-hosting/docker.md`](./self-hosting/docker.md)
2. [`self-hosting/caddy-nginx.md`](./self-hosting/caddy-nginx.md) — reverse proxy, TLS
3. [`self-hosting/upgrade-guide.md`](./self-hosting/upgrade-guide.md) — how to upgrade ForgeStack without losing data

---

## I have a specific question

| Question | Doc |
|---|---|
| How do I add a new OAuth provider (e.g. GitHub, Google)? | [`flows/sign-up.md`](./flows/sign-up.md#oauth-providers) |
| Why does the JWT not update when I change a user's role in the DB? | [`flows/role-change.md`](./flows/role-change.md) |
| How are passwords stored? | [`security/tokens.md`](./security/tokens.md#password-hashing) |
| How do I revoke all sessions for a user? | [`concepts/sessions.md`](./concepts/sessions.md#revoking-sessions) |
| Can I disable email verification? | [`flows/sign-up.md`](./flows/sign-up.md#email-verification) |
| What happens when a user is soft-deleted? | [`concepts/soft-delete.md`](./concepts/soft-delete.md) |
| How do I set up rate limits? | [`concepts/rate-limiting.md`](./concepts/rate-limiting.md) |
| How do I deploy with Docker? | [`self-hosting/docker.md`](./self-hosting/docker.md) |
| What env vars are required? | [`operations/env-vars.md`](./operations/env-vars.md) |

---

## Versioning

Docs are versioned with the kit. When upgrading ForgeStack, check the [`changelog`](../CHANGELOG.md) for what changed in the docs.

| Doc | Last reviewed | Notes |
|---|---|---|
| `concepts/auth.md` | 2026-07-11 | Initial draft for v1.0 |
| `concepts/rbac.md` | 2026-07-11 | Initial draft for v1.0 |
| `concepts/sessions.md` | 2026-07-11 | Initial draft for v1.0 |
| `concepts/soft-delete.md` | 2026-07-11 | Initial draft for v1.0 |
| `concepts/rate-limiting.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/sign-up.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/sign-in.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/password-reset.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/email-change.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/account-deletion.md` | 2026-07-11 | Initial draft for v1.0 |
| `flows/role-change.md` | 2026-07-11 | Initial draft for v1.0 |
| `security/threat-model.md` | 2026-07-11 | Initial draft for v1.0 |
| `security/headers.md` | 2026-07-11 | Initial draft for v1.0 |
| `security/tokens.md` | 2026-07-11 | Initial draft for v1.0 |
| `security/oauth.md` | 2026-07-11 | Initial draft for v1.0 |
| `security/data-handling.md` | 2026-07-11 | Initial draft for v1.0 |
| `operations/env-vars.md` | 2026-07-11 | Initial draft for v1.0 |
| `operations/deployment.md` | 2026-07-14 | Initial draft for v1.0 |
| `operations/domains.md` | 2026-07-12 | Initial draft for v1.0 |
| `operations/domains.md` | 2026-07-12 | Initial draft for v1.0 |
| `operations/database.md` | 2026-07-11 | Initial draft for v1.0 |
| `operations/observability.md` | 2026-07-11 | Initial draft for v1.0 |
| `operations/troubleshooting.md` | 2026-07-11 | Initial draft for v1.0 |
| `self-hosting/docker.md` | 2026-07-11 | Initial draft for v1.0 |
| `self-hosting/caddy-nginx.md` | 2026-07-11 | Initial draft for v1.0 |
| `self-hosting/upgrade-guide.md` | 2026-07-11 | Initial draft for v1.0 |
