/**
 * Norcel — Auth service.
 *
 * The "domain" layer. UI components and route handlers should never touch
 * Prisma directly for auth flows — they call these functions instead.
 *
 * Responsibilities:
 *   - User CRUD around authentication events
 *   - Default RBAC role assignment
 *   - lastLoginAt bookkeeping
 *
 * No HTTP / no cookies / no React. Pure server functions.
 */
import "server-only";

import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/features/auth/password";
import {
  consumeMagicLinkToken,
  consumePasswordResetToken,
  consumeVerificationToken,
  issueMagicLinkToken,
  issuePasswordResetToken,
  issueVerificationToken,
} from "@/features/auth/tokens";
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/lib/email";

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getDefaultRoleId(): Promise<string> {
  const role = await prisma.role.findUnique({ where: { name: UserRole.USER } });
  if (!role) {
    throw new Error(
      'Default "USER" role is missing. Run `npm run prisma:seed` to create it.'
    );
  }
  return role.id;
}

async function buildVerificationUrl(rawToken: string): Promise<string> {
  const { clientEnv } = await import("@/lib/env");
  const url = new URL("/verify-email", clientEnv.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

async function buildPasswordResetUrl(rawToken: string): Promise<string> {
  const { clientEnv } = await import("@/lib/env");
  const url = new URL("/reset-password", clientEnv.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

async function buildMagicLinkUrl(rawToken: string): Promise<string> {
  const { clientEnv } = await import("@/lib/env");
  const url = new URL("/api/auth/magic/callback", clientEnv.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

async function buildDashboardUrl(): Promise<string> {
  const { clientEnv } = await import("@/lib/env");
  return new URL("/dashboard", clientEnv.NEXT_PUBLIC_APP_URL).toString();
}

// ─── Sign up ───────────────────────────────────────────────────────────────

export type SignUpResult =
  | { ok: true; user: Pick<User, "id" | "email" | "name"> }
  | { ok: false; error: string };

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<SignUpResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    // Don't disclose that the email is taken — return a generic success.
    // The caller is responsible for not exposing account existence.
    return { ok: false, error: "An account with this email already exists." };
  }

  const roleId = await getDefaultRoleId();
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      roleId,
    },
    select: { id: true, email: true, name: true },
  });

  // Record a LoginAttempt with status=SUCCESS so the per-IP rate
  // limiter (which counts every attempt, not just failures) sees
  // the signup. This caps an attacker's effective sign-up rate at
  // MAX_FAILS_PER_IP / FAIL_WINDOW_MS.
  if (input.ip) {
    await prisma.loginAttempt.create({
      data: {
        email: user.email,
        userId: user.id,
        status: "SUCCESS",
        ip: input.ip,
        userAgent: input.userAgent ?? null,
      },
    });
  }

  // Issue verification token + email.
  const token = await issueVerificationToken(user.id);
  const url = await buildVerificationUrl(token);
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    url,
  });

  // Send the welcome email. We don't await it — if the welcome fails
  // the verification email is still queued and the user can sign in.
  // Best-effort, fire-and-forget.
  const dashboardUrl = await buildDashboardUrl();
  void sendWelcomeEmail({
    to: user.email,
    name: user.name,
    dashboardUrl,
  }).catch(() => {
    // Swallow — already logged in sendEmail()
  });

  return { ok: true, user };
}

// ─── Sign in ───────────────────────────────────────────────────────────────

export type SignInResult =
  | { ok: true; user: Pick<User, "id" | "email" | "name"> }
  | { ok: false; error: string };

export async function signInWithPassword(input: {
  email: string;
  password: string;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<SignInResult> {
  // 1. Pre-check: rate-limit + lockout. We do this *before* touching
  //    the user record so an attacker hammering a locked account
  //    doesn't cause extra DB reads.
  const { checkLoginAllowed, recordLoginAttempt, recordSecurityEvent } =
    await import("@/features/auth/security");
  const guard = await checkLoginAllowed(input.email, input.ip ?? null);
  if (!guard.allowed) {
    if (guard.reason === "locked") {
      const until = guard.until.toISOString();
      return {
        ok: false,
        error: `Account locked. Try again after ${new Date(until).toLocaleString()}.`,
      };
    }
    return {
      ok: false,
      error: "Too many failed attempts. Please try again later.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      deletedAt: true,
      lockedUntil: true,
    },
  });

  // Run verify() unconditionally so we don't leak account existence via timing.
  const dummyHash =
    "$argon2id$v=19$m=19456,t=2,p=1$ZHVtbXlzYWx0ZHVtbXlzYWx0$Q/oEuqUcQTU5pJbK1q1oRg5pXwLN4F1qCk1g8sJ+m5M";
  const ok = user?.passwordHash
    ? await verifyPassword(user.passwordHash, input.password)
    : (await verifyPassword(dummyHash, input.password), false);

  if (!user || !user.passwordHash || !ok || user.deletedAt) {
    await recordLoginAttempt({
      email: input.email,
      userId: user?.id ?? null,
      status: "FAILURE",
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    });
    await recordSecurityEvent({
      type: "LOGIN_FAILURE",
      userId: user?.id ?? null,
      email: input.email,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    });
    return { ok: false, error: "Invalid email or password." };
  }

  await recordLoginAttempt({
    email: input.email,
    userId: user.id,
    status: "SUCCESS",
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });
  await recordSecurityEvent({
    type: "LOGIN_SUCCESS",
    userId: user.id,
    email: input.email,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });

  return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
}

// ─── Verification ──────────────────────────────────────────────────────────

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

export async function verifyEmailToken(rawToken: string): Promise<VerifyResult> {
  const result = await consumeVerificationToken(rawToken);
  if (!result) {
    return { ok: false, error: "This link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerified: new Date() },
  });

  return { ok: true, email: result.email };
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return;

  const token = await issueVerificationToken(user.id);
  const url = await buildVerificationUrl(token);
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    url,
  });
}

// ─── Password reset ────────────────────────────────────────────────────────

/**
 * Always returns ok=true to prevent user enumeration. If the email is
 * registered, an email is sent. If not, we silently no-op.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  if (!user) return;

  const token = await issuePasswordResetToken(user.id);
  const url = await buildPasswordResetUrl(token);
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    url,
  });
}

export type ResetResult =
  | { ok: true }
  | { ok: false; error: string };

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ResetResult> {
  const consumed = await consumePasswordResetToken(input.token);
  if (!consumed) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(input.password);

  // Atomic: update the password, revoke every other active session,
  // and clear any other outstanding reset tokens. Failure mid-way
  // rolls back the whole reset.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: consumed.userId },
      data: { passwordHash, lastLoginAt: new Date() },
    }),
    prisma.userSession.updateMany({
      where: { userId: consumed.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: consumed.userId, usedAt: null },
    }),
  ]);

  return { ok: true };
}

// ─── Magic link ────────────────────────────────────────────────────────────

export async function requestMagicLink(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, deletedAt: true },
  });
  if (!user || user.deletedAt) return; // silent — anti-enumeration

  const token = await issueMagicLinkToken(user.id);
  const url = await buildMagicLinkUrl(token);
  await sendMagicLinkEmail({
    to: user.email,
    name: user.name,
    url,
  });
}

export async function consumeMagicLink(
  rawToken: string
): Promise<{ email: string } | null> {
  return consumeMagicLinkToken(rawToken);
}

// ─── Account-level helpers ─────────────────────────────────────────────────

export async function changePassword(input: {
  userId: string;
  currentPassword?: string;
  newPassword: string;
  /**
   * The sessionId of the session that initiated this password
   * change. We keep this session alive so the user isn't signed
   * out by their own password change (the JWT callback's
   * `touchUserSession` would see the row revoked and force a
   * re-auth). All OTHER active sessions are revoked. If omitted
   * (e.g. from a server-side admin tool), every session is
   * revoked.
   */
  keepSessionId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { passwordHash: true },
  });
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  // Two paths:
  //   (a) User already has a password (regular sign-up). They must
  //       provide the current password.
  //   (b) User has no password (OAuth-only). They are setting
  //       their first password — no current password required.
  const isSettingFirstPassword = !user.passwordHash;
  if (!isSettingFirstPassword) {
    // `user.passwordHash` is non-null in this branch; assert it for
    // the type-checker (and to keep the runtime narrowing obvious).
    const currentHash = user.passwordHash!;
    if (!input.currentPassword) {
      return { ok: false, error: "Current password is required." };
    }
    const matches = await verifyPassword(currentHash, input.currentPassword);
    if (!matches) {
      return { ok: false, error: "Current password is incorrect." };
    }
  }

  const passwordHash = await hashPassword(input.newPassword);

  // Revoke every active session EXCEPT the one that initiated the
  // change. For OAuth users setting their first password, we don't
  // revoke their OAuth sessions — they're still signed in via
  // Google and revoking would log them out.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { passwordHash },
    }),
    ...(isSettingFirstPassword
      ? []
      : [
          prisma.userSession.updateMany({
            where: {
              userId: input.userId,
              revokedAt: null,
              ...(input.keepSessionId
                ? { sessionId: { not: input.keepSessionId } }
                : {}),
            },
            data: { revokedAt: new Date() },
          }),
        ]),
  ]);

  return { ok: true };
}
