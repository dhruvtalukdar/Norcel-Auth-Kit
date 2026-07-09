/**
 * Regression test for the password-change sign-out loop.
 *
 * Bug (v1.0 pre-fix): `changePassword` revoked ALL active sessions
 * for the user, including the one that initiated the change. The
 * JWT's `touchUserSession` callback saw the revoked row and forced
 * a re-auth, which in the dev server (and the production server,
 * for that matter) caused an infinite loop between /dashboard and
 * /login.
 *
 * Fix: `changePassword` now accepts a `keepSessionId` arg and revokes
 * all sessions EXCEPT that one. The test verifies the new contract.
 */
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import { changePassword } from "@/features/auth/service";
import { startUserSession } from "@/features/auth/sessions";
import { testPrisma, cleanupTest, disconnectTestDb, uniqueId } from "../_setupDb";

const p = () => testPrisma();

let testId: string;
let userId: string;
let currentSessionId: string;
let otherSessionId: string;
let other2SessionId: string;
let roleId: string;

beforeEach(async () => {
  testId = uniqueId("chpw");

  // Reuse the seeded USER role.
  const userRole = await p().role.findFirstOrThrow({
    where: { name: "USER" as never },
  });
  roleId = userRole.id;

  // Create the user with a known password hash.
  // We import lazily to avoid pulling argon2 into the test setup.
  const { hashPassword } = await import("@/features/auth/password");
  const u = await p().user.create({
    data: {
      email: `${testId}@example.com`,
      passwordHash: await hashPassword("old-password-1!"),
      roleId,
    },
  });
  userId = u.id;

  // Mint three sessions: one that "initiates" the change, two others.
  const a = await startUserSession({ userId, rememberMe: false });
  const b = await startUserSession({ userId, rememberMe: false });
  const c = await startUserSession({ userId, rememberMe: false });
  currentSessionId = a.sessionId;
  otherSessionId = b.sessionId;
  other2SessionId = c.sessionId;
});

afterEach(async () => {
  await cleanupTest(testId);
});

afterAll(async () => {
  await disconnectTestDb();
});

describe("changePassword — session-revocation regression", () => {
  it("keeps the current session alive and revokes the others", async () => {
    const result = await changePassword({
      userId,
      currentPassword: "old-password-1!",
      newPassword: "new-password-2!",
      keepSessionId: currentSessionId,
    });
    expect(result.ok).toBe(true);

    // Current session is still active.
    const current = await p().userSession.findUnique({
      where: { sessionId: currentSessionId },
    });
    expect(current).not.toBeNull();
    expect(current!.revokedAt).toBeNull();

    // Other sessions are revoked.
    const other = await p().userSession.findUnique({
      where: { sessionId: otherSessionId },
    });
    expect(other!.revokedAt).not.toBeNull();

    const other2 = await p().userSession.findUnique({
      where: { sessionId: other2SessionId },
    });
    expect(other2!.revokedAt).not.toBeNull();
  });

  it("rejects when the current password is wrong", async () => {
    const result = await changePassword({
      userId,
      currentPassword: "wrong",
      newPassword: "new-password-2!",
      keepSessionId: currentSessionId,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/incorrect/i);
    }
  });

  it("rejects when the user has no password set (OAuth-only account)", async () => {
    await p().user.update({
      where: { id: userId },
      data: { passwordHash: null },
    });
    const result = await changePassword({
      userId,
      currentPassword: "anything",
      newPassword: "new-password-2!",
      keepSessionId: currentSessionId,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/no password/i);
    }
  });

  it("with no keepSessionId, revokes everything (admin path)", async () => {
    const result = await changePassword({
      userId,
      currentPassword: "old-password-1!",
      newPassword: "new-password-2!",
    });
    expect(result.ok).toBe(true);

    // All three are revoked.
    for (const sid of [currentSessionId, otherSessionId, other2SessionId]) {
      const row = await p().userSession.findUnique({ where: { sessionId: sid } });
      expect(row!.revokedAt).not.toBeNull();
    }
  });
});
