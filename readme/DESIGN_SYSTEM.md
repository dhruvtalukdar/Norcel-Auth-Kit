# Norcel Design System

A reusable, copy-paste-ready design system extracted from the Norcel landing page.
Dark-mode first, Vercel-inspired, Tailwind v4 + Astro. Drop this into any new project and
you get a coherent visual language immediately.

---

## 1. Brand at a Glance

| Attribute | Value |
|---|---|
| **Mode** | Dark-first (single theme; the page is engineered to read as "dark by default") |
| **Inspiration** | Vercel / Geist design language |
| **Framework** | Tailwind CSS v4 (CSS-first `@theme` config, no `tailwind.config.js`) |
| **Component layer** | Astro (works equally well in Next.js / React / Vue — primitives are CSS + utility classes) |
| **Type system** | Geist (sans) + Geist Mono, loaded from Google Fonts |
| **Decoration** | One signature device: a multi-stop **mesh gradient** (cyan / blue / violet / magenta) used at hero scale only |
| **Voice** | Sentence-case headlines, often period-terminated. Negative letter-spacing on display sizes. Calm, engineered, terminal-aware. |
| **Display weight ceiling** | 600 (never 700+) |

---

## 2. Installation

```bash
npm i -D tailwindcss@latest
```

In your global stylesheet:

```css
@import "tailwindcss";

@theme {
  /* paste the token block from §3 below */
}
```

Fonts (in `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
/>
```

`<html class="dark">` and `<meta name="color-scheme" content="dark" />` are required for
the selection / scrollbar / form-control defaults to render correctly.

---

## 3. Design Tokens

### 3.1 Color tokens (paste into `@theme`)

```css
/* ---- Text (on dark canvas) ---- */
--color-ink: #fafafa;              /* primary text, headlines */
--color-ink-soft: #e5e5e5;         /* strong body */
--color-body: #a1a1a1;             /* secondary body */
--color-mute: #707070;             /* tertiary / placeholder */

/* ---- Canvas (dark surfaces) ---- */
--color-canvas: #0a0a0a;           /* page background */
--color-canvas-soft: #050505;      /* deeper canvas, footer */
--color-canvas-2: #111111;         /* code block, code window */
--color-canvas-3: #161616;         /* inset surface */

/* ---- Primary CTA (polarity flip on dark) ---- */
--color-primary: #fafafa;          /* near-white pill = primary button */
--color-on-primary: #0a0a0a;       /* text on primary */

/* ---- Hairlines / borders ---- */
--color-hairline: rgba(255, 255, 255, 0.08);
--color-hairline-strong: rgba(255, 255, 255, 0.16);

/* ---- Brand gradient stops ---- */
--color-gradient-develop-start: #007cf0;
--color-gradient-develop-end: #00dfd8;
--color-gradient-preview-start: #7928ca;
--color-gradient-preview-end: #ff0080;
--color-gradient-ship-start: #ff4d4d;
--color-gradient-ship-end: #f9cb28;

/* ---- Accents ---- */
--color-link: #0070f3;
--color-link-deep: #3291ff;
--color-cyan: #50e3c2;
--color-violet: #7928ca;
--color-pink: #ff0080;
```

### 3.2 Type scale

| Token | Size / Weight / Line / Tracking | Use |
|---|---|---|
| `display-xl` | 48 / 600 / 48 / -2.4px | Hero headline |
| `display-lg` | 32 / 600 / 40 / -1.28px | Section headline |
| `display-md` | 24 / 600 / 32 / -0.96px | Card-cluster headline, pricing tier name |
| `display-sm` | 20 / 600 / 28 / -0.6px | Inline display micro-heading |
| `body-lg` | 18 / 400 / 28 / 0 | Lead paragraph |
| `body-md` | 16 / 400 / 24 / 0 | Default body |
| `body-md-strong` | 16 / 500 / 24 / 0 | Bolded inline body |
| `body-sm` | 14 / 400 / 20 / -0.28px | Secondary body, nav link |
| `body-sm-strong` | 14 / 500 / 20 / -0.28px | Nav CTA label |
| `caption` | 12 / 400 / 16 / 0 | Footer secondary, badge label |
| `caption-mono` | 12 / 400 / 16 / 0 | Mono eyebrow / technical label |
| `code` | 13 / 400 / 20 / 0 | Inline code, terminal |
| `button-md` | 14 / 500 / 20 / 0 | Small / nav button |
| `button-lg` | 16 / 500 / 24 / 0 | Marketing pill button |

CSS variables for the font stack:

```css
--font-sans:
  Geist, "Geist Fallback", Inter, ui-sans-serif, system-ui,
  -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono:
  "Geist Mono", "Geist Mono Fallback", ui-monospace, SFMono-Regular,
  Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

Open-source substitutes if Geist is unavailable: **Inter** (400/500/600) for sans, **JetBrains Mono** or **IBM Plex Mono** for mono.

### 3.3 Radii

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | tightest inline pill |
| `sm` | 6px | in-app buttons, form inputs |
| `md` | 8px | feature cards |
| `lg` | 12px | pricing cards, code windows |
| `xl` | 16px | large card with hero image cap |
| `pill-sm` | 64px | tab-ghost pills |
| `pill` | 100px | **marketing CTA pill (canonical)** |
| `full` | 9999px | circular icon containers |

### 3.4 Container / spacing

```css
--container-page: 1200px;
--container-narrow: 960px;
```

Base unit = **4 px**. Scale: `xxs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · 2xl 40 · 3xl 48 · 4xl 64 · 5xl 96 · 6xl 128 · section 192`. Section padding: 64–96 px top/bottom. Hero: up to 192 px to give the mesh gradient room to breathe. Card interior: 24–32 px. Inline gap: 12–16 px.

---

## 4. The Mesh Gradient (signature decoration)

This is the **single decorative device** of the entire system. It floats behind hero
sections and feature bands. Do not miniaturise, do not crop, do not reduce to one
colour, do not use it as a button fill.

```html
<div class="mesh-gradient" aria-hidden="true"></div>
```

```css
.mesh-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(50% 50% at 20% 25%,
      rgba(0, 124, 240, 0.35) 0%, transparent 70%),     /* blue */
    radial-gradient(45% 45% at 80% 20%,
      rgba(121, 40, 202, 0.32) 0%, transparent 70%),    /* violet */
    radial-gradient(50% 50% at 70% 80%,
      rgba(255, 0, 128, 0.28) 0%, transparent 70%),     /* pink */
    radial-gradient(40% 40% at 30% 85%,
      rgba(0, 223, 216, 0.22) 0%, transparent 70%);     /* cyan */
  filter: blur(60px) saturate(140%);
  -webkit-mask-image: radial-gradient(
    ellipse 80% 60% at 50% 30%,
    black 0%, black 40%, transparent 90%
  );
  mask-image: radial-gradient(
    ellipse 80% 60% at 50% 30%,
    black 0%, black 40%, transparent 90%
  );
  opacity: 0.9;
  z-index: 0;
}
```

**Grid noise overlay** — a 56 px grid of 1 px hairlines, used to ground the mesh on
light/dark sections and add an "engineered" texture:

```css
.grid-noise {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  background-position: -1px -1px;
}
```

**Brand gradient text** (use sparingly — for the 4-stop signature only):

```css
.text-gradient-brand {
  background: linear-gradient(90deg, #007cf0 0%, #00dfd8 50%, #ff0080 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

**White fade gradient text** (the more common hero treatment):

```css
.text-gradient {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
```

---

## 5. Reusable Component Classes

Drop these into a `@layer components {}` block.

```css
@layer components {
  /* ---- Buttons (canonical pill, 100 px radius) ---- */
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-full
      bg-white px-5 text-sm font-medium text-black
      transition-all duration-200
      hover:bg-white/90 hover:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40
      h-10 sm:h-11;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-full
      bg-white/5 px-5 text-sm font-medium text-white
      ring-1 ring-inset ring-white/10
      transition-all duration-200
      hover:bg-white/10 hover:ring-white/20
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
      h-10 sm:h-11;
  }
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-1.5 rounded-full
      px-3 text-sm text-zinc-400 transition-colors duration-200
      hover:text-white;
  }

  /* ---- Badges / labels ---- */
  .badge-eyebrow {
    @apply inline-flex items-center gap-2 rounded-full
      bg-white/[0.04] px-3 py-1 text-xs text-zinc-300
      ring-1 ring-inset ring-white/[0.08];
  }
  .badge-mono {
    @apply font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500;
  }

  /* ---- Surfaces ---- */
  .hairline    { @apply border-white/[0.08]; }
  .card        {
    @apply rounded-xl border border-white/[0.08] bg-white/[0.02]
      shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_1px_rgba(0,0,0,0.2),0_8px_24px_-8px_rgba(0,0,0,0.4)];
  }
  .card-feature {
    @apply rounded-xl border border-white/[0.08] bg-white/[0.02]
      p-6 transition-colors duration-300
      hover:bg-white/[0.04] hover:border-white/[0.14];
  }
  .code-block  {
    @apply rounded-xl border border-white/[0.08] bg-[#0d0d0d]
      font-mono text-[13px] leading-6 text-zinc-300
      shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_30px_60px_-20px_rgba(0,0,0,0.6)];
  }
  .container-page {
    @apply mx-auto w-full max-w-[1200px] px-6 sm:px-8;
  }
}
```

---

## 6. Elevation Ladder

The system never uses a single heavy drop shadow. Every elevated surface is a **stacked
shadow + inset hairline** to fake natural light.

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No shadow, no border. | Full-bleed bands, polarity-flipped sections. |
| 1 — Inset hairline | `0 0 0 1px rgba(255,255,255,0.04) inset` | Default card chrome on dark. |
| 2 — Subtle drop | inset + `0 1px 1px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.4)` | Standard card. |
| 3 — Soft stack | inset + `0 2px 8px rgba(0,0,0,0.3), 0 16px 32px -8px rgba(0,0,0,0.4)` | Feature card. |
| 4 — Float stack | inset + `0 30px 60px -20px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(0,0,0,0.5)` | Code window, hero card, large callout. |
| 5 — Modal | inset + `0 30px 80px -20px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.5)` | Modal / dialog / dropdown. |

Rule of thumb: more than one offset, low opacity, no blur over 80 px, always paired
with an inset 1 px ring so the card edge stays crisp on dark.

---

## 7. Code Window / Code Block

The canonical "this is a developer product" surface. Used in the hero, feature
sections, and anywhere you want a technical feel.

```html
<div class="code-window">
  <div class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
    <div class="code-dots"><span></span><span></span><span></span></div>
    <div class="font-mono text-[11px] text-zinc-500">norcel / auth.ts</div>
    <div class="font-mono text-[11px] text-zinc-600">TypeScript</div>
  </div>
  <pre class="overflow-x-auto p-6 text-[13px] leading-[1.7]"><code>...</code></pre>
</div>
```

```css
.code-window {
  position: relative;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, #0a0a0a 0%, #060606 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 30px 80px -20px rgba(0, 0, 0, 0.7),
    0 8px 24px -8px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.code-window .code-dots { display: inline-flex; gap: 6px; }
.code-window .code-dots span {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.code-window .code-dots span:nth-child(1) { background: #ff5f57; opacity: 0.55; }
.code-window .code-dots span:nth-child(2) { background: #febc2e; opacity: 0.55; }
.code-window .code-dots span:nth-child(3) { background: #28c840; opacity: 0.55; }
```

### 7.1 Syntax tokens

The token palette is the brand: pink keyword, cyan function, amber string, salmon number, blue type. Apply via class.

```css
.tk-comment { color: #6b7280; }
.tk-keyword { color: #ff79c6; }
.tk-fn     { color: #50e3c2; }
.tk-str    { color: #f9cb28; }
.tk-num    { color: #ff8a65; }
.tk-var    { color: #fafafa; }
.tk-type   { color: #007cf0; }
.tk-punct  { color: #a1a1a1; }
.tk-tag    { color: #ff79c6; }
.tk-attr   { color: #50e3c2; }
.tk-prop   { color: #fafafa; }
.tk-meta   { color: #6b7280; }
```

---

## 8. Animation

Two reveal curves, both with a strong ease-out so motion reads as confident rather than floaty.

```css
@keyframes reveal-up {
  0%   { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes reveal-fade { 0% { opacity: 0; } 100% { opacity: 1; } }

.reveal {
  opacity: 0; transform: translateY(16px);
  will-change: opacity, transform;
  transition:
    opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.is-visible { opacity: 1; transform: translateY(0); }
.reveal-fade { opacity: 0; transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1); }
.reveal-fade.is-visible { opacity: 1; }
.reveal-up   { animation: reveal-up 800ms cubic-bezier(0.16, 1, 0.3, 1) both; }

/* Stagger helpers (80 ms steps) */
.delay-1 { transition-delay: 80ms;  animation-delay: 80ms; }
.delay-2 { transition-delay: 160ms; animation-delay: 160ms; }
.delay-3 { transition-delay: 240ms; animation-delay: 240ms; }
.delay-4 { transition-delay: 320ms; animation-delay: 320ms; }
.delay-5 { transition-delay: 400ms; animation-delay: 400ms; }
```

**Marquee** for logo strips / trust bars (40 s loop, pauses on hover):

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee { display: flex; width: max-content; animation: marquee 40s linear infinite; }
.marquee:hover { animation-play-state: paused; }
```

IntersectionObserver to toggle `is-visible`:

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
document.querySelectorAll(".reveal, .reveal-fade").forEach((el) => io.observe(el));
```

---

## 9. Common Page Patterns (copy these blocks)

### 9.1 Sticky top nav (logo left, links centre, CTAs right)

```html
<header class="sticky top-0 z-50 w-full border-b border-white/[0.06]
               bg-[#0a0a0a]/70 backdrop-blur-xl
               supports-[backdrop-filter]:bg-[#0a0a0a]/60">
  <div class="container-page flex h-16 items-center justify-between gap-6">
    <a href="/" class="flex items-center gap-2 text-white">
      <span class="grid h-7 w-7 place-items-center rounded-md bg-white text-black
                   font-mono text-[12px] font-semibold">F</span>
      <span class="text-[15px] font-semibold tracking-tight">Brand</span>
    </a>
    <nav class="hidden md:block">
      <ul class="flex items-center gap-1">
        <li><a class="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors
                      hover:bg-white/[0.04] hover:text-white" href="#">Link</a></li>
      </ul>
    </nav>
    <div class="hidden items-center gap-2 md:flex">
      <a class="btn-ghost" href="#">Ghost</a>
      <a class="btn-primary" href="#">Primary</a>
    </div>
  </div>
</header>
```

### 9.2 Hero (mesh gradient + headline + lead + CTA row + visual)

```html
<section class="relative isolate overflow-hidden pb-24 pt-20 lg:pb-32 lg:pt-32">
  <div class="mesh-gradient" aria-hidden="true"></div>
  <div class="grid-noise absolute inset-0 -z-10 opacity-40" aria-hidden="true"></div>

  <div class="container-page relative">
    <div class="mx-auto max-w-2xl text-center">
      <span class="badge-eyebrow reveal">
        <span class="relative grid h-1.5 w-1.5 place-items-center">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full
                       bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        </span>
        Live · Production-ready
      </span>

      <h1 class="reveal delay-1 mt-8 text-balance text-5xl font-semibold leading-[1.05]
                 tracking-[-0.04em] sm:text-6xl lg:text-[64px]">
        <span class="text-gradient">Headline that fades from white to soft white.</span>
      </h1>

      <p class="reveal delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed
                text-zinc-400 sm:text-lg">
        One-sentence lead that explains what the product is and why it matters.
      </p>

      <div class="reveal delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a class="btn-primary h-11 w-full px-6 sm:w-auto" href="#">Primary CTA →</a>
        <a class="btn-secondary h-11 w-full px-6 sm:w-auto" href="#">Secondary</a>
      </div>
    </div>
  </div>
</section>
```

### 9.3 Feature card (3-up grid)

```html
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <article class="card-feature reveal">
    <div class="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08]
                bg-black/40 text-zinc-200 ring-1 ring-inset ring-white/[0.04]">★</div>
    <h3 class="mt-4 text-lg font-semibold tracking-tight text-white">Feature title</h3>
    <p class="mt-2 text-sm leading-relaxed text-zinc-400">One-sentence description.</p>
  </article>
  <!-- repeat -->
</div>
```

### 9.4 Pricing card (default + featured polarity-flip)

```html
<div class="grid gap-4 lg:grid-cols-3">
  <article class="card p-8">
    <h3 class="text-xl font-semibold tracking-tight text-white">Starter</h3>
    <p class="mt-1 text-sm text-zinc-400">For solo developers.</p>
    <p class="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white">$0<span class="text-base text-zinc-500">/mo</span></p>
    <ul class="mt-6 space-y-2 text-sm text-zinc-300">
      <li>• Feature one</li><li>• Feature two</li>
    </ul>
    <a class="btn-secondary mt-8 w-full" href="#">Get started</a>
  </article>

  <article class="card p-8 ring-1 ring-inset ring-white/[0.16]">
    <span class="badge-mono">Most popular</span>
    <h3 class="mt-3 text-xl font-semibold tracking-tight text-white">Pro</h3>
    <p class="mt-1 text-sm text-zinc-400">For serious teams.</p>
    <p class="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white">$29<span class="text-base text-zinc-500">/mo</span></p>
    <ul class="mt-6 space-y-2 text-sm text-zinc-300">
      <li>• Everything in Starter</li><li>• Priority support</li>
    </ul>
    <a class="btn-primary mt-8 w-full" href="#">Start free trial</a>
  </article>

  <article class="card p-8">
    <!-- Enterprise tier, same shape as Starter -->
  </article>
</div>
```

### 9.5 FAQ accordion

```html
<div class="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
  <div data-faq-item data-open="false" class="group">
    <button data-faq-toggle aria-expanded="false"
            class="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
      <span class="text-base font-medium text-white">Question?</span>
      <svg class="h-4 w-4 text-zinc-400 transition-transform group-data-[open=true]:rotate-45"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
    <div class="max-h-0 overflow-hidden px-6 opacity-0 transition-all duration-300
                group-data-[open=true]:max-h-96 group-data-[open=true]:opacity-100">
      <p class="pb-5 text-sm leading-relaxed text-zinc-400">Answer.</p>
    </div>
  </div>
</div>
```

```js
document.querySelectorAll("[data-faq-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest("[data-faq-item]");
    if (!item) return;
    const open = item.dataset.open === "true";
    item.dataset.open = String(!open);
    btn.setAttribute("aria-expanded", String(!open));
  });
});
```

### 9.6 Section eyebrow + headline (canonical band)

```html
<section class="py-24 sm:py-32">
  <div class="container-page">
    <div class="mx-auto max-w-2xl text-center">
      <p class="badge-mono reveal">// section-id</p>
      <h2 class="reveal delay-1 mt-4 text-balance text-3xl font-semibold tracking-[-0.04em]
                 sm:text-4xl">
        <span class="text-gradient">Section headline that fades white.</span>
      </h2>
      <p class="reveal delay-2 mt-4 text-base leading-relaxed text-zinc-400">
        One-sentence supporting copy.
      </p>
    </div>
  </div>
</section>
```

---

## 10. Component Library (extracted from this app)

The following components exist in `src/components/` and are safe to copy wholesale
into a new project (they're framework-agnostic Astro markup driven entirely by
Tailwind utility classes):

| Component | Purpose |
|---|---|
| `Hero` | Mesh-gradient hero with headline, CTA row, and a stack visual. |
| `Navbar` | Sticky top nav, mobile drawer. |
| `Problem` | Pain-point narrative block. |
| `Solution` | The answer / framing block. |
| `Features` | 3-up feature card grid. |
| `EverythingYouNeed` | Long feature checklist section. |
| `WhatYouGet` | Itemized "what's in the box" section. |
| `Why` | Differentiator list. |
| `CodePreview` | Full-width code window with syntax tokens. |
| `Screenshots` | Product screenshot showcase. |
| `Comparison` | Side-by-side "us vs them" table. |
| `Testimonials` | Social-proof grid. |
| `Gift` | Bonus / lead-magnet block. |
| `FAQ` | Accordion list. |
| `FinalCTA` | Closing pitch + primary CTA. |
| `Footer` | 4-column footer with mono-eyebrow column labels. |

---

## 11. Responsive Strategy

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 600px | Hero stacks, nav collapses to hamburger, 3-up grids → 1-up. |
| Tablet | 600–959px | 3-up grids → 2-up. |
| Desktop | 960–1199px | Full 3-up grids, pricing 3-up. |
| Wide | 1200–1399px | Container caps at 1200 px (`.container-page`). |
| Ultra-wide | ≥ 1400 px | Content stays centred at 1200 px. |

Touch targets: marketing CTAs ≥ 44 px tall; nav buttons inflate with padding on mobile
to meet the 44 × 44 floor.

---

## 12. Voice & Copy Rules

- **Sentence-case headlines**, often period-terminated. ("Build and deploy on the AI Cloud.")
- **Negative letter-spacing** on every display size. Reverting to default tracking breaks the voice.
- **Weight 600 is the display ceiling.** Never 700 / 800.
- **Mono is for the technical layer only**: code blocks, terminal mockups, eyebrows (`// section-id`), file paths, version numbers.
- **Period-terminate** hero/feature headlines — that full stop is part of the brand.
- **No all-caps** outside of mono labels.

---

## 13. Do's and Don'ts

### Do

- Reserve `bg-white text-black` (the `btn-primary` recipe) for every conversion target. The white pill IS the CTA.
- Use `rounded-full` (100 px pill) for every marketing CTA. Use `rounded-md` (6 px) for in-app / nav buttons. The two pill scales coexist deliberately — pick a scale per context and stay there.
- Layer stacked shadows + inset hairline, never a single heavy drop.
- Use the mesh gradient as atmospheric decoration at hero / section scale only.
- Cycle surfaces `canvas` → `canvas-2` → `canvas-3`; the only "depth" between bands is a polarity swap to `bg-white text-black` for the most important callout.
- Set every code block and technical eyebrow in `font-mono`. The mono voice is the platform.

### Don't

- Don't introduce a sixth accent colour. The brand operates with the white/gray ladder + the four-pair gradient palette.
- Don't render headlines in all-caps.
- Don't drop a single heavy `shadow-2xl` on cards. Stacked small offsets only.
- Don't render the mesh gradient at icon scale or in a single-colour reduced form.
- Don't promote the geometric sans to weight 700+.
- Don't set body paragraphs in the mono face.
- Don't reuse `canvas-soft` / `canvas-2` to fake a "card on a card" — there is only one card surface. Inner contrast comes from `bg-white/[0.04]` and `border-white/[0.08]`.

---

## 14. Quick-Start Checklist for a New App

1. Create the project (Astro / Next / Vite — all work).
2. Install Tailwind v4.
3. Drop `DESIGN_SYSTEM.md` tokens into `@theme {}` in your global stylesheet.
4. Add the Geist + Geist Mono `<link>` tags.
5. Add `<html class="dark">` and `<meta name="color-scheme" content="dark" />`.
6. Copy the `.mesh-gradient`, `.code-window`, `.btn-primary` / `.btn-secondary`, `.card-feature` blocks.
7. Use `.container-page` for the outer wrapper of every section.
8. Reach for `.text-gradient` (white fade) for hero headlines, `.text-gradient-brand` (4-stop) for one signature callout only.
9. Apply the section eyebrow pattern (`badge-mono`) + `.text-gradient` headline + supporting `text-zinc-400` paragraph.
10. Wire the `IntersectionObserver` once in a root layout for the `.reveal` / `.reveal-fade` system.
11. Ship.

---

## 15. Token Cheat Sheet (Tailwind utility names that map to this system)

| Want | Use |
|---|---|
| Page background | `bg-[#0a0a0a]` (or `bg-canvas` after token) |
| Primary text | `text-white` / `text-zinc-100` |
| Secondary text | `text-zinc-400` |
| Muted text | `text-zinc-500` |
| Card chrome | `rounded-xl border border-white/[0.08] bg-white/[0.02]` |
| Feature card hover | add `hover:bg-white/[0.04] hover:border-white/[0.14]` |
| Hairline divider | `border-white/[0.08]` / `border-white/[0.06]` |
| Primary CTA | `.btn-primary` (or `rounded-full bg-white px-5 text-sm font-medium text-black h-10 sm:h-11`) |
| Secondary CTA | `.btn-secondary` (or `rounded-full bg-white/5 ring-1 ring-inset ring-white/10 ...`) |
| Mono eyebrow | `font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500` |
| White-fade headline | `<span class="text-gradient">…</span>` |
| Brand rainbow text | `<span class="text-gradient-brand">…</span>` (sparingly) |
| Hero padding | `pt-20 pb-24 lg:pt-32 lg:pb-32` |
| Section padding | `py-24 sm:py-32` |
| Display headline | `text-3xl sm:text-4xl font-semibold tracking-[-0.04em]` (escalate to `text-5xl sm:text-6xl lg:text-[64px]` for hero) |

---

## 16. Files of Record (in this repo)

- `src/styles/global.css` — token + component + animation source of truth.
- `src/layouts/Layout.astro` — `<head>`, fonts, `IntersectionObserver`, mobile nav, FAQ script.
- `src/components/` — page-level components (copy-pasteable).
- `DESIGN.md` — the original Vercel-design-analysis YAML (light-mode reference; **not** the dark-mode implementation used here).

---

*Last updated 2026-06-28. Maintained alongside the Norcel landing page. When you
change a token, change it here first; treat this file as the canonical reference for
any new project that reuses the system.*
