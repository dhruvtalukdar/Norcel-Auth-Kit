import { Alert } from "@/components/ui/alert";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { EmailChangeForm } from "@/components/account/email-change-form";
import { DeleteAccountCard } from "@/components/account/delete-account-card";

export const metadata = { title: "Profile" };

function initials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ email_change?: string; reason?: string }>;
}) {
  const { user } = await requireAuth();
  const sp = await searchParams;

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      image: true,
      pendingEmail: true,
    },
  });

  if (!record) {
    return <p className="text-body-md text-body">Account not found.</p>;
  }

  // Status banner based on email_change query string.
  let banner: { intent: "success" | "error"; text: string } | null = null;
  if (sp.email_change === "success") {
    banner = { intent: "success", text: "Your email was updated successfully." };
  } else if (sp.email_change === "error") {
    banner = {
      intent: "error",
      text: sp.reason ?? "We couldn't update your email. Please try again.",
    };
  } else if (sp.email_change === "invalid") {
    banner = { intent: "error", text: "That link is invalid or has expired." };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          Account
        </p>
        <h1 className="text-display-lg text-ink">Profile.</h1>
        <p className="text-body-md text-body">
          Update your name, email, and password.
        </p>
      </div>

      {banner ? (
        <Alert intent={banner.intent}>{banner.text}</Alert>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-body-md-strong">
              {initials(record.name, record.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{record.name ?? record.email}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {record.email}
              {record.emailVerified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultName={record.name ?? ""}
            memberSince={record.createdAt}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email address.</CardTitle>
          <CardDescription>
            We'll send a verification link to the new address before
            making the change. Your current address stays active until
            you confirm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailChangeForm
            currentEmail={record.email}
            pendingEmail={record.pendingEmail}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password.</CardTitle>
          <CardDescription>
            Use a strong password — at least 8 characters with a mix of cases,
            a number, and a symbol.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      <DeleteAccountCard email={record.email} />
    </div>
  );
}
