import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getOAuthCount, getWorkspaceStats } from "@/lib/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [stats, oauthCount, recent] = await Promise.all([
    getWorkspaceStats(),
    getOAuthCount(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
          / admin
        </p>
        <h1 className="text-display-lg text-ink">Admin overview.</h1>
        <p className="text-body-md text-zinc-400">
          High-level metrics for the ForgeStack workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={stats.total} />
        <Stat
          label="Admins"
          value={(stats.byRole.ADMIN ?? 0) + (stats.byRole.SUPER_ADMIN ?? 0)}
        />
        <Stat label="7-day active" value={stats.sevenDayActive} />
      </div>
      <p className="text-caption text-mute">
        {oauthCount} OAuth account link{oauthCount === 1 ? "" : "s"} across all users.
      </p>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent sign-ups.</CardTitle>
            <p className="text-body-sm text-zinc-400">
              Latest 5 users who joined ForgeStack.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-body-sm text-blue-300 underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-white/[0.06]">
            {recent.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm-strong text-ink">
                    {u.name ?? u.email}
                  </p>
                  <p className="truncate text-caption text-mute">{u.email}</p>
                </div>
                <Badge
                  variant={u.role?.name === "ADMIN" ? "violet" : "default"}
                >
                  {u.role?.name ?? "USER"}
                </Badge>
                <p className="hidden font-mono text-caption-mono text-mute sm:block">
                  {u.createdAt.toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-elev-2">
      <p className="text-caption text-mute">{label}</p>
      <p className="mt-2 text-display-md text-ink">{value.toLocaleString()}</p>
    </div>
  );
}
