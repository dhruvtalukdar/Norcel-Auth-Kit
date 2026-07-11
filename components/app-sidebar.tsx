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

  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 md:block">
      <p className="mb-2 px-3 font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
        Navigation
      </p>
      <nav className="flex flex-col" aria-label="App">
        {ITEMS.filter((i) => !i.adminOrHigher || isAdmin).map((item) => {
          const Icon = item.icon;
          // Active = the most specific match. If the user is on
          // `/settings/sessions`, only the "Active sessions"
          // entry highlights — the parent "Settings" does NOT.
          // This prevents the bug where both parent and child
          // light up at the same time.
          const isExact = pathname === item.href;
          const pathSegments = pathname.split("/").filter(Boolean);
          const itemSegments = item.href.split("/").filter(Boolean);
          // The item matches if either it's an exact match, OR
          // the current path is exactly one segment deeper and
          // every other segment matches.
          const isChild =
            pathSegments.length === itemSegments.length + 1 &&
            itemSegments.every(
              (seg, i) => pathSegments[i] === seg
            );
          const active = isExact || isChild;
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
