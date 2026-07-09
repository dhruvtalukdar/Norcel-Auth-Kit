import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/logo";

const COLUMNS: Array<{ title: string; links: Array<{ href: Route; label: string }> }> = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#security", label: "Security" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/register", label: "Get started" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/#docs", label: "Docs" },
      { href: "/#changelog", label: "Changelog" },
      { href: "/#support", label: "Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/#privacy", label: "Privacy" },
      { href: "/#terms", label: "Terms" },
      { href: "/#cookies", label: "Cookies" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About" },
      { href: "/#contact", label: "Contact" },
      { href: "/#careers", label: "Careers" },
    ],
  },
];

/**
 * 4-column footer with mono-caption column labels and body-sm links.
 * Dark chrome: `bg-[#0a0a0a]`, `border-t border-white/[0.06]`, mono-uppercase
 * eyebrows, hairline bottom bar.
 */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0a0a0a]">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-body-sm text-mute">
              The developer cloud for shipping production-grade SaaS.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-body-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 text-caption text-mute md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} ForgeStack. All rights reserved.</p>
          <p className="font-mono">v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
