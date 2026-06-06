/**
 * ForgeStack — Magic-link callback.
 *
 * Bridges the email-template-generated magic link to an Auth.js session.
 * Flow:
 *   1. User clicks `?token=...` link in the magic-link email
 *   2. We consume the token (single-use, 10-minute TTL)
 *   3. We sign the user in via the credentials provider with a one-time token
 *   4. Redirect to /dashboard
 */
import { NextResponse, type NextRequest } from "next/server";
import { signIn } from "@/lib/auth";
import { consumeMagicLink } from "@/features/auth/tokens";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  const result = await consumeMagicLink(token);
  if (!result) {
    return NextResponse.redirect(new URL("/login?error=expired", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email: result.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=notfound", request.url));
  }

  // Sign the user in via a one-shot token: encode the user id as the
  // "password" and let the credentials provider verify.
  // To avoid a custom provider we instead use Auth.js's email provider.
  await signIn("email", {
    email: result.email,
    redirect: false,
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
