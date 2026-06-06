/**
 * ForgeStack — Server-side authorization guards.
 *
 * Use these helpers in RSC / route handlers / server actions to gate access:
 *
 *   const session = await requireAuth();        // redirect to /login if not signed in
 *   const session = await requireVerified();    // also require emailVerified
 *   const session = await requireAdmin();       // also require role === ADMIN
 *
 * `requireRole("ADMIN")` is the generic form for future role expansion.
 */
import "server-only";

import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: UserRole;
};

type AuthSession = {
  user: SessionUser;
} | null;

export async function getSession(): Promise<AuthSession> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      role: session.user.role,
    },
  };
}

export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
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
  const session = await requireAuth();
  // Re-read the user record so the verification flag is fresh.
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    redirect("/verify-email?pending=1");
  }
  return session;
}

export async function requireAdmin(): Promise<{ user: SessionUser }> {
  const session = await requireAuth();
  if (session.user.role !== UserRole.ADMIN) {
    redirect("/dashboard?denied=admin");
  }
  return session;
}

export async function requireRole(
  role: UserRole | UserRole[]
): Promise<{ user: SessionUser }> {
  const session = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard?denied=role");
  }
  return session;
}
