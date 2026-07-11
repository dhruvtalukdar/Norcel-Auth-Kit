# Role changes don't propagate to active sessions

> **Last updated:** 2026-07-11 · ForgeStack v1.0

This page answers one specific question:

> I changed a user's role in the database (e.g. promoted them from `USER` to `ADMIN`). They refreshed the page but their UI still shows the old role. They have to sign out and back in to see the change. Why?

The short answer: **this is the standard behaviour of every JWT-based auth system, and it's by design.** Below is the why, the alternatives, and the right way to do role changes in production.

---

## TL;DR

ForgeStack uses **JWT-based sessions**. The user's role is captured in the JWT at sign-in time and is the source of truth for every page request — the database is not re-read on each request. This is true of NextAuth, Clerk, Auth0, WorkOS, and every other JWT-based auth library.

When you change a role in the database, **active JWTs are not updated**. The user keeps their old role until the JWT expires (30 days) or they sign out and back in.

**The right way to change a role in production is to also revoke the user's active sessions.** That forces the next request to re-authenticate and pick up the new role. ForgeStack v1.0 does not ship an admin UI for this; v1.1 will.

---

## Why we don't re-read the role on every request

Every page request would need a database query to fetch the user's current role. With Supabase's free-tier pooler, that's ~700ms per request. A dashboard that loads in 1 second today would load in 2+ seconds.

The trade-off:

| Approach | Per-request cost | Role change latency | Industry standard? |
|---|---|---|---|
| **JWT only (current)** | 0 DB calls per request | Until JWT expires or re-login | ✅ Yes (Clerk, Auth0, NextAuth, WorkOS) |
| Refresh role on every request | 1 DB call per request (~700ms) | Immediate | ❌ No (not at scale) |
| Refresh role every 60s | 1 DB call per minute per session | Up to 60s | ⚠️ Custom, used by some |
| Refresh only on `/admin/*` requests | 1 DB call when navigating to admin | Up to 1 navigation | ❌ Hard to implement cleanly |

ForgeStack ships the JWT-only approach. This is the right default for a SaaS starter kit targeting solo founders and small teams. Customers building enterprise apps with stricter requirements can implement a 60-second refresh in their own `jwt` callback (see "Customising this behaviour" below).

---

## How the role flows through the system

When a user signs in:

1. The `signIn` provider callback runs (`authorize` for credentials, the OAuth handler for Google/GitHub).
2. The `jwt` callback runs. It reads the user's role from the database and writes it into the JWT claims as `token.role`.
3. The JWT is encrypted and set as a cookie.
4. The session callback mirrors the role from the JWT to `session.user.role`.

On every subsequent request:

1. The `jwt` callback runs. It validates the JWT's `sessionId` against the `UserSession` table (to detect revoked sessions) — but it does **not** re-read the role from the database.
2. The session callback mirrors the (unchanged) role to `session.user.role`.
3. The page's `requireAuth` / `requireAdmin` / `requirePermission` reads `session.user.role` and decides what to render.

The role is captured in the JWT at sign-in and does not change during the JWT's lifetime.

---

## The correct way to change a role in production

If you change a user's role, you must also **revoke their active sessions** to force them to re-authenticate with the new role.

### In v1.0 (no admin UI yet)

The cleanest way to do this is to call the existing `revokeAllUserSessions` helper from your own code:

```ts
// app/admin/users/[id]/change-role-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revokeAllUserSessions } from "@/features/auth/sessions";
import { requireSuperAdmin } from "@/lib/auth-guards";

export async function changeUserRoleAction(
  userId: string,
  newRoleName: "USER" | "ADMIN" | "SUPER_ADMIN"
) {
  await requireSuperAdmin();

  const role = await prisma.role.findUniqueOrThrow({ where: { name: newRoleName } });

  // 1. Update the role in the database.
  await prisma.user.update({
    where: { id: userId },
    data: { roleId: role.id },
  });

  // 2. Revoke every active session for this user. The next
  //    request from any of their devices will see a stale
  //    sessionId, fail the touchUserSession check, and force
  //    a re-auth with the new role.
  await revokeAllUserSessions(userId);
}
```

The next time the affected user loads a page, the JWT callback's `touchUserSession` returns `null` (because the `UserSession` row was revoked), the token is cleared, and they're redirected to `/login`. On sign-in, the new role is in the fresh JWT.

### In v1.1 (planned)

The admin user-management page will have a "Change role" action that calls this `changeUserRoleAction` automatically. You won't have to write it.

---

## Common scenarios

### "I changed the role in the database directly and the user doesn't see it"

This is the bug this page documents. The fix is the same: revoke the user's sessions, or ask them to sign out and back in.

To revoke all sessions for a user from the command line (during development):

```ts
// scripts/revoke-user-sessions.ts
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

await p.userSession.updateMany({
  where: { user: { email: "alice@example.com" }, revokedAt: null },
  data: { revokedAt: new Date() },
});
```

### "I need role changes to be immediate (sub-second)"

JWTs can't do this. To get sub-second propagation, you need **server-side sessions** (database-backed, not JWT-backed). ForgeStack v1.0 uses JWTs. v1.1 may add an option to switch to server-side sessions for customers who need this. Until then, the 60-second window is the fastest you can get without a custom solution.

### "I need to rotate role assignments frequently (e.g. feature flags, A/B test bucketing)"

Don't use the `role` field for that. Roles are coarse-grained (USER / ADMIN / SUPER_ADMIN). For fine-grained access control, use the `permissions` system — see [`concepts/rbac.md`](../concepts/rbac.md). Permissions can be re-read on every request via the `requirePermission` guard, which already does a fresh DB read.

---

## Customising this behaviour

If you want a 60-second role refresh, add this to your `jwt` callback in `lib/auth.ts`:

```ts
// Subsequent calls branch (after touchUserSession)
const ROLE_REFRESH_INTERVAL_MS = 60_000;
const lastRoleRefresh =
  (token as { roleRefreshedAt?: number }).roleRefreshedAt ?? 0;
if (token.id && Date.now() - lastRoleRefresh > ROLE_REFRESH_INTERVAL_MS) {
  const fresh = await prisma.user.findUnique({
    where: { id: token.id },
    select: { role: { select: { name: true } } },
  });
  if (fresh?.role) token.role = fresh.role.name;
  (token as { roleRefreshedAt?: number }).roleRefreshedAt = Date.now();
}
```

This adds one DB read per minute per active session. The role change propagates within 60 seconds. The cost is acceptable on paid database plans; on Supabase free tier you may want a longer interval (5–15 minutes) to keep the pooler happy.

---

## Related docs

- [`concepts/rbac.md`](../concepts/rbac.md) — how roles and permissions work
- [`concepts/sessions.md`](../concepts/sessions.md) — how sessions are mirrored server-side
- [`concepts/auth.md`](../concepts/auth.md) — the JWT auth model in general
- [`flows/email-change.md`](./email-change.md) — another two-step change with similar staleness behaviour
