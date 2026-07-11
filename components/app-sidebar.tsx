"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User as UserIcon,
  Settings,
  Shield,
  Users,
  ScrollText,
  KeyRound,
} from "lucide-react";
import { UserRole } from "@prisma/client";

import { cn } from "@/lib/utils";

type Item = {
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOrHigher?: boolean;
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/sessions", label: "Active sessions", icon: KeyRound },
  { href: "/admin", label: "Admin panel", icon: Shield, adminOrHigher: true },
  { href: "/admin/users", label: "Users", icon: Users, adminOrHigher: true },
  {
    href: "/admin/security",
    label: "Security log",
    icon: ScrollText,
    adminOrHigher: true,
  },
];

/**
 * App sidebar. Dark chrome: active state = `bg-white/[0.06]` + white text
 * + left-edge `bg-white` indicator bar (3px). Hover = `bg-white/[0.04]`.
 */
export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const isAdmin =
    role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

  // Find the longest sidebar item whose `href` is a prefix of the
  // current pathname. The longest match wins — so on
  // `/settings/sessions`, only "Active sessions" highlights, not
  // "Settings". And on `/admin/users`, only "Users" highlights, not
  // "Admin panel". This prevents the parent+child both-active bug.
  const visibleItems = ITEMS.filter((i) => !i.adminOrHigher || isAdmin);
  const activeHref = visibleItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .reduce<string | null>(
      (best, item) =>
        best === null || item.href.length > best.length ? item.href : best,
      null
    );

  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 md:block">
      <p className="mb-2 px-3 font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
        Navigation
      </p>
      <nav className="flex flex-col" aria-label="App">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-body-sm transition-colors duration-200",
                active
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white"
                />
              ) : null}
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
