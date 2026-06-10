/**
 * ForgeStack — Email-change callback.
 *
 * Receives `?token=...` from the email-change email, consumes the
 * token, and redirects the user to /profile with a status flag.
 */
import { NextResponse, type NextRequest } from "next/server";
import { consumeEmailChangeToken } from "@/features/auth/email-change";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/profile?email_change=invalid", request.url));
  }

  const result = await consumeEmailChangeToken(token);
  if (!result.ok) {
    const error = encodeURIComponent(result.error);
    return NextResponse.redirect(
      new URL(`/profile?email_change=error&reason=${error}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/profile?email_change=success", request.url)
  );
}
