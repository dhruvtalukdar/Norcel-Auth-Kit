import Link from "next/link";
import {
  ArrowRight,
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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden pb-24 pt-20 lg:pb-32 lg:pt-32">
          {/* mesh gradient + grid noise, both aria-hidden */}
          <div className="bg-mesh-gradient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] opacity-90" />
          <div className="grid-noise absolute inset-0 -z-10 opacity-40" />

          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="badge-eyebrow reveal">
                <span className="relative grid h-1.5 w-1.5 place-items-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                New — Magic link sign-in
              </span>

              <h1 className="reveal delay-1 mt-8 text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-[64px]">
                <span className="text-gradient">
                  Build and deploy on the developer cloud.
                </span>
              </h1>

              <p className="reveal delay-2 mx-auto mt-6 max-w-2xl text-body-lg text-zinc-400">
                ForgeStack is a production-grade SaaS starter kit with
                authentication, role-based access control, and a polished
                design system. Ship your next product in days, not months.
              </p>

              <div className="reveal delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl">
                  <Link href="/register">
                    Start Deploying
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/login">View Demo</Link>
                </Button>
              </div>

              <p className="reveal delay-4 mt-8 font-mono text-caption-mono text-mute">
                $ git clone forgestack && cd forgestack && pnpm dev
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section
          id="features"
          className="relative border-t border-white/[0.06] py-24 sm:py-32"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="badge-mono reveal">/ features</p>
              <h2 className="reveal delay-1 mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                <span className="text-gradient">Everything you need to launch.</span>
              </h2>
              <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                Authentication, authorization, and a design system — wired up
                and production-ready.
              </p>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Feature
                icon={<Lock className="h-4 w-4" />}
                title="Authentication"
                body="Email + password, Google, GitHub, and magic links. Argon2id hashing, secure cookies, CSRF protection."
                items={["Email + password", "OAuth providers", "Magic links", "Argon2id hashing"]}
                revealDelay={0}
              />
              <Feature
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Authorization"
                body="Role-based access control with USER and ADMIN out of the box. Composable guards for any route."
                items={["USER + ADMIN roles", "Composable guards", "Server + middleware", "Session management"]}
                revealDelay={1}
              />
              <Feature
                icon={<Zap className="h-4 w-4" />}
                title="Vercel-style design"
                body="Tailwind v4 tokens, Geist typography, stacked-shadow elevation, and the brand mesh gradient."
                items={["Tailwind v4 tokens", "Geist typography", "Mesh gradient", "Stacked shadows"]}
                revealDelay={2}
              />
            </div>
          </div>
        </section>

        {/* ── Code-window "Deploy" band ───────────────────────────────── */}
        <section id="security" className="relative border-t border-white/[0.06] py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
            <div className="reveal">
              <p className="badge-mono">/ deploy</p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                <span className="text-gradient">A compute model for all workloads.</span>
              </h2>
              <p className="mt-5 max-w-prose text-body-md text-zinc-400">
                ForgeStack runs on Supabase Postgres and ships with migrations,
                a seed script, and a documented schema. No more arguing about
                which auth library to use.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Migrations + seed scripts out of the box",
                  "Documented Prisma schema",
                  "Production-ready email templates",
                  "Security audit log built in",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-body-sm text-zinc-300"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500"
                      strokeWidth={2}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register">Get started</Link>
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
            <div className="reveal delay-1">
              <CodeWindow filename="forgestack / install" language="bash">
                <span className="tk-comment"># clone, install, migrate, seed, run</span>
                {"\n"}$ git clone forgestack && cd forgestack
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
                <span className="tk-punct">✓</span> Email provider: console
              </CodeWindow>
            </div>
          </div>
        </section>

        {/* ── What's included / 6-up grid ──────────────────────────────── */}
        <section className="relative border-t border-white/[0.06] py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="badge-mono reveal">/ what you get</p>
              <h2 className="reveal delay-1 mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                <span className="text-gradient">Production-grade by default.</span>
              </h2>
              <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                Everything you need to ship a real product, wired up on day one.
              </p>
            </div>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((item, i) => (
                <Included
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  body={item.body}
                  revealDelay={i % 3}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing (with polarity-flipped middle card) ──────────────── */}
        <section id="pricing" className="relative border-t border-white/[0.06] py-24 sm:py-32">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="badge-mono reveal">/ pricing</p>
              <h2 className="reveal delay-1 mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                <span className="text-gradient">One price, all features.</span>
              </h2>
              <p className="reveal delay-2 mt-5 text-body-md text-zinc-400">
                Pay once. Use forever. No per-seat, no metered surprises.
              </p>
            </div>
            <div className="mt-16 grid gap-4 lg:grid-cols-3">
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
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-t border-white/[0.06] py-28 sm:py-36">
          <div className="bg-mesh-gradient pointer-events-none absolute inset-0 -z-10 opacity-80" />
          <div className="grid-noise absolute inset-0 -z-10 opacity-30" />

          <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
            <p className="badge-mono reveal">/ ship it</p>
            <h2 className="reveal delay-1 mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Ship your next product faster.</span>
            </h2>
            <p className="reveal delay-2 mx-auto mt-6 max-w-xl text-body-md text-zinc-400 sm:text-lg">
              Stop rebuilding the same auth flow. Clone ForgeStack and go.
            </p>
            <div className="reveal delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/register">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="reveal delay-4 mt-8 font-mono text-caption-mono uppercase tracking-[0.2em] text-mute">
              Instant access · Lifetime updates · Commercial license
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* --------------------------------------------------------------------- */
/*  Feature card — `card-feature` recipe from the design system           */
/* --------------------------------------------------------------------- */

function Feature({
  icon,
  title,
  body,
  items,
  revealDelay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  items: string[];
  revealDelay: number;
}) {
  return (
    <article
      className="card-feature reveal"
      style={{ transitionDelay: `${revealDelay * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <IconContainer>{icon}</IconContainer>
        <h3 className="text-[15px] font-semibold tracking-tight text-white">
          {title}
        </h3>
      </div>
      <p className="mt-4 text-body-md text-zinc-400">{body}</p>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-body-sm text-zinc-300"
          >
            <Check
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500"
              strokeWidth={2}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Included({
  icon,
  title,
  body,
  revealDelay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  revealDelay: number;
}) {
  return (
    <article
      className="card-feature reveal"
      style={{ transitionDelay: `${revealDelay * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <IconContainer>{icon}</IconContainer>
        <h3 className="text-[15px] font-semibold tracking-tight text-white">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-body-sm leading-relaxed text-zinc-400">{body}</p>
    </article>
  );
}

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
