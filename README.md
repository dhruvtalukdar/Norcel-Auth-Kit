# Norcel

> **Production-grade SaaS starter kit with authentication, RBAC, and a Vercel-inspired design system.**

Norcel ships a complete authentication and authorization module out of the
box — email + password, Google OAuth, GitHub OAuth, magic-link, email
verification, password reset, and role-based access control — together with a
polished, opinionated design system you can sell to your customers as-is.

---

## Highlights

- **Next.js 16 (App Router) + React 19** — Server Components, Server Actions,
  Edge middleware.
- **TypeScript strict mode** end to end.
- **Tailwind CSS v4** with the brand's design tokens declared as CSS variables
  (`@theme` block in [app/globals.css](app/globals.css)).
- **shadcn/ui** primitives re-skinned to match the Vercel design language.
- **Prisma 5 + Supabase Postgres** for storage; Auth.js's PrismaAdapter wires
  OAuth account linking for free.
- **Auth.js v5 (NextAuth)** with the JWT session strategy, role-aware session
  callback, and a credentials provider that does constant-time argon2id
  password verification.
- **RBAC** with `requireAuth` / `requireAdmin` / `requireRole` server guards
  and edge middleware that fast-fails unauthenticated traffic.
- **Email** rendered through one of three providers (Console / Resend / SMTP)
  with the same branded HTML template.
- **Security defaults**: argon2id password hashing, SHA-256-fingerprinted
  reset tokens, HttpOnly + SameSite cookies, constant-time token comparison,
  anti-user-enumeration responses on forgot-password / magic-link.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy the env example and fill in the values
cp .env.example .env

# 3. Generate the Prisma client and apply migrations
npm run prisma:generate
npm run prisma:migrate -- --name init

# 4. Seed the default roles + an admin user
npm run prisma:seed

# 5. Start the dev server
npm run dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000). The
seeded admin and demo user are printed to the terminal after seeding.

---

## Environment variables

All variables live in `.env`. See [.env.example](.env.example) for the full
list. The most important ones:

| Var | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string (Supabase pooler works) |
| `AUTH_SECRET` | ✅ | 32+ random bytes. `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Enable Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | optional | Enable GitHub OAuth |
| `EMAIL_PROVIDER` | optional | `console` (default), `resend`, or `smtp` |
| `RESEND_API_KEY` | if `EMAIL_PROVIDER=resend` | Resend transactional API |

---

## Project structure

```
.
├── app/                       # Next.js App Router
│   ├── (app)/                 # Authenticated routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── admin/
│   ├── api/auth/              # Auth.js route handlers
│   ├── forgot-password/
│   ├── login/
│   ├── magic-link/
│   ├── register/
│   ├── reset-password/
│   ├── verify-email/
│   ├── globals.css            # Tailwind v4 + design tokens
│   └── layout.tsx
├── components/                # Shared UI (shadcn + brand chrome)
│   ├── auth/                  # Auth-specific components
│   ├── account/               # Profile / settings forms
│   └── ui/                    # shadcn primitives
├── features/
│   └── auth/                  # Domain layer (schemas, services, actions)
│       ├── actions.ts         # Server actions
│       ├── email-templates.ts # Branded HTML emails
│       ├── password.ts        # argon2id helpers
│       ├── schemas.ts         # Zod validation
│       ├── service.ts         # Domain logic
│       └── tokens.ts          # Verification / reset / magic-link tokens
├── hooks/                     # Client hooks
├── lib/                       # Cross-cutting helpers
│   ├── auth.ts                # Auth.js config
│   ├── auth-guards.ts         # requireAuth, requireAdmin, hasRole
│   ├── email.ts               # Provider-agnostic email sender
│   ├── env.ts                 # Typed env-var parser
│   ├── prisma.ts              # Prisma client singleton
│   └── utils.ts               # cn(), token helpers, etc.
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # SQL migrations
│   └── seed.ts                # Roles + admin seed
├── middleware.ts              # Edge route protection
└── tailwind / tsconfig / etc.
```

---

## Authentication flows

All flows are implemented as **server actions** so the form submission is
type-safe and the client never has to fetch a token manually.

| Flow | Path | File |
| --- | --- | --- |
| Sign up | `/register` | [components/auth/register-form.tsx](components/auth/register-form.tsx) |
| Sign in (email + password) | `/login` | [components/auth/login-form.tsx](components/auth/login-form.tsx) |
| Sign in (OAuth) | provider buttons on `/login` & `/register` | [components/auth/oauth-buttons.tsx](components/auth/oauth-buttons.tsx) |
| Sign in (magic link) | `/magic-link` → `/api/auth/magic/callback` | [components/auth/magic-link-form.tsx](components/auth/magic-link-form.tsx) |
| Forgot password | `/forgot-password` | [components/auth/forgot-password-form.tsx](components/auth/forgot-password-form.tsx) |
| Reset password | `/reset-password?token=…` | [components/auth/reset-password-form.tsx](components/auth/reset-password-form.tsx) |
| Verify email | `/verify-email?token=…` | [components/auth/verify-email-form.tsx](components/auth/verify-email-form.tsx) |

The domain layer lives in [features/auth/service.ts](features/auth/service.ts).
UI components and route handlers should never import Prisma directly — they
call the service functions.

### Security notes

- **Passwords** are hashed with **argon2id** (memory cost 19 MB, 2 iterations).
  Verification is constant-time-ish and we run a dummy hash on every failed
  lookup to neutralise account-enumeration timing attacks.
- **Tokens** (verification / reset / magic-link) are random 32-byte strings
  encoded as base64url. Password-reset tokens are stored as their **SHA-256
  fingerprint** so a database leak doesn't yield usable tokens.
- **Open-redirect protection**: the `?next=` parameter is sanitised in
  [features/auth/actions.ts](features/auth/actions.ts) to refuse external
  URLs and protocol-relative paths.
- **Anti-enumeration**: the forgot-password and magic-link endpoints always
  return the same generic success message regardless of whether the email is
  registered.
- **CSRF**: Auth.js provides CSRF tokens on the OAuth flow; server actions
  include the same-origin check.

---

## Authorization (RBAC)

Roles live in the `Role` table; the schema seeds two defaults:

- `USER` — default. Can access `/dashboard`, `/profile`, `/settings`.
- `ADMIN` — additionally `/admin/*` and `/admin/users`.

Use the server-side guards from any RSC, route handler, or server action:

```ts
import { requireAuth, requireAdmin, hasRole, requireRole } from "@/lib/auth-guards";

const { user } = await requireAuth();           // redirects to /login if missing
const { user } = await requireAdmin();          // redirects to /dashboard?denied=admin
await hasRole("ADMIN");                         // boolean check (no redirect)
const { user } = await requireRole(["ADMIN", "EDITOR"]);
```

`middleware.ts` does the **first** check (no DB hit) on every protected
request: it forces a redirect to `/login?next=…` for unauthenticated
traffic and to `/dashboard?denied=admin` for non-admins on `/admin/*`.

---

## Design system

The brand tokens come from [DESIGN.md](DESIGN.md). They are mapped into
Tailwind v4 via the `@theme` block in [app/globals.css](app/globals.css), so
you can use them as utility classes — e.g. `bg-canvas`, `text-body`,
`rounded-pill`, `shadow-elev-4`.

The signature **mesh gradient** is a utility (`.bg-mesh-gradient`) used
sparingly on the marketing hero and feature bands.

---

## Useful commands

```bash
npm run dev               # start the dev server
npm run build             # production build
npm run start             # serve the production build
npm run typecheck         # tsc --noEmit
npm run lint              # next lint
npm run prisma:generate   # regenerate the Prisma client
npm run prisma:migrate    # apply dev migrations
npm run prisma:deploy     # apply migrations in production
npm run prisma:seed       # seed roles + admin user
npm run prisma:studio     # open Prisma Studio
```

---

## Roadmap (Phase 2+)

This is the **Phase 1 authentication module**. Subsequent phases will add:

- **Billing** — Stripe subscriptions + entitlement-gated routes
- **Teams** — multi-tenant workspaces, invitations, role assignment
- **Audit log** — track security events for SOC2
- **API tokens** — server-to-server authentication

---

## Production-ready out of the box

Norcel ships with the security and operational primitives a real
SaaS needs from day one:

- **Security headers** — CSP, HSTS (opt-in), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Rate limiting** — per-IP and per-account on sign-in, sign-up, forgot-password, and magic-link.
- **Account lockout** — 5 failed logins in 15 minutes locks the account for 15 minutes, with exponential backoff on repeated lockouts.
- **Audit log** — every security-relevant event (sign-in, sign-out, password change, email change, lockout, etc.) is appended to the `SecurityEvent` table and visible in the admin panel.
- **Server-side session list** — users see and revoke every active session; the JWT is re-validated on every request.
- **Two-step email change** — verification link sent to the *new* address; old sessions are revoked on confirmation.
- **Constant-time token comparison** — magic-link, email-verification, and password-reset tokens are all compared with `constantTimeEqual`.
- **Hashed tokens at rest** — only SHA-256 fingerprints are stored; raw tokens live in the email URL.
- **Soft-delete + account restoration** — accounts can be re-activated by a super-admin; `User.deletedAt` is auto-filtered from the admin views.
- **Docker** — multi-stage, non-root, production-ready.
- **CI** — GitHub Actions runs typecheck, tests, and build on every PR.

## License

Commercial — see [LICENSE](LICENSE) for the binding terms. A plain-language summary is at [/(public)/license](/license).
