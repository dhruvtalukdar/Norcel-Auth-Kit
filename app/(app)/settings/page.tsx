import Link from "next/link";
import { KeyRound, ScrollText, User, type LucideIcon } from "lucide-react";

import { requireVerified } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

type SettingsLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
  adminOrHigher?: boolean;
};

export default async function SettingsPage() {
  const { user } = await requireVerified();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const [activeSessions, account, auditEvents] = await Promise.all([
    prisma.userSession.count({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    }),
    isAdmin ? prisma.securityEvent.count() : Promise.resolve(0),
  ]);
  const isVerified = Boolean(account?.emailVerified);

  const links: SettingsLink[] = [
    {
      href: "/profile",
      title: "Profile and password",
      description:
        "Update your name, change your email, and rotate your password.",
      icon: User,
      meta: isVerified ? "Email verified" : "Email unverified",
    },
    {
      href: "/settings/sessions",
      title: "Active sessions",
      description:
        "See every device that's currently signed in to your account. Revoke any that look unfamiliar.",
      icon: KeyRound,
      meta: `${activeSessions} active`,
    },
    {
      href: "/admin/security",
      title: "Security log",
      description:
        "Append-only audit log of sign-ins, password changes, role updates, and other security events.",
      icon: ScrollText,
      adminOrHigher: true,
      meta: isAdmin
        ? `${auditEvents.toLocaleString()} event${auditEvents === 1 ? "" : "s"}`
        : "Admins only",
    },
  ];

  const visible = links.filter((l) => !l.adminOrHigher || isAdmin);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
          / account
        </p>
        <h1 className="text-display-lg text-ink">Settings.</h1>
        <p className="text-body-md text-zinc-400">
          Manage your account, devices, and security.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((link) => (
          <Link
            key={link.href}
            href={link.href as never}
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Card className="h-full transition-colors duration-300 group-hover:bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <link.icon className="h-4 w-4 text-mute" />
                  {link.title}
                </CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              {link.meta ? (
                <CardContent>
                  <Badge variant="default">{link.meta}</Badge>
                </CardContent>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
