import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config. Tests run in a Node environment so the `server-only`
 * directive and Prisma can be imported freely.
 *
 * Two test layers:
 *   - `tests/unit/` — pure functions (tokens, password, schemas, utils)
 *   - `tests/integration/` — auth service end-to-end (sign-up, sign-in,
 *     rate-limit, soft-delete) against a real Postgres test database.
 *
 * The integration tests require a live database. We point them at a
 * separate Supabase schema (`norcel_test`) and run migrations
 * against it. The `prisma:test:migrate` and `prisma:test:reset` scripts
 * in package.json manage this.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    testTimeout: 15_000,
    hookTimeout: 30_000,
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname),
      // Stub `server-only` in tests. The directive is meant to
      // catch accidental client-side imports; in a Node test env
      // there's no risk, so we just resolve it to an empty module.
      "server-only": resolve(__dirname, "tests/_server-only-stub.ts"),
    },
  },
});
