/**
 * ForgeStack — Magic-link callback.
 *
 * Bridges the email-template-generated magic link to an Auth.js session.
 * Flow:
 *   1. User clicks `?token=...` link in the magic-link email.
 *   2. We consume the token (single-use, 10-minute TTL).
 *   3. We mint a one-time "magic" session token, write it to the
 *      `VerificationToken` table under a marker identifier, and then
 *      redirect to Auth.js's own verify-request endpoint which
 *      exchanges it for a real session cookie.
 *   4. Browser lands on /dashboard.
 */
import { NextResponse, type NextRequest } from "next/server";
import { consumeMagicLinkToken } from "@/features/auth/tokens";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/utils";
import { recordSecurityEvent } from "@/features/auth/security";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const result = await consumeMagicLinkToken(token);
  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email: result.email },
    select: { id: true, deletedAt: true, lockedUntil: true },
  });
  if (!user || user.deletedAt) {
    return NextResponse.redirect(new URL("/login?error=notfound", request.url));
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.redirect(new URL("/login?error=locked", request.url));
  }

  // Drop a one-shot VerificationToken that Auth.js's email provider can
  // exchange for a real session. The token value is the "magic" we
  // constructed from the URL token + a fresh nonce.
  const oneTimeToken = generateToken(32);
  const expires = new Date(Date.now() + 60 * 1000); // 1 minute
  await prisma.verificationToken.create({
    data: {
      identifier: `magic-claim:${user.id}`,
      token: oneTimeToken,
      expires,
    },
  });

  // Build a callback URL that Auth.js's email provider will accept.
  // (The `token` query param is what Auth.js looks for.)
  const verifyUrl = new URL("/api/auth/callback/email", request.url);
  verifyUrl.searchParams.set("token", oneTimeToken);
  verifyUrl.searchParams.set("email", `magic-claim:${user.id}`);

  await recordSecurityEvent({
    type: "MAGIC_LINK_CONSUMED",
    userId: user.id,
    email: result.email,
  });

  return NextResponse.redirect(verifyUrl);
}
