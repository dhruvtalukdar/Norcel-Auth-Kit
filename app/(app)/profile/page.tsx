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

export default async function ProfilePage() {
  const { user } = await requireAuth();
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      image: true,
    },
  });

  if (!record) {
    return <p className="text-body-md text-body">Account not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          Account
        </p>
        <h1 className="text-display-lg text-ink">Profile.</h1>
        <p className="text-body-md text-body">
          Update your name, change your password, and review your account
          details.
        </p>
      </div>

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
    </div>
  );
}
