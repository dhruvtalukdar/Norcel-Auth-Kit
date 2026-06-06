/**
 * ForgeStack — Edge middleware.
 *
 * Runs in the Next.js edge runtime (no Node APIs, no Prisma). It uses
 * Auth.js's edge-safe `NextAuth()` wrapper — initialised with the
 * minimal config from `lib/auth.config.ts` — to attach a session to
 * every request and short-circuit unauthorised traffic before it hits
 * the page.
 *
 * The full RBAC decision (role-based admin gating, fresh emailVerified
 * check, etc.) still happens server-side in `lib/auth-guards.ts` via
 * `requireAuth()` / `requireAdmin()`. We deliberately do NOT check
 * `role` here because the edge runtime only does a bare JWT decode —
 * it doesn't run the `jwt` callback that populates `token.role`, so
 * the value would always be `undefined` in this context and would
 * bounce valid admins back to /login.
 */
import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import { authConfig, type EdgeSession } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/admin"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = (req as { auth?: EdgeSession | null }).auth;

  const path = nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

  // Unauthenticated → /login (preserve target via `?next=`)
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("next", `${path}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // /admin role gating happens in the page-level `requireAdmin()` guard
  // (Node runtime), where the JWT callback that populates `role` actually
  // runs. We intentionally don't enforce it here.

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
};
