import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * AuthShell — centred card on the dark canvas, used by /login, /register,
 * /forgot-password, /reset-password, /magic-link, /verify-email.
 *
 * Mirrors `ex-auth-form-card` from the design system, re-skinned for the
 * dark canvas: card body = `rounded-xl border border-white/[0.08]
 * bg-white/[0.02]`, elev-4 shadow.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="px-6 py-6">
        <Link href="/" aria-label="Norcel home">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-elev-4 sm:p-10">
            <div className="mb-6 flex flex-col gap-2">
              <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
                / auth
              </p>
              <h1 className="text-display-md text-ink">{title}</h1>
              {description ? (
                <p className="text-body-md text-zinc-400">{description}</p>
              ) : null}
            </div>
            {children}
          </div>
          {footer ? (
            <p className="mt-6 text-center text-body-sm text-zinc-400">
              {footer}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
