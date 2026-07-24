/**
 * Norcel — API route authorization guards.
 *
 * Use these in Next.js route handlers (`app/api/.../route.ts`) to gate
 * access:
 *
 *   export async function GET(req: NextRequest) {
 *     const session = await requireApiAuth(req);
 *     if ("error" in session) return session.error;
 *     // ...handler body, `session.user` is safe to use
 *   }
 *
 *   export async function POST(req: NextRequest) {
 *     const session = await requireApiRole(req, ["ADMIN", "SUPER_ADMIN"]);
 *     if ("error" in session) return session.error;
 *     // ...
 *   }
 *
 * These helpers return NextResponse objects directly so route handlers
 * can early-return them, instead of `redirect()`-ing (which doesn't
 * work inside route handlers the same way it does in RSC).
 */
import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ApiSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
};

export type ApiGuardResult =
  | { ok: true; user: ApiSession["user"] }
  | { ok: false; error: NextResponse };

const UNAUTHORIZED = NextResponse.json(
  { error: "Unauthorized" },
  { status: 401 }
);
const FORBIDDEN = NextResponse.json(
  { error: "Forbidden" },
  { status: 403 }
);

/**
 * Require any signed-in user. Re-checks the database for soft-delete /
 * lockout (so a revoked session can't keep hitting the API).
 */
export async function requireApiAuth(
  _req: NextRequest
): Promise<ApiGuardResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: UNAUTHORIZED };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      deletedAt: true,
      lockedUntil: true,
      role: { select: { name: true } },
    },
  });
  if (!dbUser || dbUser.deletedAt) return { ok: false, error: UNAUTHORIZED };
  if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
    return { ok: false, error: FORBIDDEN };
  }

  return {
    ok: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? null,
      role: dbUser.role?.name ?? UserRole.USER,
    },
  };
}

/**
 * Require a specific role (or one of several). Use the enum values
 * from `@prisma/client` — `UserRole.ADMIN`, `UserRole.SUPER_ADMIN`.
 */
export async function requireApiRole(
  req: NextRequest,
  role: UserRole | UserRole[] | "ADMIN_OR_HIGHER"
): Promise<ApiGuardResult> {
  const guard = await requireApiAuth(req);
  if (!guard.ok) return guard;

  if (role === "ADMIN_OR_HIGHER") {
    if (guard.user.role === UserRole.ADMIN || guard.user.role === UserRole.SUPER_ADMIN) {
      return guard;
    }
    return { ok: false, error: FORBIDDEN };
  }
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(guard.user.role)) {
    return { ok: false, error: FORBIDDEN };
  }
  return guard;
}
