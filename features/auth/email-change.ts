/**
 * Norcel — Email change flow.
 *
 * Two-step verification: the user submits a new email, we send a
 * verification link to that *new* address, and only after the user
 * clicks the link do we promote `pendingEmail` to `email`.
 *
 * Why two steps: just sending the link to the *current* address is
 * meaningless (an attacker who controls the current address already
 * owns the account). Sending the link to the *new* address is the only
 * way to prove the user controls the destination inbox.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/features/auth/email-templates";
import { generateToken, sha256Base64Url, maskEmail } from "@/lib/utils";
import { recordSecurityEvent } from "@/features/auth/security";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Request an email change. Returns the masked new email so the UI can
 * show "we sent a link to j***@newdomain.com" (without revealing the
 * full address to anyone watching the screen).
 */
export async function requestEmailChange(input: {
  userId: string;
  newEmail: string;
}): Promise<{ ok: true; masked: string } | { ok: false; error: string }> {
  const current = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true },
  });
  if (!current) return { ok: false, error: "Account not found." };
  if (current.email.toLowerCase() === input.newEmail.toLowerCase()) {
    return { ok: false, error: "That is already your email." };
  }

  // Make sure no other user (or pending change) is using this address.
  const conflict = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.newEmail }, { pendingEmail: input.newEmail }],
      NOT: { id: input.userId },
      deletedAt: null,
    },
    select: { id: true },
  });
  if (conflict) {
    return { ok: false, error: "That email is already in use." };
  }

  const token = generateToken(32);
  const tokenHash = await sha256Base64Url(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  // Invalidate any existing pending change for this user.
  await prisma.$transaction([
    prisma.emailChangeToken.deleteMany({ where: { userId: input.userId, usedAt: null } }),
    prisma.emailChangeToken.create({
      data: {
        userId: input.userId,
        tokenHash,
        newEmail: input.newEmail,
        expiresAt,
      },
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: { pendingEmail: input.newEmail, pendingEmailExpires: expiresAt },
    }),
  ]);

  // Send the verification email to the *new* address.
  const { clientEnv } = await import("@/lib/env");
  const url = new URL("/api/auth/email-change/callback", clientEnv.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("token", token);
  const tpl = renderEmail("email-change", {
    name: null,
    url: url.toString(),
  });
  await sendEmail({
    to: input.newEmail,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  await recordSecurityEvent({
    type: "EMAIL_CHANGE_REQUESTED",
    userId: input.userId,
    email: current.email,
    metadata: { to: input.newEmail },
  });

  return { ok: true, masked: maskEmail(input.newEmail) };
}

/**
 * Consume an email-change token. Promotes `pendingEmail` to `email`
 * and clears the pending fields.
 */
export async function consumeEmailChangeToken(
  rawToken: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const tokenHash = await sha256Base64Url(rawToken);
  const record = await prisma.emailChangeToken.findUnique({
    where: { tokenHash },
  });
  if (!record) return { ok: false, error: "This link is invalid or has expired." };
  if (record.usedAt) return { ok: false, error: "This link has already been used." };
  if (record.expiresAt < new Date()) {
    return { ok: false, error: "This link has expired." };
  }

  // Final conflict check at consumption time (defends against the
  // "another user took this email during the verification window"
  // race).
  const conflict = await prisma.user.findFirst({
    where: {
      OR: [{ email: record.newEmail }, { pendingEmail: record.newEmail }],
      NOT: { id: record.userId },
      deletedAt: null,
    },
    select: { id: true },
  });
  if (conflict) {
    return { ok: false, error: "That email is already in use." };
  }

  const oldEmail = (
    await prisma.user.findUnique({
      where: { id: record.userId },
      select: { email: true },
    })
  )?.email;

  await prisma.$transaction([
    prisma.emailChangeToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        email: record.newEmail,
        emailVerified: new Date(), // the user proved they own this inbox
        pendingEmail: null,
        pendingEmailExpires: null,
        pendingEmailTokenId: null,
      },
    }),
    // Revoke every other active session. After an email change, an
    // attacker with a stolen cookie is signed in to an account that
    // has a new email; the legitimate user expects their other
    // devices to be signed out.
    prisma.userSession.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await recordSecurityEvent({
    type: "EMAIL_CHANGED",
    userId: record.userId,
    email: record.newEmail,
    metadata: oldEmail ? { from: oldEmail } : null,
  });

  return { ok: true, email: record.newEmail };
}

/** Cancel a pending email change (e.g. user changed their mind). */
export async function cancelEmailChange(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.emailChangeToken.deleteMany({ where: { userId, usedAt: null } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: null,
        pendingEmailExpires: null,
        pendingEmailTokenId: null,
      },
    }),
  ]);
}
