/**
 * Norcel — Magic-link callback.
 *
 * Bridges the email-template-generated magic link to an Auth.js session.
 * Flow:
 *   1. User clicks `?token=...` link in the magic-link email.
 *   2. We consume the token (single-use, 10-minute TTL, SHA-256-fingerprinted).
 *   3. We look up the user (rejecting soft-deleted / locked).
 *   4. We mint a JWE session token and set the `authjs.session-token`
 *      cookie directly. No more "drop a VerificationToken and let
 *      Auth.js's email provider auto-create a user" anti-pattern.
 *
 * Why not Auth.js's Nodemailer provider? Its `getUserByEmail(identifier)`
 * call would (a) fail to find the user when we use a synthetic
 * `magic-claim:` identifier, (b) auto-create a brand-new user with that
 * identifier as the email — see `@auth/core/lib/actions/callback/index.js:156-159`.
 * That is a real account-takeover vector. We sidestep the whole path.
 */
import { NextResponse, type NextRequest } from "next/server";
import { encode } from "@auth/core/jwt";

import { consumeMagicLinkToken } from "@/features/auth/tokens";
import { prisma } from "@/lib/prisma";
import { recordSecurityEvent } from "@/features/auth/security";
import { startUserSession } from "@/features/auth/sessions";
import { serverEnv } from "@/lib/env";

const SESSION_COOKIE = "authjs.session-token";
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 1 day

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const result = await consumeMagicLinkToken(token);
  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  // Token is already a unique lookup; we just need to verify the user
  // is still active.
  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, email: true, deletedAt: true, lockedUntil: true },
  });
  if (!user || user.deletedAt) {
    return NextResponse.redirect(new URL("/login?error=notfound", request.url));
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.redirect(new URL("/login?error=locked", request.url));
  }

  // Mint a server-side UserSession row (mirrored from the JWT).
  const ua = request.headers.get("user-agent") ?? null;
  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader?.split(",")[0]?.trim() ?? null;
  const { sessionId } = await startUserSession({
    userId: user.id,
    rememberMe: false,
    userAgent: ua,
    ip,
  });

  // Build a JWE that Auth.js will accept as a session cookie. The
  // shape mirrors what `lib/auth.ts`'s `jwt` callback writes on a real
  // sign-in.
  const jwt = await encode({
    token: {
      id: user.id,
      email: user.email,
      name: null,
      image: null,
      role: "USER", // role gets re-read by the jwt callback on the next request
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
      rememberMe: false,
    },
    secret: serverEnv.AUTH_SECRET,
    salt: SESSION_COOKIE,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  await recordSecurityEvent({
    type: "MAGIC_LINK_CONSUMED",
    userId: user.id,
    email: user.email,
    ip,
    userAgent: ua,
  });

  // Set the cookie and redirect to the destination.
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set({
    name: SESSION_COOKIE,
    value: jwt,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
