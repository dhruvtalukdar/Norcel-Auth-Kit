import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  Check,
  Gift,
  KeyRound,
  Layers,
  Webhook,
  CreditCard,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeWindow } from "@/components/ui/code-window";
import { IconContainer } from "@/components/ui/icon-container";

/* --------------------------------------------------------------------- */
/*  Marketing landing page — dark, Vercel/Geist-inspired.                */
/* --------------------------------------------------------------------- */

// Force-dynamic so the `<SiteHeader>` re-evaluates `auth()` on every
// request. Without this, Next.js serves a static version cached at
// build time. After sign-out, the user lands on `/` and the cached
// version can show stale header state (UserMenu still visible) or
// stale content. Forcing dynamic re-renders the header with the
// correct logged-out / logged-in state.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden pb-24 pt-20 lg:pb-32 lg:pt-28">
          {/* background layers: mesh + grid noise + soft vignette */}
          <div className="bg-mesh-gradient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] opacity-90" />
          <div className="grid-noise absolute inset-0 -z-10 opacity-40" />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-gradient-to-b from-transparent via-transparent to-canvas" />

          <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 sm:px-8 lg:grid-cols-12">
            {/* ── Left column: copy + CTAs ─────────────────────────────── */}
            <div className="lg:col-span-7">
              <span className="badge-eyebrow reveal">
                <span className="relative grid h-1.5 w-1.5 place-items-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span>v1.0 — Magic link sign-in is here</span>
              </span>

              <h1 className="reveal delay-1 mt-7 text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[68px]">
                <span className="text-gradient">Build and deploy</span>
                <br />
                <span className="text-gradient">on the developer cloud.</span>
              </h1>

              <p className="reveal delay-2 mt-7 max-w-xl text-body-lg leading-relaxed text-zinc-400">
                ForgeStack is a <span className="text-zinc-100">production-grade SaaS starter kit</span> with
                authentication, role-based access control, and a polished
                design system. Ship your next product in{" "}
                <span className="text-zinc-100">days, not months</span>.
              </p>

              <div className="reveal delay-3 mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="xl">
                  <Link href="/register">
                    Start deploying
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/login">View demo</Link>
                </Button>
                <Link
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 inline-flex items-center gap-2 px-2 py-1 font-mono text-caption-mono text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  <Github className="h-3.5 w-3.5" />
                  star on GitHub
                </Link>
              </div>

              {/* Live status row — social proof without making claims */}
              <div className="reveal delay-4 mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-caption text-mute">
                <span className="inline-flex items-center gap-2">
                  <span className="relative grid h-1.5 w-1.5 place-items-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-mono">v1.0 · stable</span>
                </span>
                <span className="hidden h-3 w-px bg-white/10 sm:block" />
                <span className="font-mono">Next.js 15 · React 19</span>
                <span className="hidden h-3 w-px bg-white/10 sm:block" />
                <span className="font-mono">Supabase · Prisma · Auth.js v5</span>
              </div>
            </div>

            {/* ── Right column: terminal preview ────────────────────────── */}
            <div className="reveal delay-2 lg:col-span-5">
              <CodeWindow filename="forgestack / install" language="bash">
                <span className="tk-comment"># clone, install, migrate, seed, run</span>
                {"\n"}$ git clone forgestack &&{" "}
                <span className="tk-fg">cd</span> forgestack
                {"\n"}$ pnpm install
                {"\n"}$ pnpm prisma:migrate
                {"\n"}$ pnpm prisma:seed
                {"\n"}$ pnpm dev
                {"\n"}
                {"\n"}
                <span className="tk-comment"># ForgeStack is now running</span>
                {"\n"}
                <span className="tk-punct">✓</span> Ready on <span className="tk-str">http://localhost:3000</span>
                {"\n"}
                <span className="tk-punct">✓</span> Database connected
                {"\n"}
                <span className="tk-punct">✓</span> Auth.js configured
                {"\n"}
                <span className="tk-punct">✓</span> Email provider: <span className="tk-fg">resend</span>
              </CodeWindow>

              {/* tiny trust strip under the terminal */}
              <div className="reveal delay-3 mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                <span>one command</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>~2 min setup</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>no vendor lock</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section
          id="features"
          className="relative border-t border-white/[0.06] py-24 sm:py-32"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            {/* Section heading: left-aligned with a live status pill on the right */}
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="badge-mono reveal">/ features</p>
                <h2 className="reveal delay-1 mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  <span className="text-gradient">Everything you need</span>
                  <br className="hidden sm:block" />{" "}
                  <span className="text-zinc-400">to launch.</span>
                </h2>
                <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                  Authentication, authorization, and a design system —
                  wired up and production-ready.{" "}
                  <span className="text-zinc-200">No glue code.</span>
                </p>
              </div>
              <div className="reveal delay-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                <span className="relative grid h-1.5 w-1.5 place-items-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                7 modules · all wired
              </div>
            </div>

            {/* Asymmetric grid: 1 big card + 4 small cards */}
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {/* Hero card — spans 2 columns, has rich content */}
              <article className="card-feature reveal lg:col-span-2 lg:p-8">
                <div className="flex items-center gap-3">
                  <IconContainer><Lock className="h-4 w-4" /></IconContainer>
                  <h3 className="text-[15px] font-semibold tracking-tight text-white">
                    Authentication &amp; sessions
                  </h3>
                  <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-mute sm:inline">
                    core
                  </span>
                </div>

                <p className="mt-4 text-body-md leading-relaxed text-zinc-400">
                  Every sign-in path your users expect, plus a server-side
                  session mirror so you can revoke from anywhere. Argon2id
                  passwords, hashed reset tokens, CSRF on every form.
                </p>

                {/* 2-column item list inside the hero card */}
                <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {[
                    ["Email + password", "argon2id, 19 MB / 2 iter"],
                    ["Google OAuth", "openid-connect, OIDC"],
                    ["GitHub OAuth", "OAuth 2.0, granular scopes"],
                    ["Magic link", "10-min TTL, single-use"],
                    ["Email verification", "24-hr token, auto-marked"],
                    ["Password reset", "1-hr token, hashed at rest"],
                    ["Per-device sessions", "UA, IP, last seen"],
                    ["Session revocation", "server-side mirror"],
                  ].map(([label, hint]) => (
                    <li
                      key={label}
                      className="flex items-start justify-between gap-3 border-t border-white/[0.04] pt-2.5 first:border-t-0 first:pt-0"
                    >
                      <span className="flex items-start gap-2.5 text-body-sm text-zinc-200">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                          strokeWidth={2.5}
                        />
                        {label}
                      </span>
                      <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-mute sm:inline">
                        {hint}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* footer stat row */}
                <div className="mt-7 flex items-center gap-6 border-t border-white/[0.06] pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                  <span>
                    <span className="text-zinc-200">4</span> providers
                  </span>
                  <span className="h-2.5 w-px bg-white/10" />
                  <span>
                    <span className="text-zinc-200">OWASP top 10</span> covered
                  </span>
                  <span className="h-2.5 w-px bg-white/10" />
                  <span>
                    <span className="text-zinc-200">CSRF</span> on every form
                  </span>
                </div>
              </article>

              {/* Smaller cards — vertical stack on the right */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="card-feature reveal">
                  <div className="flex items-center gap-3">
                    <IconContainer><ShieldCheck className="h-4 w-4" /></IconContainer>
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">
                      Authorization
                    </h3>
                  </div>
                  <p className="mt-4 text-body-sm leading-relaxed text-zinc-400">
                    Three roles out of the box. Composable guards for
                    routes, actions, and APIs.
                  </p>
                  <ul className="mt-5 space-y-2">
                    {["USER", "ADMIN", "SUPER_ADMIN"].map((r, i) => (
                      <li
                        key={r}
                        className="flex items-center justify-between border-t border-white/[0.04] pt-2 first:border-t-0 first:pt-0"
                      >
                        <span className="font-mono text-caption text-zinc-200">
                          {r}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                          {["seeded", "seeded", "super-admin only"][i]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="card-feature reveal">
                  <div className="flex items-center gap-3">
                    <IconContainer><Zap className="h-4 w-4" /></IconContainer>
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">
                      Design system
                    </h3>
                  </div>
                  <p className="mt-4 text-body-sm leading-relaxed text-zinc-400">
                    Tailwind v4 tokens, mesh gradient, stacked shadows.
                    Drop in your brand.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["tokens", "typography", "mesh", "shadows", "dark mode"].map(
                      (t) => (
                        <span
                          key={t}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300"
                        >
                          {t}
                        </span>
                      )
                    )}
                  </div>
                </article>
              </div>
            </div>

            {/* Tertiary row — three small "comes with" chips */}
            <div className="reveal delay-3 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.04] pt-6 text-caption text-mute">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                also ships with
              </span>
              {["Audit log", "Rate limiting", "CSRF tokens", "Security headers", "GDPR soft-delete"].map(
                (t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px]"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/30" />
                    {t}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── Code-window "Deploy" band ───────────────────────────────── */}
        <section
          id="security"
          className="relative border-t border-white/[0.06] py-24 sm:py-32"
        >
          {/* subtle background — grid */}
          <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-25" />

          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 sm:px-8 lg:grid-cols-12">
            {/* Left: copy + checklist */}
            <div className="reveal lg:col-span-5">
              <p className="badge-mono">/ deploy</p>
              <h2 className="reveal delay-1 mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                <span className="text-gradient">A compute model</span>
                <br />
                <span className="text-zinc-400">for all workloads.</span>
              </h2>
              <p className="reveal delay-2 mt-5 max-w-prose text-body-md leading-relaxed text-zinc-400">
                ForgeStack runs on Supabase Postgres and ships with{" "}
                <span className="text-zinc-200">migrations, a seed script,</span>{" "}
                and a documented schema. No more arguing about which auth
                library to use.
              </p>

              <ul className="reveal delay-3 mt-8 space-y-2.5">
                {[
                  ["Migrations + seed scripts", "out of the box"],
                  ["Documented Prisma schema", "every field, every index"],
                  ["Production-ready email templates", "React Email, themed"],
                  ["Security audit log", "append-only, searchable"],
                ].map(([label, hint]) => (
                  <li
                    key={label}
                    className="flex items-start justify-between gap-3 border-t border-white/[0.04] pt-2.5 first:border-t-0 first:pt-0"
                  >
                    <span className="flex items-start gap-2.5 text-body-sm text-zinc-200">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                        strokeWidth={2.5}
                      />
                      {label}
                    </span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-mute sm:inline">
                      {hint}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="reveal delay-4 mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Get started
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Star on GitHub
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: terminal with header bar + checkmarks */}
            <div className="reveal delay-1 lg:col-span-7">
              <CodeWindow filename="forgestack / install" language="bash">
                <span className="tk-comment"># clone, install, migrate, seed, run</span>
                {"\n"}$ git clone forgestack &&{" "}
                <span className="tk-fg">cd</span> forgestack
                {"\n"}$ pnpm install
                {"\n"}$ pnpm prisma:migrate
                {"\n"}$ pnpm prisma:seed
                {"\n"}$ pnpm dev
                {"\n"}
                {"\n"}
                <span className="tk-comment"># ForgeStack is now running</span>
                {"\n"}
                <span className="tk-punct">✓</span> Ready on{" "}
                <span className="tk-str">http://localhost:3000</span>
                {"\n"}
                <span className="tk-punct">✓</span> Database connected
                {"\n"}
                <span className="tk-punct">✓</span> Auth.js configured
                {"\n"}
                <span className="tk-punct">✓</span> Email provider:{" "}
                <span className="tk-fg">resend</span>
              </CodeWindow>
              <div className="reveal delay-2 mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                <span>~2 min setup</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>zero config</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>single port (3000)</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>SQLite → Postgres in prod</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── What's included / 6-up grid ──────────────────────────────── */}
        <section className="relative border-t border-white/[0.06] py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="badge-mono reveal">/ what you get</p>
                <h2 className="reveal delay-1 mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  <span className="text-gradient">Production-grade</span>
                  <br className="hidden sm:block" />{" "}
                  <span className="text-zinc-400">by default.</span>
                </h2>
                <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                  Everything you need to ship a real product,{" "}
                  <span className="text-zinc-200">wired up on day one.</span>
                </p>
              </div>
              <div className="reveal delay-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                6 modules · all wired
              </div>
            </div>

            {/* Asymmetric: 1 hero card spans 2, 4 cards in 2x2 */}
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="card-feature reveal lg:col-span-2 lg:p-8">
                <div className="flex items-center gap-3">
                  <IconContainer><Sparkles className="h-4 w-4" /></IconContainer>
                  <h3 className="text-[15px] font-semibold tracking-tight text-white">
                    Everything wired up
                  </h3>
                  <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-mute sm:inline">
                    full stack
                  </span>
                </div>
                <p className="mt-4 text-body-md leading-relaxed text-zinc-400">
                  ForgeStack ships as one cohesive codebase. Auth, sessions,
                  audit log, design system, billing-shaped data model — all
                  hooked up to the same Postgres database. No more wiring
                  your own auth to a separate service.
                </p>
                <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {[
                    ["Auth (4 providers)", "credentials · OAuth · magic link"],
                    ["Postgres + Prisma", "documented schema + migrations"],
                    ["Auth.js v5", "JWT + server-side session mirror"],
                    ["React Email", "verified, reset, magic-link templates"],
                    ["shadcn/ui primitives", "button, input, dialog, ...all"],
                    ["Tailwind v4 tokens", "drop in your brand"],
                  ].map(([label, hint]) => (
                    <li
                      key={label}
                      className="flex items-start justify-between gap-3 border-t border-white/[0.04] pt-2.5 first:border-t-0 first:pt-0"
                    >
                      <span className="flex items-start gap-2.5 text-body-sm text-zinc-200">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                          strokeWidth={2.5}
                        />
                        {label}
                      </span>
                      <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-mute sm:inline">
                        {hint}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              {/* Right column: 2 smaller cards stacked */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="card-feature reveal">
                  <div className="flex items-center gap-3">
                    <IconContainer><KeyRound className="h-4 w-4" /></IconContainer>
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">
                      Sessions
                    </h3>
                  </div>
                  <p className="mt-4 text-body-sm leading-relaxed text-zinc-400">
                    Server-side session mirror with UA, IP, and revoke.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["per-device", "revoke", "UA + IP", "last seen"].map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>

                <article className="card-feature reveal">
                  <div className="flex items-center gap-3">
                    <IconContainer><ShieldCheck className="h-4 w-4" /></IconContainer>
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">
                      RBAC
                    </h3>
                  </div>
                  <p className="mt-4 text-body-sm leading-relaxed text-zinc-400">
                    Three roles out of the box. Composable guards.
                  </p>
                  <ul className="mt-4 space-y-1.5">
                    {["USER", "ADMIN", "SUPER_ADMIN"].map((r) => (
                      <li
                        key={r}
                        className="flex items-center justify-between border-t border-white/[0.04] pt-1.5 first:border-t-0 first:pt-0"
                      >
                        <span className="font-mono text-caption text-zinc-200">
                          {r}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                          seeded
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>

            {/* Bottom row: 4 small "also comes with" chips */}
            <div className="reveal delay-3 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {INCLUDED.slice(0, 4).map((item) => (
                <article
                  key={item.title}
                  className="card-feature flex items-start gap-3 p-4"
                >
                  <IconContainer>{item.icon}</IconContainer>
                  <div className="min-w-0">
                    <h3 className="text-body-sm-strong text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-caption text-mute line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Buy this template (top of pricing area) ─────────────────── */}
        <section
          id="buy"
          className="relative border-t border-white/[0.06] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="grid items-stretch gap-4 lg:grid-cols-12">
              {/* Left: copy */}
              <div className="reveal lg:col-span-7">
                <p className="badge-mono">/ buy this template</p>
                <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  <span className="text-gradient">Get the code.</span>{" "}
                  <span className="text-zinc-400">Ship your SaaS this weekend.</span>
                </h2>
                <p className="mt-5 max-w-xl text-body-md leading-relaxed text-zinc-400">
                  You just spent five minutes poking around the live demo.{" "}
                  <span className="text-zinc-200">This is the same code.</span>{" "}
                  One payment, lifetime updates, build as many projects as you
                  want.
                </p>

                {/* What's in the kit */}
                <ul className="mt-7 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {[
                    ["Full source code", "Next.js 15 + Auth.js v5"],
                    ["Prisma schema + migrations", "documented, versioned"],
                    ["Tailwind v4 design system", "tokens + primitives"],
                    ["Email templates", "React Email, themed"],
                    ["In-app docs", "rendered from /docs"],
                    ["1 year of updates", "then buy updates separately"],
                  ].map(([label, hint]) => (
                    <li
                      key={label}
                      className="flex items-start justify-between gap-3 border-t border-white/[0.04] pt-2.5 first:border-t-0 first:pt-0"
                    >
                      <span className="flex items-start gap-2.5 text-body-sm text-zinc-200">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                          strokeWidth={2.5}
                        />
                        {label}
                      </span>
                      <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-mute sm:inline">
                        {hint}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="xl">
                    {/* TODO: replace with your real Gumroad URL */}
                    <a
                      href="https://yourname.gumroad.com/l/forgestack"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buy on Gumroad — $150
                      <ArrowUpRight className="ml-1.5 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="xl" variant="secondary">
                    <Link href="/getting-started">
                      Read the docs first
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                  14-day refund · instant access · commercial license
                </p>
              </div>

              {/* Right: license card */}
              <aside className="reveal delay-1 lg:col-span-5">
                <div className="card-feature h-full p-6 lg:p-7">
                  <div className="flex items-center gap-3">
                    <IconContainer>
                      <FileText className="h-4 w-4" />
                    </IconContainer>
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">
                      Commercial license
                    </h3>
                  </div>
                  <p className="mt-4 text-body-sm leading-relaxed text-zinc-400">
                    One payment, no subscription. Use in unlimited personal
                    and commercial projects.
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {[
                      ["✓ Use in unlimited projects", "personal + commercial"],
                      ["✓ Modify, rebrand, white-label", "your code, your brand"],
                      ["✓ No attribution required", "in the running UI"],
                      ["✗ Don't resell the source", "as a starter kit"],
                    ].map(([k, v]) => {
                      const allowed = k.startsWith("✓");
                      return (
                        <li
                          key={k}
                          className="flex items-start justify-between gap-3 border-t border-white/[0.04] pt-2.5 first:border-t-0 first:pt-0"
                        >
                          <span
                            className={`flex items-start gap-2.5 text-body-sm ${
                              allowed ? "text-zinc-200" : "text-zinc-500"
                            }`}
                          >
                            {k}
                          </span>
                          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-mute sm:inline">
                            {v}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* small FAQ */}
                  <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
                    {[
                      {
                        q: "Refunds?",
                        a: "14 days, no questions.",
                      },
                      {
                        q: "Support?",
                        a: "Community Discord + GitHub issues. No SLA.",
                      },
                      {
                        q: "Updates?",
                        a: "1 year of free updates. After that, buy a new license at 50% off.",
                      },
                    ].map((row) => (
                      <div key={row.q} className="flex items-start gap-4">
                        <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                          {row.q}
                        </span>
                        <span className="text-body-sm text-zinc-300">{row.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── What your SaaS would cost (the demo's pricing tiers) ──── */}
        <section
          id="pricing"
          className="relative border-t border-white/[0.06] py-24 sm:py-32"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="badge-mono reveal">/ pricing</p>
                <h2 className="reveal delay-1 mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  <span className="text-gradient">One price,</span>{" "}
                  <span className="text-zinc-400">all features.</span>
                </h2>
                <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                  This is what <span className="text-zinc-200">your customers</span>{" "}
                  would pay when they sign up for the SaaS you build on top
                  of ForgeStack.{" "}
                  <span className="text-mute">
                    (For the template itself, see <a href="#buy" className="text-zinc-200 underline decoration-zinc-700 underline-offset-4 hover:decoration-zinc-500">/ buy</a> above.)
                  </span>
                </p>
              </div>
              <div className="reveal delay-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                lifetime license
              </div>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              <PriceTier
                name="Hobby"
                price="$0"
                description="For side projects and prototypes."
                features={[
                  "Email + OAuth login",
                  "1,000 monthly active users",
                  "Community support",
                ]}
                cta="Start free"
                revealDelay={0}
              />
              <PriceTier
                name="Pro"
                price="$24"
                description="For production SaaS apps."
                featured
                features={[
                  "Everything in Hobby",
                  "Unlimited MAU",
                  "Magic link + email verification",
                  "Priority support",
                ]}
                cta="Start 14-day trial"
                revealDelay={1}
              />
              <PriceTier
                name="Team"
                price="$99"
                description="For larger teams."
                features={[
                  "Everything in Pro",
                  "SSO + SAML",
                  "Audit log",
                  "Dedicated support",
                ]}
                cta="Contact sales"
                revealDelay={2}
              />
            </div>

            {/* Pricing footer — comparison strip */}
            <div className="reveal delay-3 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-white/[0.04] bg-white/[0.015] px-5 py-3 font-mono text-[11px] text-mute">
              <span>all plans include:</span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} /> commercial license
              </span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} /> lifetime updates
              </span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} /> source included
              </span>
              <span className="h-2.5 w-px bg-white/10" />
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-400" strokeWidth={2.5} /> no telemetry
              </span>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-t border-white/[0.06] py-28 sm:py-36">
          <div className="bg-mesh-gradient pointer-events-none absolute inset-0 -z-10 opacity-80" />
          <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-30" />

          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
            {/* Left: copy + CTAs */}
            <div>
              <p className="badge-mono reveal">/ ship it</p>
              <h2 className="reveal delay-1 mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                <span className="text-gradient">Ship your next</span>
                <br />
                <span className="text-zinc-400">product faster.</span>
              </h2>
              <p className="reveal delay-2 mt-5 max-w-md text-body-md text-zinc-400 sm:text-lg">
                Stop rebuilding the same auth flow. Clone ForgeStack and go.
              </p>
              <div className="reveal delay-3 mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="xl">
                  <Link href="/register">
                    Create your account
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="secondary">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="reveal delay-4 mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                <span>Instant access</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>Lifetime updates</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>Commercial license</span>
              </p>
            </div>

            {/* Right: terminal preview card */}
            <div className="reveal delay-2">
              <CodeWindow filename="forge.sh" language="bash">
                <span className="tk-comment"># the only command you need</span>
                {"\n"}$ npx create-forgestack my-app
                {"\n"}
                {"\n"}
                <span className="tk-comment"># shipping checklist ✓</span>
                {"\n"}
                <span className="tk-punct">✓</span> auth{" "}
                <span className="tk-fg">credentials</span> +{" "}
                <span className="tk-fg">google</span> +{" "}
                <span className="tk-fg">github</span> +{" "}
                <span className="tk-fg">magic</span>
                {"\n"}
                <span className="tk-punct">✓</span> postgres + prisma{" "}
                <span className="tk-fg">schema</span>
                {"\n"}
                <span className="tk-punct">✓</span> sessions{" "}
                <span className="tk-fg">per device</span>, revoke
                {"\n"}
                <span className="tk-punct">✓</span> rbac{" "}
                <span className="tk-fg">3 roles</span>, composable guards
                {"\n"}
                <span className="tk-punct">✓</span> design{" "}
                <span className="tk-fg">tailwind v4</span>, dark mode
                {"\n"}
                <span className="tk-punct">✓</span> docs{" "}
                <span className="tk-fg">12 guides</span>, runnable
                {"\n"}
                {"\n"}
                <span className="tk-fg">$</span> cd my-app && pnpm dev
                {"\n"}$ <span className="tk-punct">▍</span>
              </CodeWindow>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  "What you get" data — referenced by the asymmetric section above   */
/* --------------------------------------------------------------------- */

const INCLUDED: Array<{ icon: React.ReactNode; title: string; body: string }> = [
  {
    icon: <KeyRound className="h-4 w-4" />,
    title: "Sessions",
    body: "Per-device sessions with IP and user-agent tracking. Revoke from anywhere.",
  },
  {
    icon: <Layers className="h-4 w-4" />,
    title: "RBAC",
    body: "Role-based access control with composable guards for routes, actions, and APIs.",
  },
  {
    icon: <Webhook className="h-4 w-4" />,
    title: "Webhooks",
    body: "Signed webhook delivery with retry and idempotency built into the core.",
  },
  {
    icon: <CreditCard className="h-4 w-4" />,
    title: "Billing-ready",
    body: "Stripe-shaped data model so subscriptions, invoices, and customers drop in cleanly.",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Design system",
    body: "Tokens, primitives, and components wired into a Tailwind v4 theme you can extend.",
  },
  {
    icon: <Gift className="h-4 w-4" />,
    title: "Email templates",
    body: "Verified, magic-link, and reset templates rendered with Resend and React Email.",
  },
];

/* --------------------------------------------------------------------- */
/*  Pricing card — `pricing-card` + `pricing-card-featured` recipes      */
/* --------------------------------------------------------------------- */

function PriceTier({
  name,
  price,
  description,
  features,
  cta,
  featured = false,
  revealDelay,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  revealDelay: number;
}) {
  return (
    <article
      className={
        featured
          ? "reveal relative rounded-xl border border-white/0 bg-white p-8 text-black shadow-elev-5"
          : "reveal card-feature p-8"
      }
      style={{ transitionDelay: `${revealDelay * 80}ms` }}
    >
      {featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white ring-1 ring-inset ring-white/20">
          Most popular
        </span>
      ) : null}

      <h3 className={featured ? "text-display-sm text-black" : "text-display-sm text-white"}>{name}</h3>
      <p className={featured ? "mt-2 text-body-sm text-zinc-700" : "mt-2 text-body-sm text-zinc-400"}>{description}</p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className={featured ? "text-display-lg text-black" : "text-display-lg text-white"}>{price}</span>
        <span className={featured ? "text-body-sm text-zinc-500" : "text-body-sm text-mute"}>/mo</span>
      </div>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li
            key={f}
            className={
              featured
                ? "flex items-start gap-2.5 text-body-sm text-zinc-800"
                : "flex items-start gap-2.5 text-body-sm text-zinc-300"
            }
          >
            <Check
              className={
                featured
                  ? "mt-0.5 h-3.5 w-3.5 shrink-0 text-black"
                  : "mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500"
              }
              strokeWidth={2}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          asChild
          size="lg"
          variant={featured ? "polarity" : "secondary"}
          className="w-full"
        >
          <Link href="/register">{cta}</Link>
        </Button>
      </div>
    </article>
  );
}
