import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { auth } from "@/lib/auth";

export const metadata = { title: "Sign in" };

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  AccessDenied: "You don't have permission to sign in.",
  Verification: "That link is invalid or has expired.",
  invalid: "That sign-in link is invalid.",
  expired: "That sign-in link has expired.",
  notfound: "We couldn't find an account for that link.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string; verified?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { next, error, sent, verified } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? "Something went wrong." : undefined;

  return (
    <AuthShell
      title="Sign in."
      description="Welcome back. Sign in to your ForgeStack account."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}` as Route}
            className="text-ink underline underline-offset-4 hover:text-white"
          >
            Sign up
          </Link>
        </>
      }
    >
      {verified ? (
        <Alert intent="success" className="mb-4">
          Email verified. You can sign in now.
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert intent="error" className="mb-4">
          {errorMessage}
        </Alert>
      ) : null}
      {sent ? (
        <Alert intent="success" className="mb-4">
          Check your email for a sign-in link.
        </Alert>
      ) : null}
      <LoginForm next={next} />
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
        <span className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
          or
        </span>
        <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
      </div>
      <OAuthButtons next={next} />
      <p className="mt-6 text-center text-body-sm text-zinc-400">
        <Link
          href="/forgot-password"
          className="text-ink underline underline-offset-4 hover:text-white"
        >
          Forgot your password?
        </Link>
        {" · "}
        <Link
          href="/magic-link"
          className="text-ink underline underline-offset-4 hover:text-white"
        >
          Email me a link
        </Link>
      </p>
    </AuthShell>
  );
}
