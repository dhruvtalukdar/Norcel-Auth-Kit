/**
 * ForgeStack — Singleton Prisma client.
 *
 * In dev, Next.js HMR re-evaluates modules and would otherwise instantiate
 * a new PrismaClient on every reload — exhausting the connection pool.
 * Cache the client on `globalThis` in non-production environments.
 *
 * ── Connection-loss recovery ────────────────────────────────────────────
 *
 * Supabase's transaction pooler (port 6543) aggressively closes idle
 * connections. After a few minutes of dev-server idle, the very next
 * query throws `PrismaClientInitializationError` with `kind: "Closed"`.
 *
 * The naive response is to make every caller handle this — but a much
 * better UX is to transparently re-create the client and retry the
 * failed call once. The Proxy below does exactly that: any model call
 * that throws a `Closed` error triggers a client rebuild and a single
 * retry, after which the error is re-thrown to the caller.
 *
 * This is what stops the auth flow from cascading into an
 * `ErrorBoundary → re-render → ErrorBoundary` loop (which in dev
 * surfaces as Chromium's `history.replaceState` quota exceeded).
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient(): PrismaClient {
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

function isClosedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  // Prisma's error shape uses `kind` (e.g. "Closed", "SocketClosed",
  // "ConnectionError"). Match on any of those, plus the constructor name
  // for safety across Prisma versions.
  const anyErr = err as { kind?: string; name?: string; code?: string };
  if (anyErr.kind === "Closed" || anyErr.kind === "SocketClosed") return true;
  if (
    anyErr.name === "PrismaClientInitializationError" ||
    anyErr.name === "PrismaClientRustPanicError"
  ) {
    return true;
  }
  return false;
}

/**
 * Internal: the live client instance. Replaced on `Closed` errors.
 */
let client: PrismaClient = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = client;
}

/**
 * Try a model call. On a `Closed` error, dispose the client, build a
 * fresh one, and retry the call exactly once. Any other error
 * (including a second `Closed`) is re-thrown.
 */
async function tryWithReconnect<T>(fn: (c: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await fn(client);
  } catch (err) {
    if (!isClosedError(err)) throw err;

    // Tear down the broken client and rebuild.
    try {
      await client.$disconnect();
    } catch {
      // ignore disconnect failures
    }
    client = makeClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }
    // Retry exactly once.
    return await fn(client);
  }
}

/**
 * Build a Proxy that intercepts every model-property access on the
 * Prisma client (e.g. `prisma.user.findUnique(...)`) and wraps it in
 * the reconnect-retry logic above.
 */
function makeResilient(c: PrismaClient): PrismaClient {
  return new Proxy(c, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      // Pass-through for non-model props ($connect, $transaction, $on, etc.).
      if (typeof prop === "string" && prop.startsWith("$")) {
        return value;
      }
      if (typeof value !== "object" || value === null) {
        return value;
      }
      // Wrap every method on the model so any call goes through retry.
      return new Proxy(value, {
        get(modelTarget, modelProp, modelReceiver) {
          const original = Reflect.get(modelTarget, modelProp, modelReceiver);
          if (typeof original !== "function") return original;
          // Some methods are sync (e.g. `new PrismaClient` internals).
          // We only retry on async methods — sync errors bubble up.
          if (original.constructor.name !== "AsyncFunction") return original;
          return (...args: unknown[]) =>
            tryWithReconnect(() =>
              (original as (...a: unknown[]) => Promise<unknown>).apply(
                modelTarget,
                args
              ) as Promise<unknown>
            ) as unknown;
        },
      });
    },
  }) as unknown as PrismaClient;
}

export const prisma = makeResilient(client);
