import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * AuthShell — a centred card on canvas-soft, used by /login, /register, etc.
 * Mirrors the `ex-auth-form-card` shape from DESIGN.md.
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
    <div className="flex min-h-screen flex-col bg-canvas-soft">
      <header className="px-6 py-6">
        <Link href="/" aria-label="ForgeStack home">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-hairline bg-canvas-soft p-8 shadow-elev-4 sm:p-10">
            <div className="mb-6 flex flex-col gap-2">
              <h1 className="text-display-md text-ink">{title}</h1>
              {description ? (
                <p className="text-body-md text-body">{description}</p>
              ) : null}
            </div>
            {children}
          </div>
          {footer ? (
            <p className="mt-6 text-center text-body-sm text-body">
              {footer}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
