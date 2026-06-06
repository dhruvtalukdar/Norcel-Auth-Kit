import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { user } = await requireAuth();
  const { denied } = await searchParams;

  // Server-side fetch of metrics for the dashboard cards.
  const [totalUsers, verifiedCount, recentLogins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({
      where: {
        lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {denied ? (
        <Alert intent="warning">
          You don't have permission to access that page.
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          {user.role === "ADMIN" ? "Admin overview" : "Overview"}
        </p>
        <h1 className="text-display-lg text-ink">
          Welcome back, {user.name ?? "friend"}.
        </h1>
        <p className="text-body-md text-body">
          Here's what's happening in your ForgeStack workspace today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={totalUsers} />
        <Stat label="Verified emails" value={verifiedCount} />
        <Stat label="7-day active" value={recentLogins} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Build with ForgeStack.</CardTitle>
              <Badge variant="violet">Live</Badge>
            </div>
            <p className="text-body-sm text-body">
              Ship a production-grade SaaS in days.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-body-md text-body">
            <p>
              Your environment is healthy, your database is connected, and your
              authentication is ready for traffic.
            </p>
            <p>
              Need help getting started? Read the docs or clone the example
              repo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity.</CardTitle>
            <p className="text-body-sm text-body">
              Recent events from your workspace.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-hairline">
              <Activity
                title="Signed in"
                detail={`Welcome back, ${user.email}`}
                when="Just now"
              />
              <Activity
                title="Password hashed"
                detail="Argon2id with 19 MB memory cost"
                when="2 min ago"
              />
              <Activity
                title="Session created"
                detail="JWT — 30-day TTL"
                when="2 min ago"
              />
            </ul>
          </CardContent>
        </Card>
      </div>
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

function Activity({
  title,
  detail,
  when,
}: {
  title: string;
  detail: string;
  when: string;
}) {
  return (
    <li className="flex items-center justify-between py-3">
      <div>
        <p className="text-body-sm-strong text-ink">{title}</p>
        <p className="text-body-sm text-body">{detail}</p>
      </div>
      <p className="font-mono text-caption-mono text-mute">{when}</p>
    </li>
  );
}
