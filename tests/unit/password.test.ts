/**
 * Password hashing tests. argon2id round-trip + verify timing.
 */
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/features/auth/password";

describe("hashPassword + verifyPassword", () => {
  it("produces a hash that verifies the same password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple-1!");
    expect(await verifyPassword(hash, "correct-horse-battery-staple-1!")).toBe(
      true
    );
  });

  it("rejects a different password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple-1!");
    expect(await verifyPassword(hash, "wrong")).toBe(false);
  });

  it("produces a hash with the argon2id prefix", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("handles long passwords", async () => {
    const long = "a".repeat(100) + "1!";
    const hash = await hashPassword(long);
    expect(await verifyPassword(hash, long)).toBe(true);
  });
});
