import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/forgot-password");

  return (
    <AuthShell
      title="Choose a new password."
      description="Pick something strong. You'll be signed in automatically."
      footer={
        <Link href="/login" className="text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
