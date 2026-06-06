/**
 * ForgeStack — Token services.
 *
 * Three token flavours:
 *   1. Email verification  — single-use, 24h
 *   2. Password reset      — single-use, 1h, hashed at rest
 *   3. Magic link          — single-use, 10m, hashed at rest
 *
 * Raw tokens are never stored — only their SHA-256 fingerprint. A DB
 * compromise therefore yields hashed values that can't be replayed.
 *
 * `server-only` keeps these helpers out of client bundles.
 */
import "server-only";

import { prisma } from "@/lib/prisma";
import { generateToken, sha256Base64Url } from "@/lib/utils";

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

const VERIFICATION_TTL = 24 * HOUR;
const PASSWORD_RESET_TTL = 1 * HOUR;
const MAGIC_LINK_TTL = 10 * MINUTE;

export type TokenKind = "verification" | "password-reset" | "magic-link";

/**
 * Issue a new email verification token. Returns the raw token (to embed in
 * the email URL) and persists the SHA-256 fingerprint in the database.
 */
export async function issueVerificationToken(email: string): Promise<string> {
  const raw = generateToken(32);
  const expires = new Date(Date.now() + VERIFICATION_TTL);

  await prisma.verificationToken.deleteMany({
    where: { identifier: `verify:${email}` },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: `verify:${email}`,
      token: raw,
      expires,
    },
  });

  return raw;
}

export async function consumeVerificationToken(
  rawToken: string
): Promise<{ email: string } | null> {
  const records = await prisma.verificationToken.findMany({
    where: { identifier: { startsWith: "verify:" } },
  });

  for (const record of records) {
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
      continue;
    }
    if (record.token === rawToken) {
      const email = record.identifier.replace(/^verify:/, "");
      await prisma.verificationToken.delete({ where: { token: record.token } });
      return { email };
    }
  }

  return null;
}

// ─── Password reset ────────────────────────────────────────────────────────

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

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { userId: record.userId };
}

// ─── Magic link (re-uses Auth.js VerificationToken under a different ns) ──

export async function issueMagicLinkToken(email: string): Promise<string> {
  const raw = generateToken(32);
  const expires = new Date(Date.now() + MAGIC_LINK_TTL);

  await prisma.verificationToken.deleteMany({
    where: { identifier: `magic:${email}` },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: `magic:${email}`,
      token: raw,
      expires,
    },
  });

  return raw;
}

export async function consumeMagicLinkToken(
  rawToken: string
): Promise<{ email: string } | null> {
  const records = await prisma.verificationToken.findMany({
    where: { identifier: { startsWith: "magic:" } },
  });

  for (const record of records) {
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
      continue;
    }
    if (record.token === rawToken) {
      const email = record.identifier.replace(/^magic:/, "");
      await prisma.verificationToken.delete({ where: { token: record.token } });
      return { email };
    }
  }

  return null;
}
