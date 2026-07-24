# Norcel — Code Showcase

Small, curated snippets from the codebase. Each one highlights a specific
design decision that's worth a closer look.

---

## 1. JWT rotation in the `jwt` callback

The Auth.js `jwt` callback runs on every request that touches a session.
We use it to validate the session, refresh the role, and rotate the
cookie when it's more than half-way through its TTL — so the user's
session extends smoothly without a re-auth.

```ts
// lib/auth.ts — the rotation step
const iatMs = (token.iat ?? 0) * 1000;
const ttlMs = token.rememberMe
  ? REMEMBER_ME_SESSION_MS
  : DEFAULT_SESSION_MS;
if (iatMs && shouldRotateJwt(iatMs, ttlMs)) {
  // Bump iat so the cookie TTL is effectively extended.
  token.iat = Math.floor(Date.now() / 1000);
}
```

```ts
// features/auth/sessions.ts — the rotation predicate
export const JWT_REFRESH_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours

export function shouldRotateJwt(
  issuedAtMs: number,
  ttlMs: number
): boolean {
  return Date.now() - issuedAtMs > ttlMs - JWT_REFRESH_THRESHOLD_MS;
}
```

A user who stays active gets a continuously-extending session; a user
who walks away for longer than the TTL is forced back through `/login`.

---

## 2. Revocable server-side sessions on top of JWT

Auth.js's JWT strategy stores everything in the cookie. We add a
parallel `UserSession` table so the user can see and revoke their
active sessions from `/settings/sessions`. The "is this session still
valid?" check runs on every request.

```ts
// features/auth/sessions.ts
export async function touchUserSession(
  sessionId: string | undefined
): Promise<{ userId: string } | null> {
  if (!sessionId) return null;
  const row = await prisma.userSession.findUnique({
    where: { sessionId },
  });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt < new Date()) return null;

  await prisma.userSession.update({
    where: { sessionId },
    data: { lastSeenAt: new Date() },
  });

  return { userId: row.userId };
}
```

```ts
// lib/auth.ts — called from the `jwt` callback
if (token.sessionId) {
  const valid = await touchUserSession(token.sessionId);
  if (!valid) {
    // Session revoked or expired — return an empty token so the
    // user is forced through /login.
    return {} as typeof token;
  }
}
```

Revocations propagate immediately — no waiting for the cookie to
expire.

---

## 3. Edge-safe Auth.js split

Next.js middleware runs in the edge runtime, which doesn't have
`node:crypto` or Prisma. We keep one slim, edge-safe config for
middleware and a fuller one (with Prisma + argon2 + providers) for
server components and route handlers.

```ts
// lib/auth.config.ts — edge-safe, no providers, no adapter
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") session.user.id = token.id;
        if (
          token.role === "USER" ||
          token.role === "ADMIN" ||
          token.role === "SUPER_ADMIN"
        ) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
};
```

```ts
// lib/auth.ts — Node-only, composes on top
const config: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers, // Credentials + Google + GitHub
  callbacks: { ...authConfig.callbacks, jwt, signIn, session },
  events: { signIn, signOut },
};
```

The edge bundle stays small, and we never accidentally import
`argon2` into a place that can't run it.

---

## 4. Argon2id with lazy module loading

Passwords are hashed with argon2id (memory-hard, OWASP-recommended).
The native module is loaded lazily so client bundles never include it
and so cold-start cost is paid only on the first hash.

```ts
// features/auth/password.ts
let argon2Promise: Promise<Argon2Module> | null = null;

async function getArgon2(): Promise<Argon2Module> {
  if (!argon2Promise) {
    argon2Promise = import("argon2");
  }
  return argon2Promise;
}

const HASH_OPTIONS = {
  type: 2 as const,        // argon2id
  memoryCost: 19_456,      // 19 MB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  const argon2 = await getArgon2();
  return argon2.hash(plain, HASH_OPTIONS);
}
```

`needsRehash()` runs on every successful login so we can roll the
algorithm parameters up over time without forcing a password reset.

---

## 5. Typed, fail-fast environment configuration

Every module reads env via a single, Zod-validated object. Required
values throw on boot — half-configured apps in production are worse
than apps that refuse to start.

```ts
// lib/env.ts
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters."),
  EMAIL_PROVIDER: z.enum(["console", "resend", "smtp", "memory"]).default("console"),
  // ...
});

function parseServer() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const serverEnv = (() => {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv must not be imported in the browser");
  }
  return parseServer();
})();

export const clientEnv = parseClient();
```

The `typeof window` guard means a stray client-side import fails
loudly at build time instead of leaking the server schema into the
browser bundle.
