/**
 * Test database utilities.
 *
 * We use the dev database (DATABASE_URL) for tests. Each test should:
 *  1. Generate a unique ID via `uniqueId("test-name")`.
 *  2. Use that ID as the email prefix for any User it creates
 *     (e.g. `uniqueId("tokens") + "@example.com"`).
 *  3. Call `cleanupTest()` in afterEach to delete those rows.
 *
 * This is a simple v1.0 pattern. For production-grade test isolation,
 * use a separate Supabase schema (see `prisma:test:migrate` script
 * in package.json).
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

let _prisma: PrismaClient | null = null;

export function testPrisma(): PrismaClient {
  if (_prisma) return _prisma;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
  _prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
  return _prisma;
}

export async function disconnectTestDb(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}

/** Per-test ID prefix so we can clean up only our rows. */
export function uniqueId(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}

/**
 * Best-effort cleanup. Tests should set their rows' emails / IDs
 * to start with the test ID so this can find them.
 */
export async function cleanupTest(testId: string): Promise<void> {
  const p = testPrisma();
  // Find all users created with this test ID, then cascade delete
  // their dependents.
  const users = await p.user.findMany({
    where: {
      OR: [
        { email: { startsWith: `${testId}@` } },
        { email: { contains: testId } },
      ],
    },
    select: { id: true },
  });
  for (const u of users) {
    await p.userSession.deleteMany({ where: { userId: u.id } });
    await p.loginAttempt.deleteMany({ where: { userId: u.id } });
    await p.securityEvent.deleteMany({ where: { userId: u.id } });
    await p.passwordResetToken.deleteMany({ where: { userId: u.id } });
    await p.emailVerificationToken.deleteMany({ where: { userId: u.id } });
    await p.magicLinkToken.deleteMany({ where: { userId: u.id } });
    await p.emailChangeToken.deleteMany({ where: { userId: u.id } });
    await p.account.deleteMany({ where: { userId: u.id } });
    await p.user.delete({ where: { id: u.id } });
  }
  // Delete LoginAttempts that match the test ID by IP.
  await p.loginAttempt.deleteMany({
    where: { ip: { contains: testId } },
  });
  // Delete standalone SecurityEvents that don't reference a user.
  await p.securityEvent.deleteMany({
    where: { email: { contains: testId } },
  });
  // Roles created by tests have ids prefixed with the test ID.
  await p.role.deleteMany({
    where: { id: { startsWith: testId } },
  });
}
