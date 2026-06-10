/**
 * ForgeStack — Edge-safe Auth.js config.
 *
 * This file is imported by `middleware.ts`, which runs in Next.js's edge
 * runtime. It MUST NOT pull in anything Node-only (Prisma, argon2, the
 * Nodemailer transport, Resend, etc.) — the edge bundler doesn't have
 * `node:crypto` and will fail to build.
 *
 * The pattern: keep providers + adapters + the `jwt` callback (which
 * touches Prisma) in `lib/auth.ts`. This file holds only what's needed
 * to *decode* the existing session JWT and decide whether a request
 * should pass through middleware.
 *
 * Why no role check here: the edge-side Auth.js instance only does a
 * bare JWT decode — it doesn't run the `jwt` callback from
 * `lib/auth.ts` that populates `token.id` / `token.role`. So if the
 * `authorized` callback tries to read `session.user.role` for /admin
 * checks, it always sees `undefined` and bounces the request back to
 * /login, even for valid admin sessions. The /admin authorization
 * decision lives in `lib/auth-guards.ts` (Node runtime) instead, which
 * the page-level `requireAdmin()` calls.
 */
import type { NextAuthConfig } from "next-auth";

export type EdgeSession = {
  user?: { id?: string; role?: "USER" | "ADMIN" | "SUPER_ADMIN" };
};

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/magic-link",
  "/api/auth",
];

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/admin"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export const authConfig: NextAuthConfig = {
  // No providers / no adapter here — those are Node-only and live in
  // `lib/auth.ts`. Middleware only needs to *decode* an existing JWT,
  // which works with the secret alone.
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  // Reading process.env directly here (rather than via the typed
  // `serverEnv` in lib/env.ts) because the edge runtime's module
  // surface is smaller and we want this config to stay slim.
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/magic-link?sent=1",
    newUser: "/dashboard",
  },
  trustHost: true,

  callbacks: {
    /**
     * Propagate `id` and `role` from the raw JWT claims onto the
     * session.user object. The full `lib/auth.ts` config has a richer
     * `jwt` callback that reads the user from Prisma on first sign-in,
     * but that callback only runs in the Node runtime. In the edge
     * runtime we just copy the claims that the Node-side `jwt` callback
     * already wrote into the token when it was minted — this is what
     * lets middleware see `session.user.id` for the path-protection
     * check below.
     */
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
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

    /**
     * Path-only authorization for the edge runtime:
     *   - Public routes pass through.
     *   - Anything else requires a valid (decodable) session token.
     *   - Admin role enforcement happens later, in the Node runtime,
     *     via `requireAdmin()` from `lib/auth-guards.ts`.
     */
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (isPublic(pathname)) return true;
      if (!isProtected(pathname)) return true;
      const session = auth as EdgeSession | null;
      return Boolean(session?.user?.id);
    },
  },
};
