import { requireAuth } from "@/lib/auth-guards";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";

/**
 * Authenticated app layout — shared by /dashboard, /profile, /admin.
 * Middleware blocks unauthenticated traffic; `requireAuth` is a
 * belt-and-braces check for RSC.
 *
 * `requireAuth()` may throw if the database is briefly unavailable
 * (Supabase pooler drops idle connections). We let that bubble — the
 * `app/error.tsx` boundary catches it and renders a real error page
 * rather than re-rendering the layout, which is what was causing
 * Chromium's `history.replaceState` quota to trip in dev.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 py-8 sm:px-6">
        <AppSidebar role={user.role} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
