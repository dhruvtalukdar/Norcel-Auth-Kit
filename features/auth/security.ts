/**
 * ForgeStack — Security primitives.
 *
 * - Rate-limit failed logins by email and by IP.
 * - Lock a user account after too many failures (15-minute lockout by
 *   default; lockout duration doubles on each repeated failure).
 * - Append every security-relevant event to the SecurityEvent audit log
 *   so admins can answer "who did what when?".
 *
 * The thresholds live here as constants so they're easy to tune.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import {
  type LoginAttemptStatus,
  type SecurityEvent,
  type SecurityEventType,
} from "@prisma/client";

/** Thresholds for the rate limiter / lockout. */
export const SECURITY = {
  /** Max failed attempts within FAIL_WINDOW_MS before the email is locked. */
  MAX_FAILS_PER_WINDOW: 5,
  /** Sliding window for the per-email attempt counter. */
  FAIL_WINDOW_MS: 15 * 60 * 1000,
  /** Initial lockout duration. */
  INITIAL_LOCKOUT_MS: 15 * 60 * 1000,
  /** Max lockout duration (caps the exponential backoff). */
  MAX_LOCKOUT_MS: 24 * 60 * 60 * 1000,
  /** IP-based rate limit (per IP, all emails) within the window. */
  MAX_FAILS_PER_IP: 20,
} as const;

// ─── Login-attempt recording + lockout decision ────────────────────────────

/**
 * Compute whether a fresh login attempt should be rejected before we
 * even check the password. Returns:
 *   - `allowed: true` if the attempt can proceed.
 *   - `allowed: false, reason: 'locked'` if the account is locked.
 *   - `allowed: false, reason: 'too_many_failures'` if the per-IP
 *     rate-limit is hit (treated as a hard block — we won't even try
 *     to look up the user).
 *
 * `email` is the address being attempted; `ip` is the request IP.
 */
export async function checkLoginAllowed(
  email: string,
  ip: string | null
): Promise<
  | { allowed: true }
  | { allowed: false; reason: "locked"; until: Date }
  | { allowed: false; reason: "too_many_failures"; retryAfterMs: number }
> {
  const since = new Date(Date.now() - SECURITY.FAIL_WINDOW_MS);

  // 1. Per-account lock (the user has accumulated too many failures)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, lockedUntil: true, deletedAt: true },
  });

  // Reject deleted accounts entirely — they shouldn't be allowed back in.
  if (user?.deletedAt) {
    return {
      allowed: false,
      reason: "locked",
      until: new Date(Date.now() + SECURITY.INITIAL_LOCKOUT_MS),
    };
  }

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    return { allowed: false, reason: "locked", until: user.lockedUntil };
  }

  // 2. Per-IP rate limit (defends against distributed attacks on a
  //    single user, and against a single attacker spraying many users).
  if (ip) {
    const ipFails = await prisma.loginAttempt.count({
      where: {
        ip,
        status: "FAILURE",
        createdAt: { gte: since },
      },
    });
    if (ipFails >= SECURITY.MAX_FAILS_PER_IP) {
      return {
        allowed: false,
        reason: "too_many_failures",
        retryAfterMs: SECURITY.FAIL_WINDOW_MS,
      };
    }
  }

  return { allowed: true };
}

export type RecordAttemptInput = {
  email: string;
  userId?: string | null;
  status: LoginAttemptStatus;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Record a login attempt and, on failure, increment the user's failure
 * counter and (if over the threshold) set `lockedUntil`. Returns the
 * freshly-updated user record (or null if the user doesn't exist).
 *
 * Callers should always record the *outcome* (success or failure) so we
 * can render an accurate audit log later.
 */
export async function recordLoginAttempt(
  input: RecordAttemptInput
): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email: input.email,
      userId: input.userId ?? null,
      status: input.status,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });

  if (input.status === "FAILURE" && input.userId) {
    // Count recent failures for this user; if over the threshold, lock.
    const since = new Date(Date.now() - SECURITY.FAIL_WINDOW_MS);
    const fails = await prisma.loginAttempt.count({
      where: {
        userId: input.userId,
        status: "FAILURE",
        createdAt: { gte: since },
      },
    });

    if (fails >= SECURITY.MAX_FAILS_PER_WINDOW) {
      // Exponential backoff based on how many times the user has been
      // locked before (we look at how many prior LOCKED attempts
      // there are to estimate the streak).
      const priorLocks = await prisma.loginAttempt.count({
        where: { userId: input.userId, status: "LOCKED" },
      });
      const lockoutMs = Math.min(
        SECURITY.INITIAL_LOCKOUT_MS * Math.pow(2, priorLocks),
        SECURITY.MAX_LOCKOUT_MS
      );
      const lockedUntil = new Date(Date.now() + lockoutMs);

      await prisma.user.update({
        where: { id: input.userId },
        data: { lockedUntil, failedLoginCount: fails },
      });

      await recordSecurityEvent({
        type: "ACCOUNT_LOCKED",
        userId: input.userId,
        email: input.email,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        metadata: { lockedUntil: lockedUntil.toISOString(), fails },
      });
    } else {
      await prisma.user.update({
        where: { id: input.userId },
        data: { failedLoginCount: fails },
      });
    }
  }

  if (input.status === "SUCCESS" && input.userId) {
    // Successful sign-in clears the counter.
    await prisma.user.update({
      where: { id: input.userId },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  }
}

// ─── Security-event audit log ─────────────────────────────────────────────

export type RecordSecurityEventInput = {
  type: SecurityEventType;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Append a row to the SecurityEvent log. Idempotent in spirit but not in
 * practice — call it from a `try/finally` if you need at-least-once
 * delivery.
 */
export async function recordSecurityEvent(
  input: RecordSecurityEventInput
): Promise<SecurityEvent> {
  return prisma.securityEvent.create({
    data: {
      type: input.type,
      userId: input.userId ?? null,
      email: input.email ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      metadata: (input.metadata as object | null) ?? undefined,
    },
  });
}

// ─── IP / user-agent extraction helper ────────────────────────────────────

/**
 * Pull the request IP from common proxy headers. Falls back to null
 * for direct connections where `request.ip` isn't populated.
 */
export function getRequestIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
