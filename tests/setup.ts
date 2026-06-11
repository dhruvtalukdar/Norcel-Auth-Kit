/**
 * Test setup. Runs before every test file.
 *
 * - Forces `EMAIL_PROVIDER=memory` so the email service records to an
 *   in-process inbox instead of hitting Resend.
 * - Forces `AUTH_SECRET` to a deterministic test value.
 * - Forces `NODE_ENV=test` so `lib/prisma.ts` doesn't try to
 *   `globalThis.prisma`-cache.
 *
 * The test database is `process.env.DATABASE_URL_TEST` — a separate
 * Supabase schema (`forgestack_test`). The integration tests in
 * `tests/integration/` assume a clean schema and truncate before
 * each test run.
 */
// `NODE_ENV` is a read-only property in some Node configs, so we set it
// via the spawned-process env rather than direct assignment. The
// vitest runner can be configured with `mode: "test"` (default) which
// sets NODE_ENV=test automatically.
process.env.EMAIL_PROVIDER = "memory";
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? "test-secret-do-not-use-in-prod-32bytes";
// Test database URL is set by the runner (npm test) — fall back to
// the dev DB only if not set, with a loud warning.
if (!process.env.DATABASE_URL_TEST) {
  console.warn(
    "[vitest] DATABASE_URL_TEST is not set. Falling back to DATABASE_URL. " +
      "This will run tests against your dev database. " +
      "Set DATABASE_URL_TEST=postgresql://...forgestack_test for isolation."
  );
  process.env.DATABASE_URL_TEST = process.env.DATABASE_URL ?? "";
}
