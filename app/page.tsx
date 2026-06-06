import Link from "next/link";
import { ArrowRight, Github, Lock, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Marketing landing page.
 *
 * Three bands:
 *   1. Hero — sentence-case headline, period-terminated, mesh gradient backdrop.
 *   2. Features — 3-up card grid.
 *   3. CTA — polarity-flipped dark band.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft">
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="bg-mesh-gradient absolute inset-x-0 top-0 -z-10 h-[640px] opacity-30 blur-3xl"
          />
          <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 pb-24 pt-24 text-center md:pt-32">
            <Badge variant="violet" className="mb-6">
              <Sparkles className="mr-1 inline h-3 w-3" />
              New — Magic link sign-in
            </Badge>
            <h1 className="max-w-3xl text-display-xl text-ink">
              Build and deploy on the developer cloud.
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-body">
              ForgeStack is a production-grade SaaS starter kit with
              authentication, role-based access control, and a polished
              design system. Ship your next product in days, not months.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
            <p className="mt-6 font-mono text-caption-mono text-mute">
              $ git clone forgestack && cd forgestack && pnpm dev
            </p>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <section
          id="features"
          className="border-y border-hairline bg-canvas"
        >
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-caption-mono uppercase text-mute">
                What you get
              </p>
              <h2 className="mt-3 text-display-lg text-ink">
                Everything you need to launch.
              </h2>
              <p className="mt-4 text-body-md text-body">
                Authentication, authorization, and a design system — wired up
                and production-ready.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              <Feature
                icon={<Lock className="h-5 w-5" />}
                title="Authentication."
                body="Email + password, Google, GitHub, and magic links. Argon2id hashing, secure cookies, CSRF protection."
              />
              <Feature
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Authorization."
                body="Role-based access control with USER and ADMIN out of the box. Composable guards for any route."
              />
              <Feature
                icon={<Zap className="h-5 w-5" />}
                title="Vercel-style design."
                body="Tailwind v4 tokens, Geist typography, stacked-shadow elevation, and the brand mesh gradient."
              />
            </div>
          </div>
        </section>

        {/* ── Dark band ────────────────────────────────────────────────── */}
        <section className="bg-ink text-on-primary">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <p className="font-mono text-caption-mono uppercase text-mute">
                  Deploy
                </p>
                <h2 className="mt-3 text-display-lg text-on-primary">
                  A compute model for all workloads.
                </h2>
                <p className="mt-4 max-w-prose text-body-md text-on-primary/80">
                  ForgeStack runs on Supabase Postgres and ships with migrations,
                  a seed script, and a documented schema. No more arguing about
                  which auth library to use.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/register">Get started</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-on-primary/10 text-on-primary hover:bg-on-primary/20"
                  >
                    <Link href="https://github.com/" target="_blank" rel="noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      Star on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-md bg-canvas-soft-2 p-4 font-mono text-code text-ink shadow-elev-4">
                <pre className="overflow-x-auto">
{`$ pnpm install
$ pnpm prisma:migrate
$ pnpm prisma:seed
$ pnpm dev

✓ Ready on http://localhost:3000
✓ Database connected
✓ Auth.js configured
✓ Email provider: console`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="bg-canvas-soft">
          <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-caption-mono uppercase text-mute">
                Pricing
              </p>
              <h2 className="mt-3 text-display-lg text-ink">
                One price, all features.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
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
              />
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-canvas">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
            <Users className="mx-auto h-8 w-8 text-ink" aria-hidden />
            <h2 className="mt-6 text-display-lg text-ink">
              Ship your next product faster.
            </h2>
            <p className="mt-4 text-body-lg text-body">
              Stop rebuilding the same auth flow. Clone ForgeStack and go.
            </p>
            <div className="mt-8">
              <Button asChild size="xl">
                <Link href="/register">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-hairline bg-canvas p-6 shadow-elev-3">
      <div className="grid h-9 w-9 place-items-center rounded-sm bg-canvas-soft text-ink">
        {icon}
      </div>
      <h3 className="mt-4 text-display-sm text-ink">{title}</h3>
      <p className="mt-2 text-body-md text-body">{body}</p>
    </div>
  );
}

function PriceTier({
  name,
  price,
  description,
  features,
  cta,
  featured = false,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "rounded-lg bg-ink p-8 text-on-primary shadow-elev-4"
          : "rounded-lg border border-hairline bg-canvas p-8 shadow-elev-3"
      }
    >
      <h3 className="text-display-sm">{name}</h3>
      <p
        className={
          featured ? "mt-2 text-body-sm text-on-primary/80" : "mt-2 text-body-sm text-body"
        }
      >
        {description}
      </p>
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-display-lg">{price}</span>
        <span
          className={
            featured ? "text-body-sm text-on-primary/80" : "text-body-sm text-mute"
          }
        >
          /mo
        </span>
      </div>
      <ul className="mt-6 space-y-2 text-body-md">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span
              className={
                featured
                  ? "mt-2 h-1 w-1 rounded-full bg-on-primary"
                  : "mt-2 h-1 w-1 rounded-full bg-ink"
              }
            />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          asChild
          size="lg"
          variant={featured ? "secondary" : "primary"}
          className="w-full"
        >
          <Link href="/register">{cta}</Link>
        </Button>
      </div>
    </div>
  );
}
