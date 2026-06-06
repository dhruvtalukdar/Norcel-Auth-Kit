import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export const metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; pending?: string }>;
}) {
  const { token, pending } = await searchParams;

  return (
    <AuthShell
      title="Verify your email."
      description="Confirm your email address to finish setting up your account."
      footer={
        <Link href="/login" className="text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {pending ? (
        <Alert intent="info" className="mb-4">
          Please verify your email before accessing that page.
        </Alert>
      ) : null}
      {token ? <VerifyEmailForm token={token} /> : null}
      <div className="mt-6 border-t border-hairline pt-6">
        <p className="mb-3 text-body-sm text-body">
          Didn't get the email? Send it again.
        </p>
        <ResendVerificationForm />
      </div>
    </AuthShell>
  );
}
