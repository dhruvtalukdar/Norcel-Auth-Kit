import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Users" };

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireAdmin();
  const { page, q } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = q
    ? {
        deletedAt: null,
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : { deletedAt: null };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: PAGE_SIZE,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        role: { select: { name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-caption-mono uppercase text-mute">
          Admin
        </p>
        <h1 className="text-display-lg text-ink">Users.</h1>
        <p className="text-body-md text-body">
          {total.toLocaleString()} {total === 1 ? "user" : "users"} in your
          workspace.
        </p>
      </div>

      <form
        method="get"
        className="flex items-center gap-2"
        aria-label="Search users"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="h-9 w-full max-w-sm rounded-sm border border-hairline bg-canvas px-3 text-body-sm text-ink placeholder:text-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {q ? (
          <Button asChild variant="ghost">
            <Link href="/admin/users">Clear</Link>
          </Button>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-md border border-hairline bg-canvas shadow-elev-2">
        <table className="w-full text-body-sm">
          <thead className="bg-canvas-soft">
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Last sign-in</Th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-body text-body">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-hairline">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-body-sm-strong text-ink">
                          {u.name ?? "—"}
                        </p>
                        <p className="truncate text-caption text-mute">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={u.role?.name === "ADMIN" ? "violet" : "default"}>
                      {u.role?.name ?? "USER"}
                    </Badge>
                  </Td>
                  <Td>
                    {u.emailVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                  </Td>
                  <Td>
                    <span className="font-mono text-caption-mono text-mute">
                      {u.createdAt.toLocaleDateString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-caption-mono text-mute">
                      {u.lastLoginAt
                        ? u.lastLoginAt.toLocaleDateString()
                        : "Never"}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-body">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              asChild={currentPage > 1}
              variant="secondary"
              disabled={currentPage <= 1}
            >
              {currentPage > 1 ? (
                <Link
                  href={{
                    pathname: "/admin/users",
                    query: { ...(q ? { q } : {}), page: currentPage - 1 },
                  }}
                >
                  Previous
                </Link>
              ) : (
                <span>Previous</span>
              )}
            </Button>
            <Button
              asChild={currentPage < totalPages}
              variant="secondary"
              disabled={currentPage >= totalPages}
            >
              {currentPage < totalPages ? (
                <Link
                  href={{
                    pathname: "/admin/users",
                    query: { ...(q ? { q } : {}), page: currentPage + 1 },
                  }}
                >
                  Next
                </Link>
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-caption-mono uppercase tracking-tight text-mute">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
