/**
 * ForgeStack — Server-side session management.
 *
 * Auth.js's JWT strategy stores everything in the cookie. We add a
 * parallel `UserSession` table so the user can see and revoke their
 * active sessions from /settings/sessions. The model:
 *
 *   1. On successful sign-in, we mint a random `sessionId`, put it in
 *      the JWT (`token.sessionId`), and create a `UserSession` row
 *      tagged with user-agent / IP / expiry.
 *
 *   2. On every authenticated request, the JWT callback reads the
 *      current `sessionId` and bumps `lastSeenAt`. If the row is gone
 *      (revoked) or expired, we force a re-auth.
 *
 *   3. "Remember me" extends the cookie + UserSession expiry to 30 days
 *      instead of the default (which is 1 day in our config).
 *
 *   4. JWT refresh-token rotation: when the JWT is more than half-way
 *      through its life, the `jwt` callback re-issues the cookie with a
 *      fresh issued-at timestamp — extending the session in the user's
 *      browser without a re-auth.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

/** Default (no-remember-me) session length. */
export const DEFAULT_SESSION_MS = 1 * DAY;
/** "Remember me" session length. */
export const REMEMBER_ME_SESSION_MS = 30 * DAY;
/**
 * Threshold at which the JWT callback rotates the token. When the
 * token is more than this old relative to its TTL, we re-mint it.
 */
export const JWT_REFRESH_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Create a new `UserSession` row for a freshly authenticated user.
 * Returns the new `sessionId`, which should be added to the JWT.
 */
export async function startUserSession(input: {
  userId: string;
  rememberMe: boolean;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = generateToken(24);
  const expiresAt = new Date(
    Date.now() +
      (input.rememberMe ? REMEMBER_ME_SESSION_MS : DEFAULT_SESSION_MS)
  );

  await prisma.userSession.create({
    data: {
      sessionId,
      userId: input.userId,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt,
    },
  });

  return { sessionId, expiresAt };
}

/**
 * Check that the given sessionId is still active. Returns the up-to-date
 * row (and bumps `lastSeenAt`) or null if the session has been revoked
 * or has expired.
 */
export async function touchUserSession(
  sessionId: string | undefined
): Promise<{ userId: string } | null> {
  if (!sessionId) return null;
  const row = await prisma.userSession.findUnique({
    where: { sessionId },
  });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt < new Date()) return null;

  // Bump lastSeenAt on a best-effort basis.
  await prisma.userSession.update({
    where: { sessionId },
    data: { lastSeenAt: new Date() },
  });

  return { userId: row.userId };
}

/**
 * Mark a session as revoked. The next request bearing this sessionId
 * will fail the `touchUserSession` check and the user is redirected
 * to /login.
 */
export async function revokeUserSession(
  sessionId: string,
  userId: string
): Promise<void> {
  await prisma.userSession.updateMany({
    where: { sessionId, userId },
    data: { revokedAt: new Date() },
  });
}

/** Revoke every active session for a user (used in "Sign out everywhere"). */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

/**
 * Lightweight "should I rotate the JWT now?" check. Called from the
 * `jwt` callback with the token's `iat` claim. We rotate if the token
 * is more than half-way through its TTL — this gives the user a
 * smoothly-extending session without forcing a re-auth.
 */
export function shouldRotateJwt(
  issuedAtMs: number,
  ttlMs: number
): boolean {
  return Date.now() - issuedAtMs > ttlMs - JWT_REFRESH_THRESHOLD_MS;
}
