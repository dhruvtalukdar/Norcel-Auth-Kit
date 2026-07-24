/**
 * Norcel — Server-action authorization guards.
 *
 * Use at the top of a server action to fail closed if the caller isn't
 * authorised. Returns an `ActionState` you can `return` directly:
 *
 *   "use server";
 *   import { requireActionRole } from "@/lib/action-guards";
 *
 *   export async function deleteUserAction(id: string) {
 *     const guard = await requireActionRole(["ADMIN", "SUPER_ADMIN"]);
 *     if (!guard.ok) return guard.state;
 *     // ...handler body
 *   }
 */
import "server-only";

import { UserRole } from "@prisma/client";

import { getSession, type SessionUser } from "@/lib/auth-guards";
import type { ActionState } from "@/features/auth/actions";

export type ActionGuardResult =
  | { ok: true; user: SessionUser }
  | { ok: false; state: ActionState };

const deny: ActionState = {
  ok: false,
  message: "You don't have permission to do that.",
};

/**
 * Require any signed-in user. Use this at the top of a server action
 * that should be accessible to all authenticated callers.
 */
export async function requireActionAuth(): Promise<ActionGuardResult> {
  const session = await getSession();
  if (!session) return { ok: false, state: { ...deny, message: "Sign in to continue." } };
  return { ok: true, user: session.user };
}

/**
 * Require a specific role (or one of several). The user's role is
 * re-read from the database on every call (via `getSession()`), so a
 * role change made in the admin UI takes effect immediately.
 */
export async function requireActionRole(
  role: UserRole | UserRole[] | "ADMIN_OR_HIGHER"
): Promise<ActionGuardResult> {
  const session = await getSession();
  if (!session) return { ok: false, state: { ...deny, message: "Sign in to continue." } };

  if (role === "ADMIN_OR_HIGHER") {
    if (
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.SUPER_ADMIN
    ) {
      return { ok: true, user: session.user };
    }
    return { ok: false, state: deny };
  }

  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.user.role)) return { ok: false, state: deny };
  return { ok: true, user: session.user };
}
