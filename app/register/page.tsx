import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { auth } from "@/lib/auth";

export const metadata = { title: "Create your account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { next } = await searchParams;

  return (
    <AuthShell
      title="Create your account."
      description="Start building with ForgeStack in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-ink underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" aria-hidden />
        <span className="font-mono text-caption-mono uppercase text-mute">
          or
        </span>
        <span className="h-px flex-1 bg-hairline" aria-hidden />
      </div>
      <OAuthButtons next={next} />
    </AuthShell>
  );
}
