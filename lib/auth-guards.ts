/**
 * Norcel — Server-side authorization guards.
 *
 * Use these helpers in RSC / route handlers / server actions to gate access:
 *
 *   const session = await requireAuth();        // redirect to /login if not signed in
 *   const session = await requireVerified();    // also require emailVerified (DB read)
 *   const session = await requireAdmin();       // also require role === ADMIN or SUPER_ADMIN (DB read)
 *   const session = await requireSuperAdmin();  // also require role === SUPER_ADMIN (DB read)
 *   const session = await requireRole([...]);   // also require role in the list (DB read)
 *
 * For granular checks, use `hasPermission` / `requirePermission` from
 * `@/lib/permissions`.
 *
 * ## Performance model
 *
 * `getSession()` is **JWT-only** — it reads no Prisma. This is the
 * hot path used by `(app)/layout.tsx` and most pages. Auth.js's
 * middleware `authorized` callback already gated entry, and the
 * `jwt` callback re-validates the `sessionId` against `UserSession`
 * on every request. Soft-deletes, lockouts, and role changes still
 * propagate within ~one request cycle.
 *
 * `getDbSession()` does the full Prisma read and is the slow path.
 * Use it from `requireVerified`, `requireAdmin`, `requireSuperAdmin`,
 * `requireRole`, and `requirePermission` — anywhere a stale
 * role/emailVerified would be a real security risk.
 *
 * Both functions are wrapped in `React.cache()` so multiple calls
 * within one render pass share a single JWT decode / Prisma read.
 */
import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: UserRole;
  emailVerified: Date | null;
  sessionId?: string;
};

type AuthSession = {
  user: SessionUser;
} | null;

/**
 * Pure-JWT session read. Hot path. No Prisma. Returns the user claims
 * straight from the Auth.js session cookie.
 *
 * `emailVerified` is mirrored into the JWT claims by the `jwt`
 * callback in `lib/auth.ts` (with a one-time backfill for
 * pre-migration tokens), so we can read it without a DB round-trip.
 */
export const getSession = cache(async (): Promise<AuthSession> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      emailVerified:
        (session.user as { emailVerified?: Date | null }).emailVerified ??
        null,
      role: session.user.role ?? UserRole.USER,
      sessionId: session.user.sessionId,
    },
  };
});

/**
 * DB-aware session read. Slow path (~270ms per call on the Supabase
 * direct connection). Memoised per-request. Use this only when the
 * caller's decision is security-sensitive and can't tolerate a stale
 * role or emailVerified.
 */
export const getDbSession = cache(async (): Promise<AuthSession> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      deletedAt: true,
      lockedUntil: true,
      role: { select: { name: true } },
    },
  });

  if (!dbUser || dbUser.deletedAt) {
    redirect("/login?error=account_deleted");
  }

  if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
    redirect("/login?error=locked");
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? null,
      image: dbUser.image ?? null,
      emailVerified: dbUser.emailVerified,
      role: dbUser.role?.name ?? UserRole.USER,
    },
  };
});

export async function hasRole(
  role: UserRole | UserRole[] | "ADMIN_OR_HIGHER"
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  if (role === "ADMIN_OR_HIGHER") {
    return (
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.SUPER_ADMIN
    );
  }
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(session.user.role);
}

export async function requireAuth(): Promise<{ user: SessionUser }> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireVerified(): Promise<{ user: SessionUser }> {
  // Use the JWT-only path. `emailVerified` is now mirrored into the
  // JWT claims by the `jwt` callback, so we can verify it without
  // a DB round-trip on every page load. The old `getDbSession`
  // path added ~700ms per page render on Supabase's pooler.
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.emailVerified) {
    redirect("/verify-email?pending=1");
  }
  return session;
}

export async function requireAdmin(): Promise<{ user: SessionUser }> {
  // Admin pages need the freshest role — never trust the JWT for an
  // authorisation decision on a destructive operation.
  const session = await getDbSession();
  if (!session) redirect("/login");
  if (
    session.user.role !== UserRole.ADMIN &&
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect("/dashboard?denied=admin");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<{ user: SessionUser }> {
  const session = await getDbSession();
  if (!session) redirect("/login");
  if (session.user.role !== UserRole.SUPER_ADMIN) {
    redirect("/dashboard?denied=super_admin");
  }
  return session;
}

export async function requireRole(
  role: UserRole | UserRole[]
): Promise<{ user: SessionUser }> {
  const session = await getDbSession();
  if (!session) redirect("/login");
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard?denied=role");
  }
  return session;
}
