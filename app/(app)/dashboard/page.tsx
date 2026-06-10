import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-guards";
import { getPersonalStats, getWorkspaceStats } from "@/lib/dashboard-stats";
import { UserRole } from "@prisma/client";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { user } = await requireAuth();
  const { denied } = await searchParams;

  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  // Admins see workspace stats (groupBy + 1 count).
  // Regular users see only their own personal stats — workspace
  // metrics are never queried on their behalf, so there's nothing
  // for the page to leak.
  const [workspace, personal] = await Promise.all([
    isAdmin ? getWorkspaceStats() : Promise.resolve(null),
    getPersonalStats(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {denied ? (
        <Alert intent="warning">
          You don&apos;t have permission to access that page.
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          {isAdmin ? "Admin overview" : "Overview"}
        </p>
        <h1 className="text-display-lg text-ink">
          Welcome back, {user.name ?? "friend"}.
        </h1>
        <p className="text-body-md text-body">
          {isAdmin
            ? "Here’s what’s happening in your ForgeStack workspace today."
            : "Here’s a quick look at your account."}
        </p>
      </div>

      {isAdmin && workspace ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total users" value={workspace.total} />
          <Stat label="Verified emails" value={workspace.verified} />
          <Stat label="7-day active" value={workspace.sevenDayActive} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Active sessions" value={personal.activeSessions} />
          <Stat
            label="Last sign-in"
            value={
              personal.lastLoginAt
                ? formatRelativeDate(personal.lastLoginAt)
                : "—"
            }
          />
          <Stat
            label="Member since"
            value={
              personal.memberSince
                ? formatRelativeDate(personal.memberSince)
                : "—"
            }
          />
        </div>
      )}

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
              Recent events from your account.
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

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-canvas p-6 shadow-elev-2">
      <p className="text-caption text-mute">{label}</p>
      <p className="mt-2 text-display-md text-ink">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
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
        <p className="text-caption text-mute">{detail}</p>
      </div>
      <p className="font-mono text-caption-mono text-mute">{when}</p>
    </li>
  );
}

/** "3 days ago" / "Today" / "Jan 12" — coarse relative formatter. */
function formatRelativeDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}
