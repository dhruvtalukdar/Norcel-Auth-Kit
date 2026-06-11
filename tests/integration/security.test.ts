/**
 * Security primitives integration tests.
 */
import { describe, it, expect, beforeEach, afterAll, afterEach } from "vitest";
import {
  checkLoginAllowed,
  checkActionRateAllowed,
  recordLoginAttempt,
  recordSecurityEvent,
} from "@/features/auth/security";
import { testPrisma, cleanupTest, disconnectTestDb, uniqueId } from "../_setupDb";

const p = () => testPrisma();

let testId: string;
let userId: string;
let userEmail: string;
let roleId: string;

beforeEach(async () => {
  testId = uniqueId("sec");
  userEmail = `${testId}@example.com`;
  // Reuse the existing USER role (it's seeded and never deleted).
  const userRole = await p().role.findFirstOrThrow({
    where: { name: "USER" as never },
  });
  roleId = userRole.id;
  const u = await p().user.create({
    data: {
      email: userEmail,
      passwordHash: "x",
      roleId,
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

describe("checkLoginAllowed", () => {
  it("allows a non-locked user", async () => {
    const result = await checkLoginAllowed(userEmail, "1.2.3.4");
    expect(result.allowed).toBe(true);
  });

  it("rejects a locked user", async () => {
    await p().user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const result = await checkLoginAllowed(userEmail, "1.2.3.4");
    expect(result.allowed).toBe(false);
    if (!result.allowed && result.reason === "locked") {
      expect(result.until).toBeInstanceOf(Date);
    } else {
      throw new Error("expected reason=locked");
    }
  });

  it("returns allowed for an unknown email (silent anti-enumeration)", async () => {
    const result = await checkLoginAllowed("nobody@example.com", "1.2.3.4");
    expect(result.allowed).toBe(true);
  });
});

describe("recordLoginAttempt + lockout", () => {
  it("locks after 5 failed attempts", async () => {
    for (let i = 0; i < 5; i++) {
      await recordLoginAttempt({
        email: userEmail,
        userId,
        status: "FAILURE",
        ip: `${testId}-1.2.3.4`,
      });
    }
    const u = await p().user.findUnique({ where: { id: userId } });
    expect(u!.lockedUntil).not.toBeNull();
    expect(u!.failedLoginCount).toBe(5);
  });

  it("clears the counter on a successful login", async () => {
    for (let i = 0; i < 3; i++) {
      await recordLoginAttempt({
        email: userEmail,
        userId,
        status: "FAILURE",
        ip: `${testId}-1.2.3.4`,
      });
    }
    await recordLoginAttempt({
      email: userEmail,
      userId,
      status: "SUCCESS",
      ip: `${testId}-1.2.3.4`,
    });
    const u = await p().user.findUnique({ where: { id: userId } });
    expect(u!.failedLoginCount).toBe(0);
    expect(u!.lockedUntil).toBeNull();
  });
});

describe("checkActionRateAllowed", () => {
  it("allows under the cap", async () => {
    const result = await checkActionRateAllowed(`${testId}-1.1.1.1`);
    expect(result.allowed).toBe(true);
  });

  it("rejects when the IP has hit the cap", async () => {
    // Burn the cap with 20 attempts from a unique test IP.
    for (let i = 0; i < 20; i++) {
      await p().loginAttempt.create({
        data: {
          email: "spam@example.com",
          ip: `${testId}-9.9.9.9`,
          status: "FAILURE",
        },
      });
    }
    const result = await checkActionRateAllowed(`${testId}-9.9.9.9`);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("fails open when no IP is available", async () => {
    const result = await checkActionRateAllowed(null);
    expect(result.allowed).toBe(true);
  });
});

describe("recordSecurityEvent", () => {
  it("persists an event with metadata", async () => {
    await recordSecurityEvent({
      type: "LOGIN_SUCCESS",
      userId,
      email: userEmail,
      ip: `${testId}-1.2.3.4`,
      metadata: { foo: "bar" },
    });
    const ev = await p().securityEvent.findFirst({
      where: { userId, type: "LOGIN_SUCCESS" },
    });
    expect(ev).not.toBeNull();
    expect(ev!.email).toBe(userEmail);
  });
});
