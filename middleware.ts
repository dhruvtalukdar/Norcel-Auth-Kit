/**
 * ForgeStack — Edge middleware.
 *
 * Runs in the Next.js edge runtime (no Node APIs, no Prisma). It uses
 * Auth.js's edge-safe `NextAuth()` wrapper — initialised with the
 * minimal config from `lib/auth.config.ts` — to attach a session to
 * every request and short-circuit unauthorised traffic before it hits
 * the page.
 *
 * The full RBAC decision still happens server-side in
 * `lib/auth-guards.ts`. Middleware is the fast first line of defence.
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

  // ── Unauthenticated → /login (preserve target via `?next=`)
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("next", `${path}${nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role check: /admin/* requires ADMIN
  const isAdminRoute = ADMIN_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
  if (isAdminRoute && session.user.role !== "ADMIN") {
    const dashUrl = new URL("/dashboard", nextUrl);
    dashUrl.searchParams.set("denied", "admin");
    return NextResponse.redirect(dashUrl);
  }

  return NextResponse.next();
});

// Only run middleware on the protected paths to minimise edge compute.
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"],
};
