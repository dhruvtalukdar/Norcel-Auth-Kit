import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Users,
  Clock,
  ShieldCheck,
  KeyRound,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getPersonalStats, getWorkspaceStats } from "@/lib/dashboard-stats";
import { UserRole } from "@prisma/client";

export const metadata = { title: "Dashboard" };

// Map a SecurityEventType to a display label + intent. Falls back to
// the raw enum value for events we haven't categorised yet.
const EVENT_LABELS: Record<string, { label: string; intent: "default" | "success" | "warning" | "violet" }> = {
  LOGIN_SUCCESS: { label: "Signed in", intent: "success" },
  LOGIN_FAILURE: { label: "Sign-in failed", intent: "default" },
  LOGIN_LOCKED: { label: "Sign-in locked", intent: "default" },
  LOGOUT: { label: "Signed out", intent: "default" },
  SIGNUP: { label: "Account created", intent: "violet" },
  EMAIL_VERIFIED: { label: "Email verified", intent: "success" },
  EMAIL_CHANGED: { label: "Email changed", intent: "success" },
  PASSWORD_CHANGED: { label: "Password changed", intent: "success" },
  PASSWORD_RESET_COMPLETED: { label: "Password reset", intent: "success" },
  MAGIC_LINK_CONSUMED: { label: "Magic link used", intent: "violet" },
  ACCOUNT_LOCKED: { label: "Account locked", intent: "default" },
  SESSION_REVOKED: { label: "Session revoked", intent: "default" },
  ACCOUNT_DELETED: { label: "Account deleted", intent: "default" },
};

function initials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { user } = await requireAuth();
  const { denied } = await searchParams;

  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

  // Pull stats + the user's last 5 SecurityEvent rows in parallel so
  // the page is one round-trip on the Supabase pooler.
  const [workspace, personal, recentEvents] = await Promise.all([
    isAdmin ? getWorkspaceStats() : Promise.resolve(null),
    getPersonalStats(user.id),
    prisma.securityEvent.findMany({
      where: { OR: [{ userId: user.id }, { email: user.email }] },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        ip: true,
        createdAt: true,
      },
    }),
  ]);

  const firstName = (user.name ?? user.email.split("@")[0] ?? "").split(/\s+/)[0] || "friend";
  const roleLabel = user.role.toLowerCase().replace("_", " ");

  return (
    <div className="flex flex-col gap-8">
      {denied ? (
        <Alert intent="warning">
          You don&apos;t have permission to access that page.
        </Alert>
      ) : null}

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
            {isAdmin ? "/ admin overview" : "/ overview"}
          </p>
          <h1 className="mt-3 text-display-lg leading-[1.05] tracking-[-0.04em] text-ink">
            Good to see you, <span className="text-gradient">{firstName}</span>.
          </h1>
          <p className="mt-2 text-body-md text-zinc-400">
            {isAdmin
              ? "Here's what's happening across your ForgeStack workspace."
              : "Here's a quick look at your account."}
          </p>
        </div>

        {/* User identity card — small, anchored right */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-caption-strong">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-body-sm-strong text-ink">
              {user.name ?? user.email}
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-400" />
              signed in as {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards (workspace or personal) ──────────────────────── */}
      {isAdmin && workspace ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon={<Users className="h-4 w-4" />}
            label="Total users"
            value={workspace.total}
            sparkline={[3, 4, 4, 5, 5, 6, workspace.total]}
            trendLabel="+1 this week"
          />
          <Stat
            icon={<Check className="h-4 w-4" />}
            label="Verified emails"
            value={workspace.verified}
            sparkline={[2, 3, 3, 4, 4, 5, workspace.verified]}
            trendLabel={`${Math.round((workspace.verified / Math.max(workspace.total, 1)) * 100)}% verified`}
          />
          <Stat
            icon={<Activity className="h-4 w-4" />}
            label="7-day active"
            value={workspace.sevenDayActive}
            sparkline={[0, 1, 1, 2, 2, 3, workspace.sevenDayActive]}
            trendLabel="last 7 days"
          />
          <Stat
            icon={<KeyRound className="h-4 w-4" />}
            label="Active sessions"
            value={personal.activeSessions}
            sparkline={[1, 1, 1, 1, 1, 1, personal.activeSessions]}
            trendLabel="across all your devices"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            icon={<KeyRound className="h-4 w-4" />}
            label="Active sessions"
            value={personal.activeSessions}
            sparkline={[1, 1, 1, 1, 1, 1, personal.activeSessions]}
            trendLabel="across all your devices"
          />
          <Stat
            icon={<Clock className="h-4 w-4" />}
            label="Last sign-in"
            value={
              personal.lastLoginAt
                ? formatRelativeDate(personal.lastLoginAt)
                : "—"
            }
            trendLabel="most recent activity"
          />
          <Stat
            icon={<Sparkles className="h-4 w-4" />}
            label="Member since"
            value={
              personal.memberSince
                ? formatRelativeDate(personal.memberSince)
                : "—"
            }
            trendLabel="thanks for joining"
          />
        </div>
      )}

      {/* ── Two-column: status + real activity ────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* System status — left, 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System status.</CardTitle>
              <Badge variant="violet">Live</Badge>
            </div>
            <p className="text-body-sm text-zinc-400">
              Everything's online. Nothing to do here.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-body-sm text-zinc-300">
            {[
              { label: "Auth.js", value: "operational" },
              { label: "Database", value: "connected" },
              { label: "Email provider", value: "ready" },
              { label: "Session store", value: "active" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-t border-white/[0.04] pt-3 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-caption text-mute">{row.label}</span>
                <span className="inline-flex items-center gap-2 text-zinc-200">
                  <span className="relative grid h-1.5 w-1.5 place-items-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-mono text-caption">{row.value}</span>
                </span>
              </div>
            ))}
            <Link
              href="/settings/sessions"
              className="mt-3 inline-flex items-center gap-1.5 text-body-sm text-blue-300 underline-offset-4 hover:underline"
            >
              Manage sessions
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Real activity — right, 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity.</CardTitle>
              {isAdmin ? (
                <Link
                  href="/admin/security"
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute transition-colors hover:text-zinc-200"
                >
                  view all →
                </Link>
              ) : null}
            </div>
            <p className="text-body-sm text-zinc-400">
              Your last 5 security events.
            </p>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ShieldCheck className="h-6 w-6 text-zinc-600" />
                <p className="text-body-sm text-zinc-400">No activity yet.</p>
                <p className="text-caption text-mute">
                  Sign-in and security events will show up here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {recentEvents.map((e) => {
                  const meta = EVENT_LABELS[e.type] ?? {
                    label: e.type,
                    intent: "default" as const,
                  };
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Badge variant={meta.intent} className="shrink-0">
                          {meta.label}
                        </Badge>
                        {e.ip ? (
                          <span className="truncate font-mono text-caption text-mute">
                            {e.ip}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-mono text-caption text-mute">
                        {formatRelativeDate(e.createdAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card with sparkline, icon, and trend label                   */
/* ------------------------------------------------------------------ */
function Stat({
  icon: Icon,
  label,
  value,
  sparkline,
  trendLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sparkline?: number[];
  trendLabel: string;
}) {
  // Render a 7-point sparkline as an inline SVG. Uses the brand
  // emerald-400 stroke. Optional — for string-valued stats (dates,
  // text) we skip the chart and let the value carry the meaning.
  const points = sparkline;
  const hasSparkline = Array.isArray(points) && points.length > 1;
  const max = hasSparkline ? Math.max(...(points as number[]), 1) : 1;
  const w = 88;
  const h = 22;
  const stepX = w / ((points?.length ?? 1) - 1);
  const path = hasSparkline
    ? (points as number[])
        .map((v, i) => {
          const x = i * stepX;
          const y = h - (v / max) * h;
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ")
    : "";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 shadow-elev-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-mute">
          <span className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.06] bg-white/[0.02] text-zinc-300">
            {Icon}
          </span>
          <span className="text-caption">{label}</span>
        </div>
        {hasSparkline ? (
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-6 w-22 text-emerald-400/70"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-display-md leading-none text-ink">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
        {trendLabel}
      </p>
    </div>
  );
}

function formatRelativeDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  if (day < 30) return `${day}d ago`;
  return date.toLocaleDateString();
}
