/**
 * Norcel — `cn` utility (shadcn convention).
 *
 * Merges Tailwind class strings with conditional classnames.
 * Uses `clsx` for the conditional part and `tailwind-merge` to deduplicate
 * conflicting Tailwind utilities (e.g. `px-2 px-4` → `px-4`).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sleep helper — used in tests and rate-limit backoff logic.
 */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Returns a URL-safe base64-encoded string of random bytes.
 * Used for session / verification / password-reset token generation.
 */
export function generateToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr);
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Constant-time string comparison — protects against timing attacks on
 * token validation (magic link, password reset, email verification).
 *
 * Strings of different lengths are padded to the longer one so the runtime
 * does not leak the length via early-return.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Pad the shorter one with a constant so we always loop max(a,b) times.
    const longer = a.length > b.length ? a : b.padEnd(a.length, "\0");
    const shorter = a.length > b.length ? b.padEnd(a.length, "\0") : a;
    let result = longer.length ^ shorter.length;
    for (let i = 0; i < longer.length; i++) {
      result |= longer.charCodeAt(i) ^ shorter.charCodeAt(i);
    }
    return result === 0;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * SHA-256 → base64url. Used to fingerprint reset tokens before persisting,
 * so a DB read does not leak raw tokens.
 */
export async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashBytes = new Uint8Array(hashBuffer);
  return base64UrlEncode(hashBytes)
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Truncates an email to a safe "first char + *** + domain" form for the UI
 * (e.g. used in "we sent a link to j***@gmail.com" hints).
 * Protects against user enumeration when a generic copy needs to be shown.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const first = local[0];
  return `${first}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}
