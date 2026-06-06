import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export const metadata = { title: "Sign in with email" };

export default function MagicLinkPage() {
  return (
    <AuthShell
      title="Sign in with a link."
      description="We'll email you a one-time sign-in link."
      footer={
        <>
          Prefer a password?{" "}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Sign in with password
          </Link>
        </>
      }
    >
      <MagicLinkForm />
    </AuthShell>
  );
}
