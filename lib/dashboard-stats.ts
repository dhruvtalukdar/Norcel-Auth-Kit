/**
 * ForgeStack — Workspace statistics.
 *
 * Used by `/dashboard` (admin variant) and `/admin` to render
 * high-level metrics. Consolidates three separate `count()` calls
 * into a single `groupBy` round-trip plus a second `count` for
 * the 7-day-active metric (which can't fold into the group-by
 * because it filters on a non-grouped column).
 *
 * Server-only — these helpers talk to Prisma directly.
 */
import "server-only";

import { prisma } from "@/lib/prisma";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type WorkspaceStats = {
  total: number;
  verified: number;
  sevenDayActive: number;
  /** Per-role totals keyed by role name (USER, ADMIN, SUPER_ADMIN).
   *  `unassigned` is the bucket for users with no role. */
  byRole: Record<string, number>;
};

export async function getWorkspaceStats(): Promise<WorkspaceStats> {
  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

  const [breakdown, sevenDayActive, roles] = await Promise.all([
    prisma.user.groupBy({
      by: ["roleId", "emailVerified"],
      _count: { _all: true },
    }),
    prisma.user.count({
      where: { lastLoginAt: { gte: sevenDaysAgo } },
    }),
    // Role IDs are cuids — map them back to USER/ADMIN/SUPER_ADMIN so
    // callers can render `stats.byRole.ADMIN` without an extra round-trip.
    prisma.role.findMany({ select: { id: true, name: true } }),
  ]);

  const roleIdToName = new Map(roles.map((r) => [r.id, r.name]));

  let total = 0;
  let verified = 0;
  const byRole: Record<string, number> = { unassigned: 0 };
  for (const row of breakdown) {
    const n = row._count._all;
    total += n;
    if (row.emailVerified !== null) verified += n;
    const name = row.roleId ? roleIdToName.get(row.roleId) : "unassigned";
    const key = name ?? "unassigned";
    byRole[key] = (byRole[key] ?? 0) + n;
  }
  return { total, verified, sevenDayActive, byRole };
}

/** OAuth-account count (separate table — kept as a single count). */
export async function getOAuthCount(): Promise<number> {
  return prisma.account.count();
}

/** Personal stats for a single user — used on non-admin dashboard. */
export async function getPersonalStats(userId: string): Promise<{
  activeSessions: number;
  lastLoginAt: Date | null;
  memberSince: Date | null;
}> {
  const [activeSessions, account] = await Promise.all([
    prisma.userSession.count({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, createdAt: true },
    }),
  ]);
  return {
    activeSessions,
    lastLoginAt: account?.lastLoginAt ?? null,
    memberSince: account?.createdAt ?? null,
  };
}
