/**
 * Regression test for the OAuth + soft-delete bug.
 *
 * Bug: when a user soft-deleted their account, the OAuth `Account`
 * rows were NOT unlinked. When the same Google/GitHub account
 * signed in again, Auth.js's `getUserByAccount` returned the
 * soft-deleted user, signed them in, and they ended up in a
 * confusing state — the JWT said "signed in" but every page
 * bounced them to `/login?error=account_deleted`.
 *
 * Fix: `softDeleteAccount` now deletes the user's `Account` rows
 * in the same transaction. The user's `signIn` callback in
 * `lib/auth.ts` is a belt-and-braces guard that refuses to sign
 * in soft-deleted users via OAuth.
 *
 * This test verifies the new `softDeleteAccount` contract.
 */
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import { softDeleteAccount } from "@/features/auth/account";
import { hashPassword } from "@/features/auth/password";
import { testPrisma, cleanupTest, disconnectTestDb, uniqueId } from "../_setupDb";

const p = () => testPrisma();

let testId: string;
let userId: string;
let userEmail: string;
let roleId: string;

beforeEach(async () => {
  testId = uniqueId("softdel");

  // Reuse the seeded USER role.
  const userRole = await p().role.findFirstOrThrow({
    where: { name: "USER" as never },
  });
  roleId = userRole.id;

  // Create a user with a known password AND a fake Google Account row.
  userEmail = `${testId}@example.com`;
  const u = await p().user.create({
    data: {
      email: userEmail,
      passwordHash: await hashPassword("correct-password-1!"),
      roleId,
    },
  });
  userId = u.id;
  await p().account.create({
    data: {
      userId,
      type: "oauth",
      provider: "google",
      providerAccountId: "google-test-account-12345",
    },
  });
});

afterEach(async () => {
  await cleanupTest(testId);
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("softDeleteAccount — Account-row unlinking", () => {
  it("deletes the user's OAuth Account rows", async () => {
    // Sanity: 1 account before.
    const before = await p().account.count({ where: { userId } });
    expect(before).toBe(1);

    const result = await softDeleteAccount({
      userId,
      confirmationEmail: userEmail,
    });
    expect(result.ok).toBe(true);

    // After: zero accounts.
    const after = await p().account.count({ where: { userId } });
    expect(after).toBe(0);
  });

  it("rejects if the confirmation email doesn't match", async () => {
    const result = await softDeleteAccount({
      userId,
      confirmationEmail: "wrong@example.com",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/match/i);
    }
    // The Account row is still there.
    const after = await p().account.count({ where: { userId } });
    expect(after).toBe(1);
  });

  it("refuses to delete an already-deleted user", async () => {
    await softDeleteAccount({ userId, confirmationEmail: userEmail });
    const result = await softDeleteAccount({
      userId,
      confirmationEmail: userEmail,
    });
    expect(result.ok).toBe(false);
  });

  it("anonymises the email after soft-delete", async () => {
    await softDeleteAccount({ userId, confirmationEmail: userEmail });
    const u = await p().user.findUnique({ where: { id: userId } });
    expect(u!.email.startsWith("deleted+")).toBe(true);
    expect(u!.email.endsWith("@deleted.norcel.dev")).toBe(true);
    expect(u!.deletedAt).not.toBeNull();
  });

  it("revokes all active sessions on soft-delete", async () => {
    const { startUserSession } = await import("@/features/auth/sessions");
    await startUserSession({ userId, rememberMe: false });
    await startUserSession({ userId, rememberMe: false });
    const before = await p().userSession.count({
      where: { userId, revokedAt: null },
    });
    expect(before).toBe(2);

    await softDeleteAccount({ userId, confirmationEmail: userEmail });

    const after = await p().userSession.count({
      where: { userId, revokedAt: null },
    });
    expect(after).toBe(0);
  });
});
