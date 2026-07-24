/**
 * Norcel — Password service.
 *
 * Hash + verify with argon2id (memory-hard, OWASP-recommended).
 * Tuned for ~50–80ms per hash on a modern x86 server; raise `memoryCost`
 * if you have more headroom.
 *
 * Argon2 is loaded lazily so client bundles never include the native module.
 */
import "server-only";

type Argon2Module = typeof import("argon2");

let argon2Promise: Promise<Argon2Module> | null = null;

async function getArgon2(): Promise<Argon2Module> {
  if (!argon2Promise) {
    argon2Promise = import("argon2");
  }
  return argon2Promise;
}

const HASH_OPTIONS = {
  type: 2 as const, // argon2id
  memoryCost: 19_456, // 19 MB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  const argon2 = await getArgon2();
  return argon2.hash(plain, HASH_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  plain: string
): Promise<boolean> {
  try {
    const argon2 = await getArgon2();
    return await argon2.verify(hash, plain);
  } catch {
    // Malformed hash, library error, etc. Treat as a failed verification
    // without leaking the cause to the caller.
    return false;
  }
}

/**
 * Returns true if the provided plain-text password needs to be rehashed
 * (parameters have changed since the hash was issued). Run this on every
 * successful login to support rolling algorithm upgrades.
 */
export async function needsRehash(hash: string): Promise<boolean> {
  const argon2 = await getArgon2();
  return argon2.needsRehash(hash, HASH_OPTIONS);
}
