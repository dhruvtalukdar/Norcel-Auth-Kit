/**
 * Norcel — Token services.
 *
 * Three token flavours:
 *   1. Email verification  — single-use, 24h
 *   2. Magic link          — single-use, 10m
 *   3. Password reset      — single-use, 1h
 *   4. Email change        — single-use, 1h
 *
 * All raw tokens are stored only as their SHA-256 fingerprint. A DB
 * compromise therefore yields only hashed values that can't be
 * replayed. The raw token is returned to the caller once at issuance
 * and never persisted.
 *
 * Comparison uses `constantTimeEqual` for defense-in-depth against
 * timing attacks (the DB lookup already returns at most one row, but
 * we don't rely on the lookup alone).
 *
 * `server-only` keeps these helpers out of client bundles.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { generateToken, sha256Base64Url, constantTimeEqual } from "@/lib/utils";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

const VERIFICATION_TTL = 24 * HOUR;
const PASSWORD_RESET_TTL = 1 * HOUR;
const MAGIC_LINK_TTL = 10 * MINUTE;

export type TokenKind =
  | "verification"
  | "password-reset"
  | "magic-link";

// ─── Email verification ───────────────────────────────────────────────────

/**
 * Issue a new email verification token. Returns the raw token (to
 * embed in the email URL) and persists the SHA-256 fingerprint in
 * the database.
 */
export async function issueVerificationToken(
  userId: string
): Promise<string> {
  const raw = generateToken(32);
  const tokenHash = await sha256Base64Url(raw);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL);

  // Invalidate any outstanding tokens for this user.
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return raw;
}

export async function consumeVerificationToken(
  rawToken: string
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = await sha256Base64Url(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, tokenHash: true, expiresAt: true, usedAt: true, user: { select: { email: true } } },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  if (!constantTimeEqual(record.tokenHash, tokenHash)) return null;

  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId, email: record.user.email };
}

// ─── Magic link (passwordless sign-in) ───────────────────────────────────

export async function issueMagicLinkToken(userId: string): Promise<string> {
  const raw = generateToken(32);
  const tokenHash = await sha256Base64Url(raw);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL);

  // Invalidate any outstanding tokens for this user.
  await prisma.magicLinkToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.magicLinkToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return raw;
}

export async function consumeMagicLinkToken(
  rawToken: string
): Promise<{ userId: string; email: string } | null> {
  const tokenHash = await sha256Base64Url(rawToken);
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, tokenHash: true, expiresAt: true, usedAt: true, user: { select: { email: true } } },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  if (!constantTimeEqual(record.tokenHash, tokenHash)) return null;

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId, email: record.user.email };
}

// ─── Password reset ───────────────────────────────────────────────────────

export async function issuePasswordResetToken(userId: string): Promise<string> {
  const raw = generateToken(32);
  const tokenHash = await sha256Base64Url(raw);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL);

  // Invalidate any outstanding reset tokens for this user.
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return raw;
}

export async function consumePasswordResetToken(
  rawToken: string
): Promise<{ userId: string } | null> {
  const tokenHash = await sha256Base64Url(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  if (!constantTimeEqual(record.tokenHash, tokenHash)) return null;

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}

// Note: email-change tokens are issued and consumed by
// `features/auth/email-change.ts`, which has richer logic (it actually
// promotes the pending email to the user record). We don't duplicate
// that here.
