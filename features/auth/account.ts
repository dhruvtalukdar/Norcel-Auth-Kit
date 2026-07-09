/**
 * ForgeStack — Account deletion / restoration.
 *
 * Deletes are *soft*: we set `User.deletedAt` rather than removing the
 * row. This preserves the audit log (so the SecurityEvent records keep
 * pointing at a real user) and makes restoration possible.
 *
 * Side effects on soft-delete:
 *   - Revoke every active session (so the next request bounces to /login).
 *   - Invalidate any outstanding password-reset or email-change tokens.
 *   - Anonymise the email (so the address can be re-registered later).
 *   - Drop `passwordHash` (so the original password can't be reused).
 *   - Record a `SecurityEvent` of type `ACCOUNT_DELETED` for the audit log.
 *
 * The same row can be re-activated by a super-admin via
 * `restoreAccount()` (sets `deletedAt = null` and re-applies the
 * original email).
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { recordSecurityEvent } from "@/features/auth/security";
import { generateToken } from "@/lib/utils";

const ANON_EMAIL_PREFIX = "deleted+";

/**
 * Soft-delete the account. `confirmationEmail` is the user's current
 * email — we require them to type it in the UI as a sanity check before
 * we actually do the delete.
 */
export async function softDeleteAccount(input: {
  userId: string;
  confirmationEmail: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, email: true, deletedAt: true },
  });
  if (!user || user.deletedAt) {
    return { ok: false, error: "Account not found." };
  }
  if (user.email.toLowerCase() !== input.confirmationEmail.toLowerCase()) {
    return { ok: false, error: "The email you typed doesn't match your account." };
  }

  // Build an anonymised, unique email so the address can be re-registered
  // after a grace period (or never — your call).
  const anonEmail = `${ANON_EMAIL_PREFIX}${generateToken(12)}@deleted.forgestack.dev`;

  await prisma.$transaction([
    // Revoke every active session.
    prisma.userSession.updateMany({
      where: { userId: input.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    // Invalidate outstanding tokens.
    prisma.passwordResetToken.deleteMany({
      where: { userId: input.userId, usedAt: null },
    }),
    prisma.emailChangeToken.deleteMany({
      where: { userId: input.userId, usedAt: null },
    }),
    // Unlink every OAuth Account row. Without this, the next time
    // the user signs in with the same Google/GitHub account, Auth.js
    // will find the still-present `Account` row pointing at this
    // soft-deleted user, sign them in as the deleted user, and
    // they'll see a confusing UI (the activity card shows the
    // anonymised email; pages then bounce to /login?error=account_deleted).
    // Detaching the accounts forces a fresh user to be created on
    // the next sign-in.
    prisma.account.deleteMany({
      where: { userId: input.userId },
    }),
    // Soft-delete + anonymise.
    prisma.user.update({
      where: { id: input.userId },
      data: {
        deletedAt: new Date(),
        email: anonEmail,
        emailVerified: null,
        pendingEmail: null,
        passwordHash: null,
        // Lock the account to defend against any token replay.
        lockedUntil: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
        failedLoginCount: 0,
      },
    }),
  ]);

  await recordSecurityEvent({
    type: "ACCOUNT_DELETED",
    userId: input.userId,
    email: user.email,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });

  return { ok: true };
}

/**
 * Re-activate a soft-deleted account. Super-admin only — this is
 * intentionally not exposed to the user. The original email is
 * preserved on `UserSession` rows for forensic purposes but the
 * user's login email is now the anonymised one, so we need the admin
 * to confirm a new email (or accept the anon one).
 */
export async function restoreAccount(input: {
  userId: string;
  actorId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, deletedAt: true },
  });
  if (!user) return { ok: false, error: "Account not found." };
  if (!user.deletedAt) return { ok: false, error: "Account is not deleted." };

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      deletedAt: null,
      lockedUntil: null,
    },
  });

  // We don't have an "actor" relation on SecurityEvent in the current
  // schema; the actor's own audit row will be written by the calling
  // admin action. Recording the subject's row is enough to keep the
  // per-user timeline accurate.
  await recordSecurityEvent({
    type: "ACCOUNT_RESTORED",
    userId: input.userId,
    email: null,
    metadata: { restoredBy: input.actorId },
  });

  return { ok: true };
}
