# Norcel — Documentation

Welcome to the Norcel documentation. This folder contains everything you need to understand, extend, and operate a Norcel-based application.

Norcel is a production-grade SaaS starter kit. Its documentation is split by **purpose** so you only ever read what you need.

---

## Folder layout

```
docs/
├── README.md               # This file — entry point
├── INDEX.md                # Topic-by-topic table of contents
│
├── concepts/               # How things work — read once, refer back
│   ├── auth.md             # Authentication model: sessions, JWTs, providers
│   ├── rbac.md             # Role-based access control
│   ├── sessions.md         # Server-side session mirroring (UserSession table)
│   ├── soft-delete.md      # Account deletion + GDPR behavior
│   └── rate-limiting.md    # Login, signup, and account-level rate limits
│
├── flows/                  # End-to-end user journeys — step-by-step
│   ├── sign-up.md          # Email/password + OAuth + magic link
│   ├── sign-in.md          # All four providers, with the rate-limit story
│   ├── password-reset.md   # Request link, consume token, sign in
│   ├── email-change.md     # Two-step verification, session impact
│   ├── account-deletion.md # Soft delete, anonymisation, restoration
│   └── role-change.md      # Why DB role changes don't propagate, what to do
│
├── security/               # Threat model + defense-in-depth
│   ├── threat-model.md     # What we defend against, what we don't
│   ├── headers.md          # CSP, HSTS, X-Frame-Options, etc.
│   ├── tokens.md           # Token formats, hashing, comparison, rotation
│   ├── oauth.md            # OAuth-specific risks and our defenses
│   └── data-handling.md    # PII, anonymisation, audit log, GDPR
│
├── operations/             # Running it in production
│   ├── env-vars.md         # Every env var, what it does, defaults
│   ├── deployment.md       # Vercel, Fly.io, Docker, self-host
│   ├── database.md         # Supabase, Neon, RDS, migrations
│   ├── observability.md    # Health checks, logs, Sentry, alerts
│   └── troubleshooting.md  # Common issues and fixes
│
└── self-hosting/           # For buyers who deploy to their own infra
    ├── docker.md
    ├── caddy-nginx.md
    └── upgrade-guide.md
```

---

## How to read this

**If you're new to Norcel**: read [`INDEX.md`](./INDEX.md) for a curated path through the docs based on your goal (ship a side project, build a B2B SaaS, audit security).

**If you're extending an auth flow**: jump to [`flows/`](./flows/) and find the journey you're changing.

**If you're hardening for production**: start with [`security/threat-model.md`](./security/threat-model.md) and the [`concepts/`](./concepts/) docs in order.

**If you're deploying**: [`operations/deployment.md`](./operations/deployment.md) covers all four common targets.

---

## Conventions

- **Code blocks** are copy-pasteable. They assume the standard project layout.
- **File paths** are relative to the project root (`<project>/...`).
- **Environment variables** are referenced as `ENV_VAR_NAME` — see [`operations/env-vars.md`](./operations/env-vars.md) for the full list.
- **DB column names** use the Prisma `camelCase` form (`roleId`, not `role_id`).

---

## Conventions for contributors

If you're adding a new doc:

1. **Pick the right folder.** Architecture → `concepts/`. User journey → `flows/`. Security → `security/`. Run-the-app → `operations/`.
2. **Lead with the reader's question**, not a section heading. "How do I revoke a session?" beats "Session revocation".
3. **Link, don't repeat.** If a flow depends on a concept, link to the concept doc instead of re-explaining.
4. **Date-sensitive info goes in `INDEX.md`.** "Last updated" headers help readers know what's fresh.
5. **No marketing language.** "Robust", "blazing-fast", "production-grade" — none of that. Just facts.

---

## See also

- [`INDEX.md`](./INDEX.md) — topic-by-topic table of contents
- [`../README.md`](../README.md) — project top-level README
- [`../DESIGN.md`](../DESIGN.md) — design system tokens and recipes
