/**
 * ForgeStack — Permission / RBAC layer.
 *
 * Roles live in the `Role` table. The seed creates three:
 *
 *   - `USER`        — default. Can read their own profile, sessions,
 *                       security events.
 *   - `ADMIN`       — everything USER can, plus `/admin/*` (user list,
 *                       full security-event log).
 *   - `SUPER_ADMIN` — everything ADMIN can, plus destructive
 *                       operations on other admins (role changes,
 *                       account restoration, force sign-out).
 *
 * Use `hasPermission()` / `requirePermission()` for granular checks, and
 * keep the existing `requireAdmin()` for the simple "is this person an
 * admin or super admin?" gate.
 *
 * `hasPermission` is wrapped in `React.cache()` so repeated calls
 * within a single render pass don't re-resolve the session.
 */
import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { getSession, getDbSession } from "@/lib/auth-guards";

/** A permission is a stable string. Add new ones here as the kit grows. */
export const PERMISSIONS = {
  // Profile
  PROFILE_READ_OWN: "profile:read:own",
  PROFILE_UPDATE_OWN: "profile:update:own",
  // Sessions
  SESSION_READ_OWN: "session:read:own",
  SESSION_REVOKE_OWN: "session:revoke:own",
  // Admin
  ADMIN_DASHBOARD_READ: "admin:dashboard:read",
  USER_LIST_READ: "user:list:read",
  USER_READ_ANY: "user:read:any",
  USER_UPDATE_ANY: "user:update:any",
  SECURITY_LOG_READ: "security:log:read",
  // Super-admin only
  ROLE_CHANGE_ADMIN: "role:change:admin",
  ACCOUNT_RESTORE: "account:restore",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Role → permission grants. */
const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  USER: new Set<Permission>([
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.SESSION_READ_OWN,
    PERMISSIONS.SESSION_REVOKE_OWN,
  ]),
  ADMIN: new Set<Permission>([
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.SESSION_READ_OWN,
    PERMISSIONS.SESSION_REVOKE_OWN,
    PERMISSIONS.ADMIN_DASHBOARD_READ,
    PERMISSIONS.USER_LIST_READ,
    PERMISSIONS.USER_READ_ANY,
    PERMISSIONS.SECURITY_LOG_READ,
  ]),
  SUPER_ADMIN: new Set<Permission>([
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.SESSION_READ_OWN,
    PERMISSIONS.SESSION_REVOKE_OWN,
    PERMISSIONS.ADMIN_DASHBOARD_READ,
    PERMISSIONS.USER_LIST_READ,
    PERMISSIONS.USER_READ_ANY,
    PERMISSIONS.USER_UPDATE_ANY,
    PERMISSIONS.SECURITY_LOG_READ,
    PERMISSIONS.ROLE_CHANGE_ADMIN,
    PERMISSIONS.ACCOUNT_RESTORE,
  ]),
};

/** Returns true if the given role has the given permission. */
export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Boolean check: does the current session have this permission?
 * Does NOT redirect — use `requirePermission` for that.
 *
 * Uses the JWT-only fast path; permission checks are boolean gates,
 * not destructive operations, so a stale-by-seconds view of the role
 * is fine here.
 */
export const hasPermission = cache(
  async (permission: Permission): Promise<boolean> => {
    const session = await getSession();
    if (!session) return false;
    return roleHasPermission(session.user.role, permission);
  }
);

/**
 * Check multiple permissions at once. Default mode is "all" (user must
 * have every permission); pass `{ any: true }` for "any" (user needs
 * at least one).
 */
export const hasPermissions = cache(
  async (
    permissions: Permission[],
    opts: { any?: boolean } = {}
  ): Promise<boolean> => {
    const session = await getSession();
    if (!session) return false;
    if (opts.any) {
      return permissions.some((p) =>
        roleHasPermission(session.user.role, p)
      );
    }
    return permissions.every((p) =>
      roleHasPermission(session.user.role, p)
    );
  }
);

/**
 * Server-side guard. Redirects to /login if no session, /dashboard if
 * the user is missing the permission.
 *
 * Always does the full DB read — admin pages must reflect the
 * freshest role.
 */
export const requirePermission = cache(
  async (
    permission: Permission
  ): Promise<{ user: { id: string; email: string; role: UserRole } }> => {
    const session = await getDbSession();
    if (!session) redirect("/login");
    if (!roleHasPermission(session.user.role, permission)) {
      redirect("/dashboard?denied=permission");
    }
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    };
  }
);
