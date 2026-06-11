import { requireVerified } from "@/lib/auth-guards";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionsList } from "@/components/account/sessions-list";

export const metadata = { title: "Active sessions" };

export default async function SessionsPage() {
  const { user } = await requireVerified();
  const authSession = await auth();
  const currentSessionId = authSession?.user?.sessionId ?? "";

  const sessions = await prisma.userSession.findMany({
    where: {
      userId: user.id,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      sessionId: true,
      userAgent: true,
      ip: true,
      city: true,
      country: true,
      lastSeenAt: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          Security
        </p>
        <h1 className="text-display-lg text-ink">Active sessions.</h1>
        <p className="text-body-md text-body">
          These are the devices and browsers currently signed in to your
          account. Revoke any that you don't recognise.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {sessions.length} active session{sessions.length === 1 ? "" : "s"}.
          </CardTitle>
          <CardDescription>
            Each row is a server-side session mirrored from the JWT
            cookie. Revoking here deletes the row, and the next request
            from that device will be forced back to /login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList
            sessions={sessions.map((s) => ({
              ...s,
              lastSeenAt: s.lastSeenAt.toISOString(),
              createdAt: s.createdAt.toISOString(),
              expiresAt: s.expiresAt.toISOString(),
            }))}
            currentSessionId={currentSessionId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
