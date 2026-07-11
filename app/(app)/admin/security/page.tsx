import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Security log" };

const TYPE_LABELS: Record<string, { label: string; intent: "default" | "success" | "error" | "warning" | "violet" }> = {
  LOGIN_SUCCESS: { label: "Login OK", intent: "success" },
  LOGIN_FAILURE: { label: "Login failed", intent: "error" },
  LOGIN_LOCKED: { label: "Login locked", intent: "error" },
  LOGOUT: { label: "Logout", intent: "default" },
  SIGNUP: { label: "Signup", intent: "violet" },
  EMAIL_VERIFICATION_SENT: { label: "Verify sent", intent: "default" },
  EMAIL_VERIFIED: { label: "Verified", intent: "success" },
  EMAIL_CHANGE_REQUESTED: { label: "Email change requested", intent: "warning" },
  EMAIL_CHANGED: { label: "Email changed", intent: "success" },
  PASSWORD_RESET_REQUESTED: { label: "Reset requested", intent: "warning" },
  PASSWORD_RESET_COMPLETED: { label: "Reset completed", intent: "success" },
  PASSWORD_CHANGED: { label: "Password changed", intent: "success" },
  OAUTH_LINKED: { label: "OAuth linked", intent: "default" },
  OAUTH_UNLINKED: { label: "OAuth unlinked", intent: "default" },
  MAGIC_LINK_REQUESTED: { label: "Magic link sent", intent: "default" },
  MAGIC_LINK_CONSUMED: { label: "Magic link used", intent: "success" },
  SESSION_REVOKED: { label: "Session revoked", intent: "default" },
  ACCOUNT_LOCKED: { label: "Account locked", intent: "error" },
  ACCOUNT_UNLOCKED: { label: "Account unlocked", intent: "default" },
  ACCOUNT_DELETED: { label: "Account deleted", intent: "error" },
  ACCOUNT_RESTORED: { label: "Account restored", intent: "success" },
  ROLE_CHANGED: { label: "Role changed", intent: "violet" },
};

const PAGE_SIZE = 50;

export default async function SecurityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  await requirePermission(PERMISSIONS.SECURITY_LOG_READ);
  const { page, type } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  // `type` is a string from the URL — narrow to the enum at the DB
  // level. The SecurityEventType enum is too wide to type cleanly
  // here, so we pass the value through Prisma's permissive input
  // and rely on the Prisma runtime to reject unknown values.
  const where = type ? { type: type as never } : undefined;

  // Run the two queries SEQUENTIALLY. With Supabase's
  // transaction-mode pooler and `connection_limit=1`, parallel
  // queries queue on a single connection and can hit the 10s
  // pool-timeout. Sequential is slower in steady state but
  // never deadlocks.
  const events = await prisma.securityEvent.findMany({
    where,
    take: PAGE_SIZE,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      email: true,
      ip: true,
      userAgent: true,
      metadata: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
  const total = await prisma.securityEvent.count({ where });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
          / admin
        </p>
        <h1 className="text-display-lg text-ink">Security log.</h1>
        <p className="text-body-md text-zinc-400">
          {total.toLocaleString()} audit events on record.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>
            Append-only log of every security-relevant action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-white/[0.08]">
            <table className="w-full text-body-sm">
              <thead className="bg-white/[0.02]">
                <tr>
                  <Th>When</Th>
                  <Th>Event</Th>
                  <Th>User</Th>
                  <Th>IP</Th>
                  <Th>Metadata</Th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      No events yet.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => {
                    const meta = TYPE_LABELS[e.type] ?? {
                      label: e.type,
                      intent: "default" as const,
                    };
                    return (
                      <tr key={e.id} className="border-t border-white/[0.06]">
                        <Td>
                          <span className="font-mono text-caption-mono text-mute">
                            {e.createdAt.toLocaleString()}
                          </span>
                        </Td>
                        <Td>
                          <Badge variant={meta.intent}>{meta.label}</Badge>
                        </Td>
                        <Td>
                          <span className="text-body-sm text-ink">
                            {e.user?.name ?? e.email ?? "—"}
                          </span>
                          {e.user?.email ? (
                            <span className="ml-1 text-caption text-mute">
                              {e.user.email}
                            </span>
                          ) : null}
                        </Td>
                        <Td>
                          <span className="font-mono text-caption-mono text-mute">
                            {e.ip ?? "—"}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-caption-mono text-mute">
                            {e.metadata ? JSON.stringify(e.metadata) : ""}
                          </span>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-caption-mono uppercase tracking-[0.18em] text-mute">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
