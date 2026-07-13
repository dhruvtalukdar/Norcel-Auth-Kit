import Link from "next/link";
import type { Route } from "next";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";

const NAV_LINKS: Array<{ href: Route; label: string }> = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/getting-started", label: "Getting started" },
];

/**
 * Sticky top nav. Server component — reads the session on the server
 * and decides between UserMenu and the Log in / Sign up cluster.
 *
 * Dark chrome: `bg-[#0a0a0a]/70 backdrop-blur-xl`, `border-b border-white/[0.06]`,
 * nav-link hover = `bg-white/[0.04]` + white text.
 */
export async function SiteHeader() {
  const session = await auth();
  const isAuthed = Boolean(session?.user?.id);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0a0a]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60">
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
                className="rounded-full px-3 py-1.5 text-body-sm text-zinc-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white"
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
                className="hidden h-7 items-center justify-center rounded-full px-3 text-body-sm-strong text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-7 items-center justify-center rounded-full bg-white px-3 text-body-sm-strong text-black transition-colors hover:bg-white/90"
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
