/**
 * ForgeStack — Edge-safe Auth.js config.
 *
 * This file is imported by `middleware.ts`, which runs in Next.js's edge
 * runtime. It MUST NOT pull in anything Node-only (Prisma, argon2, the
 * Nodemailer transport, Resend, etc.) — the edge bundler doesn't have
 * `node:crypto` and will fail to build.
 *
 * The pattern: keep providers + adapters in `lib/auth.ts`. This file holds
 * only what's needed to *decode* the existing session JWT and decide
 * whether a request should pass through middleware. The full
 * authorization decision (role check, DB lookup) happens in the
 * `lib/auth-guards.ts` server guards, which run in the Node runtime.
 */
import type { NextAuthConfig } from "next-auth";

/**
 * Minimal session shape — just what the middleware needs to make a
 * routing decision. The JWT we issue carries `{ id, role }` (see
 * `lib/auth.ts`); this type mirrors that.
 */
export type EdgeSession = {
  user?: { id?: string; role?: "USER" | "ADMIN" };
};

export const authConfig: NextAuthConfig = {
  // No providers / no adapter here — those are Node-only and live in
  // `lib/auth.ts`. Middleware only needs to *decode* an existing JWT,
  // which works with the secret alone.
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/magic-link?sent=1",
    newUser: "/dashboard",
  },
  trustHost: true,

  callbacks: {
    // Authorize runs in middleware (edge). Only allow public routes
    // through; everything else needs a session. We keep the decision
    // narrow here so the edge bundle stays tiny.
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      const session = auth as EdgeSession | null;

      const PUBLIC = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/magic-link",
        "/api/auth",
      ];

      if (PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return session?.user?.role === "ADMIN";
      }

      return Boolean(session?.user?.id);
    },
  },
};
