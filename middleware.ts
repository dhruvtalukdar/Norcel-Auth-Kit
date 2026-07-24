/**
 * Norcel — Edge middleware.
 *
 * Runs in the Next.js edge runtime (no Node APIs, no Prisma). It uses
 * Auth.js's edge-safe `NextAuth()` wrapper — initialised with the
 * minimal config from `lib/auth.config.ts` — to attach a session to
 * every request and short-circuit unauthorised traffic before it hits
 * the page.
 *
 * Three layers of enforcement:
 *
 *   1. `authConfig.callbacks.authorized` (in `lib/auth.config.ts`)
 *      decides whether the path is public or requires a session.
 *   2. THIS callback below makes the routing decision for matched
 *      paths — redirecting unauthenticated users to /login and
 *      non-admins away from /admin/*.
 *   3. Each protected page also calls `requireAuth()` /
 *      `requireAdmin()` (in `lib/auth-guards.ts`, Node runtime) which
 *      re-reads the user record so soft-deletes, lockouts, and
 *      revoked sessions propagate without a sign-out.
 */
import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import { authConfig, type EdgeSession } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/admin"];
const ADMIN_PREFIXES = ["/admin"];

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
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Clear the stale `authjs.session-token` cookie. Auth.js's `jwt`
    // callback returns an empty token when the session is gone, but
    // it can't clear the cookie itself (the `jwt` callback doesn't
    // get a response object). We do it here on the redirect so
    // the browser stops sending a dead cookie on every request.
    redirectResponse.cookies.set({
      name: "authjs.session-token",
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return redirectResponse;
  }

  // /admin role gating — fast-fail at the edge so non-admins don't
  // even render the admin layout. The page-level `requireAdmin()` is
  // a belt-and-braces second check.
  const isAdminRoute = ADMIN_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
  if (isAdminRoute && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    const dashUrl = new URL("/dashboard", nextUrl);
    dashUrl.searchParams.set("denied", "admin");
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
};
