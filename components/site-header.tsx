import Link from "next/link";
import type { Route } from "next";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";

const NAV_LINKS: Array<{ href: Route; label: string }> = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#docs", label: "Docs" },
];

/**
 * Top navigation. Server component — reads the session on the server and
 * decides whether to show the user menu or the "Log in / Sign up" cluster.
 */
export async function SiteHeader() {
  const session = await auth();
  const isAuthed = Boolean(session?.user?.id);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="ForgeStack home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-body-sm text-body transition-colors hover:bg-canvas-soft hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <UserMenu
              name={session?.user?.name ?? session?.user?.email ?? "Account"}
              email={session?.user?.email ?? ""}
              role={session?.user?.role ?? "USER"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-7 items-center justify-center rounded-sm px-2 text-body-sm-strong text-ink transition-colors hover:bg-canvas-soft sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-7 items-center justify-center rounded-sm bg-ink px-3 text-body-sm-strong text-on-primary transition-colors hover:bg-ink/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
