/**
 * Test setup. Runs before every test file.
 *
 * - Forces `EMAIL_PROVIDER=memory` so the email service records to an
 *   in-process inbox instead of hitting Resend.
 * - Forces `AUTH_SECRET` to a deterministic test value.
 * - Vitest auto-sets `NODE_ENV=test`.
 *
 * The test database is `process.env.DATABASE_URL_TEST` — falls back
 * to the dev DB if not set, with a warning.
 */
process.env.EMAIL_PROVIDER = "memory";
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? "test-secret-do-not-use-in-prod-32bytes";
if (!process.env.DATABASE_URL_TEST) {
  console.warn(
    "[vitest] DATABASE_URL_TEST is not set. Falling back to DATABASE_URL. " +
      "This will run tests against your dev database. " +
      "Set DATABASE_URL_TEST=postgresql://...norcel_test for isolation."
  );
  process.env.DATABASE_URL_TEST = process.env.DATABASE_URL ?? "";
}

// Defensive: clean up rows from any prior test runs that crashed
// mid-cleanup. Runs once per test session. Email-prefix-based, so
// it never touches production-looking data.
import { globalTestCleanup } from "./_setupDb";
globalTestCleanup().catch((e: unknown) =>
  console.warn("[vitest] globalTestCleanup failed:", e)
);
