"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User as UserIcon,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { UserRole } from "@prisma/client";

import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  admin?: boolean;
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/admin", label: "Admin panel", icon: Shield, admin: true },
  { href: "/admin/users", label: "Users", icon: Users, admin: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * Sidebar nav — active state uses an `activeIndicator` (left-edge bar in
 * brand primary) per `ex-app-shell-row` from DESIGN.md.
 */
export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 md:block">
      <p className="mb-2 px-3 text-caption-mono uppercase text-mute">
        Navigation
      </p>
      <nav className="flex flex-col" aria-label="App">
        {ITEMS.filter((i) => !i.admin || role === "ADMIN").map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-sm px-3 py-2 text-body-sm",
                active
                  ? "bg-canvas-soft text-ink"
                  : "text-body hover:bg-canvas-soft hover:text-ink"
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-ink"
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
