/**
 * Token service tests. Verifies:
 *  - Tokens are issued, stored as SHA-256 fingerprints (never raw)
 *  - consume*() rejects expired, used, and unknown tokens
 *  - Re-issuing for the same user invalidates prior tokens
 */
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import {
  issueMagicLinkToken,
  consumeMagicLinkToken,
  issueVerificationToken,
  consumeVerificationToken,
  issuePasswordResetToken,
  consumePasswordResetToken,
} from "@/features/auth/tokens";
import { testPrisma, cleanupTest, disconnectTestDb, uniqueId } from "../_setupDb";

const p = () => testPrisma();

let testId: string;
let userId: string;
let userEmail: string;

beforeEach(async () => {
  testId = uniqueId("tokens");
  userEmail = `${testId}@example.com`;
  // Create a user with a unique email so cleanup is easy.
  const u = await p().user.create({
    data: {
      email: userEmail,
      passwordHash: "x",
    },
  });
  userId = u.id;
});

afterEach(async () => {
  await cleanupTest(testId);
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("issueMagicLinkToken + consumeMagicLinkToken", () => {
  it("round-trips a valid token", async () => {
    const raw = await issueMagicLinkToken(userId);
    const result = await consumeMagicLinkToken(raw);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(userId);
    expect(result!.email).toBe(userEmail);
  });

  it("stores only the SHA-256 hash, not the raw token", async () => {
    const raw = await issueMagicLinkToken(userId);
    const row = await p().magicLinkToken.findFirst({ where: { userId } });
    expect(row).not.toBeNull();
    expect(row!.tokenHash).not.toContain(raw);
    expect(row!.tokenHash.length).toBeGreaterThanOrEqual(40);
  });

  it("rejects an unknown token", async () => {
    const result = await consumeMagicLinkToken("not-a-real-token");
    expect(result).toBeNull();
  });

  it("rejects an expired token", async () => {
    const raw = await issueMagicLinkToken(userId);
    // Force-expire the row.
    await p().magicLinkToken.updateMany({
      where: { userId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const result = await consumeMagicLinkToken(raw);
    expect(result).toBeNull();
  });

  it("rejects a token that's already been used", async () => {
    const raw = await issueMagicLinkToken(userId);
    const first = await consumeMagicLinkToken(raw);
    expect(first).not.toBeNull();
    const second = await consumeMagicLinkToken(raw);
    expect(second).toBeNull();
  });

  it("invalidates prior tokens when a new one is issued", async () => {
    const first = await issueMagicLinkToken(userId);
    const second = await issueMagicLinkToken(userId);
    expect(await consumeMagicLinkToken(first)).toBeNull();
    expect(await consumeMagicLinkToken(second)).not.toBeNull();
  });
});

describe("issueVerificationToken + consumeVerificationToken", () => {
  it("round-trips a valid token", async () => {
    const raw = await issueVerificationToken(userId);
    const result = await consumeVerificationToken(raw);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(userId);
  });

  it("rejects a token whose stored hash doesn't match the input", async () => {
    const raw = await issueVerificationToken(userId);
    // Tamper with the stored hash.
    await p().emailVerificationToken.updateMany({
      where: { userId },
      data: { tokenHash: "tampered-hash" },
    });
    const result = await consumeVerificationToken(raw);
    expect(result).toBeNull();
  });
});

describe("issuePasswordResetToken + consumePasswordResetToken", () => {
  it("round-trips a valid token", async () => {
    const raw = await issuePasswordResetToken(userId);
    const result = await consumePasswordResetToken(raw);
    expect(result).not.toBeNull();
    expect(result!.userId).toBe(userId);
  });

  it("rejects an unknown token", async () => {
    const result = await consumePasswordResetToken("not-a-real-token");
    expect(result).toBeNull();
  });
});
