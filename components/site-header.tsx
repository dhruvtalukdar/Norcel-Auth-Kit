import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
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
          <Link href="/" aria-label="Norcel home">
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
          {/* "Get Norcel" pill — link to the Gumroad checkout.
           *  This is what the demo's owner uses to monetize. Buyers
           *  who ship their own SaaS on top of Norcel should
           *  REMOVE this block — see docs/getting-started.md §9. */}

          <Link
            href="https://yourname.gumroad.com/l/norcel"
            target="_blank"
            rel="noreferrer"
            className="hidden h-7 items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/[0.06] px-3 text-body-sm-strong text-amber-200 transition-colors hover:bg-amber-300/[0.12] hover:text-amber-100 sm:inline-flex"
            aria-label="Get the Norcel source code"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Get Norcel
            <ArrowUpRight className="h-3 w-3 opacity-70" />
          </Link>

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
