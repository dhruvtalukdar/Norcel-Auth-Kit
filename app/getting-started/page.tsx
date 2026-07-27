/**
 * Norcel — Getting Started page.
 *
 * Renders `docs/getting-started.md` with a sticky sidebar nav.
 * The markdown is the single source of truth; the page is the
 * styled, on-brand presentation of it.
 *
 * Why a page + markdown: editors love greppable markdown, the
 * running app needs a styled docs surface, and one source keeps
 * them in sync.
 */
import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Getting started" };
export const dynamic = "force-dynamic";

const MD_PATH = path.join(process.cwd(), "docs", "getting-started.md");

type Section = { id: string; label: string; depth: 2 | 3 };

/**
 * Parse H2 / H3 headings out of a markdown string. The first H1 is
 * skipped — we render that as the page hero. Returns the remaining
 * sections in document order, suitable for a sidebar nav.
 */
function extractSections(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let skippedFirstH1 = false;
  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+?)\s*$/);
    const m3 = line.match(/^###\s+(.+?)\s*$/);
    const m = m3 ?? m2;
    if (!m) continue;
    if (!skippedFirstH1 && m2) {
      skippedFirstH1 = true;
      continue;
    }
    const label = m[1].trim();
    const id = slugify(label);
    sections.push({
      id,
      label,
      depth: m3 ? 3 : 2,
    });
  }
  return sections;
}

/** "How do I set up Resend?" → "how-do-i-set-up-resend" */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip the leading H1 — we render it as the page hero. */
function stripFirstH1(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let skipped = false;
  for (const line of lines) {
    if (!skipped && line.match(/^#\s+/)) {
      skipped = true;
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

export default async function GettingStartedPage() {
  const raw = await fs.readFile(MD_PATH, "utf8");
  const sections = extractSections(raw);
  // Index of every H2 (top-level section) for the number labels.
  const h2Index = new Map<string, number>();
  let n = 0;
  for (const s of sections) {
    if (s.depth === 2) {
      n += 1;
      h2Index.set(s.id, n);
    }
  }
  const body = stripFirstH1(raw);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden border-b border-white/[0.06] pb-16 pt-20 lg:pb-20 lg:pt-28">
          <div className="bg-mesh-gradient pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-80" />
          <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-30" />

          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            <span className="badge-eyebrow reveal">
              <BookOpen className="h-3 w-3" />
              <span>docs · getting started</span>
            </span>

            <h1 className="reveal delay-1 mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-[56px]">
              <span className="text-gradient">Getting started</span>{" "}
              <span className="text-zinc-400">with Norcel.</span>
            </h1>

            <p className="reveal delay-2 mt-5 max-w-2xl text-body-md text-zinc-400 sm:text-lg">
              Get Norcel running locally in ~5 minutes. Then read on
              for OAuth, project structure, and going to production.
            </p>

            <div className="reveal delay-3 mt-7 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
              <span className="inline-flex items-center gap-2">
                <FileText className="h-3 w-3" />
                source:{" "}
                <code className="rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-300">
                  docs/getting-started.md
                </code>
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>~10 min read</span>
            </div>
          </div>
        </section>

        {/* ── Body: sidebar + content ─────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Sidebar — sticky, desktop only */}
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-24">
                <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                  On this page
                </p>
                <nav className="flex flex-col">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={`rounded-md px-2 py-1.5 text-body-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white ${
                        s.depth === 3 ? "pl-5" : ""
                      }`}
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="lg:col-span-9">
              <div className="prose-forge">
                <ReactMarkdown
                  components={mdComponents(h2Index)}
                >
                  {body}
                </ReactMarkdown>
              </div>

              {/* Footer CTA */}
              <div className="mt-20 flex flex-col items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                    / end of guide
                  </p>
                  <p className="mt-1 text-body-md text-zinc-200">
                    Want to ship a real product on top of this?
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-body-sm-strong text-black transition-colors hover:bg-white/90"
                  >
                    Create your account
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-body-sm-strong text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom renderers for react-markdown                               */
/* ------------------------------------------------------------------ */

const mdComponents = (h2Index: Map<string, number>): Components => ({
  h1: ({ children, ...rest }) => {
    // h1 is the page hero — we already rendered it above.
    return null;
  },
  h2: ({ children, id, ...rest }) => {
    const label = String(children ?? "");
    const slug = id ?? slugify(label);
    const num = h2Index.get(slug);
    return (
      <h2
        id={slug}
        className="mt-16 flex items-baseline gap-3 scroll-mt-24 text-2xl font-semibold leading-tight tracking-[-0.03em] text-white first:mt-0 sm:text-3xl"
      >
        {num !== undefined ? (
          <span className="font-mono text-caption-mono text-mute">
            {String(num).padStart(2, "0")}
          </span>
        ) : null}
        <span>{children}</span>
      </h2>
    );
  },
  h3: ({ children, id, ...rest }) => {
    const label = String(children ?? "");
    const slug = id ?? slugify(label);
    return (
      <h3
        id={slug}
        className="mt-10 flex items-baseline gap-3 scroll-mt-24 text-lg font-semibold tracking-tight text-zinc-100"
      >
        <span>{children}</span>
      </h3>
    );
  },
  p: ({ children, ...rest }) => (
    <p
      className="mt-4 text-body-md leading-relaxed text-zinc-400 first:mt-0"
      {...rest}
    >
      {children}
    </p>
  ),
  a: ({ children, href, ...rest }) => {
    const isInternal = href?.startsWith("/") ?? false;
    if (isInternal) {
      return (
        <Link
          href={href as never}
          className="text-zinc-200 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-zinc-500"
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-zinc-200 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white hover:decoration-zinc-500"
      >
        {children}
      </a>
    );
  },
  ul: ({ children, ...rest }) => (
    <ul
      className="mt-4 space-y-2 text-body-md text-zinc-300 [&_li]:pl-1"
      {...rest}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-5 text-body-md text-zinc-300 marker:text-mute"
      {...rest}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...rest }) => (
    <li className="leading-relaxed" {...rest}>
      {children}
    </li>
  ),
  strong: ({ children, ...rest }) => (
    <strong className="font-semibold text-zinc-100" {...rest}>
      {children}
    </strong>
  ),
  em: ({ children, ...rest }) => (
    <em className="italic text-zinc-300" {...rest}>
      {children}
    </em>
  ),
  code: ({ className, children, ...rest }) => {
    // Inline code only — block code is handled by `pre`.
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 font-mono text-caption text-zinc-200"
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...rest }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/40 p-4 font-mono text-caption leading-relaxed text-zinc-200"
      {...rest}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...rest }) => (
    <blockquote
      className="mt-4 rounded-r-lg border-l-2 border-white/10 bg-white/[0.02] py-2 pl-4 pr-3 text-body-sm italic text-zinc-400"
      {...rest}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12 border-white/[0.06]" />,
  table: ({ children, ...rest }) => (
    <div className="mt-4 overflow-x-auto rounded-lg border border-white/[0.06]">
      <table className="w-full text-body-sm" {...rest}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...rest }) => (
    <th
      className="border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left font-mono text-caption uppercase tracking-[0.14em] text-mute"
      {...rest}
    >
      {children}
    </th>
  ),
  td: ({ children, ...rest }) => (
    <td
      className="border-b border-white/[0.04] px-3 py-2 text-zinc-300 last:border-b-0"
      {...rest}
    >
      {children}
    </td>
  ),
});
