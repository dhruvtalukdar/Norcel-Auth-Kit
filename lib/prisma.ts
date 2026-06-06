/**
 * ForgeStack — Singleton Prisma client.
 *
 * In dev, Next.js HMR re-evaluates modules and would otherwise instantiate
 * a new PrismaClient on every reload — exhausting the connection pool.
 * Cache the client on `globalThis` in non-production environments.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient(): PrismaClient {
  // Fail loudly if the env var is missing — easier to diagnose than a vague
  // "Can't reach database server at `host:5432`" from inside Prisma.
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Check that .env exists at the project root and that the dev server was started AFTER .env was filled in. Restart `npm run dev`."
    );
  }
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
