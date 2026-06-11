/**
 * Utility tests — constantTimeEqual, generateToken, sha256Base64Url.
 */
import { describe, it, expect } from "vitest";
import { constantTimeEqual, generateToken, sha256Base64Url } from "@/lib/utils";

describe("constantTimeEqual", () => {
  it("returns true for equal strings", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
  });

  it("returns false for different strings", () => {
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });

  it("returns false for different-length strings", () => {
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(constantTimeEqual("", "")).toBe(true);
  });
});

describe("generateToken", () => {
  it("produces a base64url string", () => {
    const t = generateToken(32);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(t.length).toBeGreaterThan(40);
  });

  it("produces different values on each call", () => {
    const a = generateToken(32);
    const b = generateToken(32);
    expect(a).not.toBe(b);
  });
});

describe("sha256Base64Url", () => {
  it("hashes a string to a stable digest", async () => {
    const h1 = await sha256Base64Url("hello");
    const h2 = await sha256Base64Url("hello");
    expect(h1).toBe(h2);
  });

  it("produces different digests for different inputs", async () => {
    const h1 = await sha256Base64Url("hello");
    const h2 = await sha256Base64Url("world");
    expect(h1).not.toBe(h2);
  });
});
