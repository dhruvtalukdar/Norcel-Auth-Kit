import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [users, admins, oauthCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { name: "ADMIN" } } }),
    prisma.account.count(),
  ]);

  const recent = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          Admin
        </p>
        <h1 className="text-display-lg text-ink">Admin overview.</h1>
        <p className="text-body-md text-body">
          High-level metrics for the ForgeStack workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={users} />
        <Stat label="Admins" value={admins} />
        <Stat label="OAuth links" value={oauthCount} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent sign-ups.</CardTitle>
            <p className="text-body-sm text-body">
              Latest 5 users who joined ForgeStack.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-body-sm text-link underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-hairline">
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
    <div className="rounded-md border border-hairline bg-canvas p-6 shadow-elev-2">
      <p className="text-caption text-mute">{label}</p>
      <p className="mt-2 text-display-md text-ink">{value.toLocaleString()}</p>
    </div>
  );
}
