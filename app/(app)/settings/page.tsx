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

/**
 * Settings hub. The auth flows (name, email, password) live on
 * /profile; per-device sessions live on /settings/sessions; the
 * security audit log lives on /admin/security. This page is the
 * index that ties them together and gives the user a single place
 * to see what they can configure.
 */
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

  // Pull the live count of active sessions, the email-verified status
  // (the JWT only carries the role, not emailVerified), and the
  // security-event count (admin-only) in parallel.
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
        <p className="font-mono text-caption-mono uppercase text-mute">
          Account
        </p>
        <h1 className="text-display-lg text-ink">Settings.</h1>
        <p className="text-body-md text-body">
          Manage your account, devices, and security.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((link) => (
          <Link
            key={link.href}
            href={link.href as never}
            className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <Card className="h-full transition-colors group-hover:bg-canvas-soft">
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
