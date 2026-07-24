# Component Design Catalog

A visual + code reference for every card, button, badge, and supporting component used
in the Norcel landing page. Copy any block into a new project to recreate the look
exactly.

All values are dark-mode native. Tokens are referenced as Tailwind v4 utilities
(`bg-white/[0.04]`, `text-zinc-400`, etc.) and also given as raw hex / rgba so the
recipes work in any framework.

---

## 0. The Color Palette at a Glance

### 0.1 Canvas ladder (backgrounds)
| Token | Value | Use |
|---|---|---|
| `canvas` | `#0a0a0a` | page background, default surface |
| `canvas-soft` | `#050505` | not used directly; reserved for full-bleed darker bands |
| `canvas-2` | `#111111` | code-window inner, code block |
| `canvas-3` | `#161616` | code block, very rare inset surface |

### 0.2 White-alpha tints (the entire decorative system)
The brand **never** uses light grays or "card gray" colors. Every card, badge, hover
state, and overlay is built from **white-on-black at 2–14% opacity**.

| Token | Value | Use |
|---|---|---|
| `white/2` | `rgba(255,255,255,0.02)` | card resting fill |
| `white/4` | `rgba(255,255,255,0.04)` | card hover fill, icon container fill, progress track, button secondary |
| `white/6` | `rgba(255,255,255,0.06)` | nav border, table column divider, footer divider |
| `white/8` | `rgba(255,255,255,0.08)` | card border, badge border, hairline default |
| `white/10` | `rgba(255,255,255,0.10)` | icon-button border, ring-inset |
| `white/14` | `rgba(255,255,255,0.14)` | card hover border, FAQ open state |
| `white/16` | `rgba(255,255,255,0.16)` | hairline-strong (rare), inset ring on featured cards |
| `white/20` | `rgba(255,255,255,0.20)` | nav top highlight stripe |
| `white/30` | `rgba(255,255,255,0.30)` | link underline (resting) |

### 0.3 Text colors
| Token | Tailwind | Use |
|---|---|---|
| `text-ink` | `text-white` | headlines, primary button label, primary nav text |
| `text-ink-soft` | `text-zinc-100` | quotes, near-white body |
| `text-body` | `text-zinc-200` | body emphasis, FAQ open text |
| `text-body-2` | `text-zinc-300` | icon-on-card, secondary body, card titles |
| `text-secondary` | `text-zinc-400` | default body, lead paragraphs, captions |
| `text-mute` | `text-zinc-500` | metadata, mono labels, monospace captions, fine print |
| `text-faint` | `text-zinc-600` | "language" tags, deemphasised chrome |
| `text-disabled` | `text-zinc-700` | decorative quote glyph |

### 0.4 Accent colors (functional, not decorative)
| Color | Hex | Where it appears |
|---|---|---|
| Emerald (success) | `#34d399 / #10b981` | "live" ping dot, comparison "win" checkmark, "best" pill |
| Amber (offer) | `#fbbf24 / #f59e0b` | gift/offer section, free pill, progress bar |
| Blue (link) | `#0070f3` | (reserved, not used in marketing surface) |
| Cyan (accent) | `#50e3c2` | (reserved, only inside code-block syntax tokens) |
| Pink (accent) | `#ff79c6` | (reserved, only inside code-block syntax tokens) |

### 0.5 Shadow ladder
| Level | CSS | Use |
|---|---|---|
| s-1 | `0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 1px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.4)` | `.card` |
| s-2 | `0 0 0 1px rgba(255,255,255,0.04) inset, 0 30px 60px -20px rgba(0,0,0,0.6)` | `.code-block` |
| s-3 | `0 0 0 1px rgba(255,255,255,0.04) inset, 0 30px 80px -20px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.5)` | `.code-window` |
| s-4 | `0 0 0 1px rgba(255,255,255,0.04) inset, 0 30px 60px -20px rgba(0,0,0,0.7)` | hero side-card |
| s-5 | `0 0 0 1px rgba(255,255,255,0.08) inset, 0 30px 60px -20px rgba(0,0,0,0.7)` | featured verdict card (pol-flip) |

### 0.6 Signature mesh gradient (full CSS)
Used at hero scale and behind final-CTA section. Never miniaturise.

```css
background:
  radial-gradient(50% 50% at 20% 25%, rgba(0, 124, 240, 0.35) 0%, transparent 70%),
  radial-gradient(45% 45% at 80% 20%, rgba(121, 40, 202, 0.32) 0%, transparent 70%),
  radial-gradient(50% 50% at 70% 80%, rgba(255, 0, 128, 0.28) 0%, transparent 70%),
  radial-gradient(40% 40% at 30% 85%, rgba(0, 223, 216, 0.22) 0%, transparent 70%);
filter: blur(60px) saturate(140%);
mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, black 40%, transparent 90%);
```

### 0.7 Section divider
Every section starts with a 1 px `border-t border-white/[0.06]` — the only break
between bands. No background changes between sections.

---

## 1. Buttons

### 1.1 Primary button (the canonical CTA pill)

The single most-used component. Near-white pill, black label, 100 px radius. Lives
in nav, hero, final CTA, and pricing.

```html
<a class="btn-primary h-11 px-6">
  Get Norcel
  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
</a>
```

| Property | Value |
|---|---|
| Background | `bg-white` (`#ffffff`) |
| Text | `text-black` |
| Border radius | `rounded-full` (100 px) |
| Padding | `px-5` (20 px) — widen to `px-6` / `px-7` in hero contexts |
| Height | `h-10` mobile, `h-11` (44 px) tablet+, `h-12` (48 px) for hero/final-CTA |
| Font | `text-sm font-medium` (14 px / 500) — bump to `text-[15px]` for hero |
| Resting shadow | none |
| Hover | `bg-white/90` + `shadow-[0_0_0_4px_rgba(255,255,255,0.06)]` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-white/40` |
| Transition | `transition-all duration-200` |
| Icon gap | `gap-2` (8 px), icon `h-4 w-4` |

### 1.2 Secondary button (paired with primary)

```html
<a class="btn-secondary h-11 px-6 sm:w-auto">See what's included</a>
```

| Property | Value |
|---|---|
| Background | `bg-white/5` |
| Text | `text-white` |
| Border | `ring-1 ring-inset ring-white/10` |
| Border radius | `rounded-full` |
| Hover | `bg-white/10` + `ring-white/20` |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-white/30` |

### 1.3 Ghost button (nav links, utility actions)

```html
<a class="btn-ghost">
  <svg class="h-4 w-4">…</svg>
  <span>GitHub</span>
</a>
```

| Property | Value |
|---|---|
| Background | none |
| Text | `text-zinc-400` |
| Padding | `px-3 py-1.5` |
| Border radius | `rounded-full` |
| Hover | `hover:text-white` (no background) |
| Icon | `h-4 w-4`, 1.5 px stroke |

### 1.4 Icon-only circular button (social, toolbar)

```html
<a class="grid h-9 w-9 place-items-center rounded-md text-zinc-400
          ring-1 ring-inset ring-white/10 transition-colors
          hover:bg-white/[0.04] hover:text-white">
  <svg class="h-4 w-4">…</svg>
</a>
```

| Property | Value |
|---|---|
| Shape | `h-9 w-9` square (36 px) — use `rounded-full` for true circle |
| Border | `ring-1 ring-inset ring-white/10` |
| Resting | `text-zinc-400` |
| Hover | `bg-white/[0.04] text-white` |
| Icon | `h-4 w-4` |

### 1.5 Nav link (centered nav row)

```html
<a class="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors duration-200
          hover:bg-white/[0.04] hover:text-white">Features</a>
```

### 1.6 Hamburger button (mobile)

```html
<button class="grid h-9 w-9 place-items-center rounded-md text-zinc-300
               ring-1 ring-inset ring-white/10 transition-colors
               hover:bg-white/[0.04] hover:text-white md:hidden">
  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.8" stroke-linecap="round">
    <line x1="3" y1="7" x2="21" y2="7"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="17" x2="21" y2="17"/>
  </svg>
</button>
```

### 1.7 Button-row layout (canonical)

```html
<div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
  <a class="btn-primary h-11 w-full px-6 sm:w-auto">Primary</a>
  <a class="btn-secondary h-11 w-full px-6 sm:w-auto">Secondary</a>
</div>
```

Stack on mobile (`flex-col`), inline on `sm:`. Gap `3` (12 px) is canonical.

---

## 2. Cards

All cards share the same three-layer DNA: **white-tint background + white-tint border + stacked shadow + optional hover state**. There is exactly one card shape; everything below is a variation of how it's dressed.

### 2.1 The DNA (one-line)

```
rounded-xl border border-white/[0.08] bg-white/[0.02] p-6
+ shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_1px_rgba(0,0,0,0.2),0_8px_24px_-8px_rgba(0,0,0,0.4)]
```

Two utility classes already encode this in `global.css`:

```css
.card        { @apply rounded-xl border border-white/[0.08] bg-white/[0.02] shadow-[…s-1…]; }
.card-feature { @apply rounded-xl border border-white/[0.08] bg-white/[0.02] p-6
                       transition-colors duration-300
                       hover:bg-white/[0.04] hover:border-white/[0.14]; }
```

### 2.2 Feature card (3-up section)

Used in `Features.astro` — 3-column grid, icon + title + bulleted list.

```html
<article class="card-feature">
  <div class="flex items-center gap-3">
    <span class="grid h-9 w-9 place-items-center rounded-lg
                 border border-white/[0.08] bg-white/[0.04]">
      <svg class="h-4 w-4 text-zinc-300" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
           stroke-linejoin="round"><!-- icon paths --></svg>
    </span>
    <h3 class="text-[15px] font-semibold tracking-tight text-white">Authentication</h3>
  </div>
  <ul class="mt-5 space-y-2.5">
    <li class="flex items-start gap-2.5 text-sm text-zinc-300">
      <svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span>Email & Password Login</span>
    </li>
    <!-- repeat -->
  </ul>
</article>
```

| Property | Value |
|---|---|
| Border radius | `rounded-xl` (12 px) |
| Background | `bg-white/[0.02]` |
| Border | `border-white/[0.08]` |
| Padding | `p-6` (24 px) |
| Hover bg | `bg-white/[0.04]` |
| Hover border | `border-white/[0.14]` |
| Icon container | `h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.04]` |
| Icon | `h-4 w-4 text-zinc-300`, stroke `1.6` |
| Title | `text-[15px] font-semibold tracking-tight text-white` |
| List spacing | `space-y-2.5` (10 px) |
| List item | `text-sm text-zinc-300` |
| Check icon | `h-3.5 w-3.5 text-zinc-500`, stroke `2` |

### 2.3 Testimonial card (variation of feature card)

Same DNA. Adds a top quote glyph and a footer row with avatar + name.

```html
<figure class="card-feature flex h-full flex-col">
  <svg class="h-6 w-6 text-zinc-700" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.34v-6.83H5.17A3 3 0 0 1 7.17 9V6Zm9.66 0a5.17 5.17 0 0 0-5.17 5.17V18H18v-6.83h-3.17A3 3 0 0 1 16.83 9V6Z"/>
  </svg>
  <blockquote class="mt-5 flex-1 text-[15px] leading-relaxed text-zinc-200">
    "Norcel saved us about three weeks…"
  </blockquote>
  <figcaption class="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full
                 bg-gradient-to-br from-zinc-700 to-zinc-900
                 font-mono text-[12px] font-semibold text-zinc-200">MO</span>
    <div class="text-sm">
      <div class="font-medium text-white">Maya Okafor</div>
      <div class="text-zinc-500">Staff Engineer · Northwind Labs</div>
    </div>
  </figcaption>
</figure>
```

| Property | Value |
|---|---|
| Quote glyph | `h-6 w-6 text-zinc-700` |
| Quote text | `text-[15px] leading-relaxed text-zinc-200` |
| Divider | `border-t border-white/[0.06] pt-5` |
| Avatar | `h-9 w-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900` |
| Avatar text | `font-mono text-[12px] font-semibold text-zinc-200` |
| Name | `text-sm font-medium text-white` |
| Meta | `text-sm text-zinc-500` |

### 2.4 Hero side card (the "stack" card)

Floating card on the right of the hero. Larger shadow, blurred backdrop, top accent line.

```html
<div class="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5
            shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_30px_60px_-20px_rgba(0,0,0,0.7)]
            backdrop-blur-sm sm:p-6">
  <div class="absolute -top-px left-6 right-6 h-px
              bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  <!-- content -->
</div>
```

| Property | Value |
|---|---|
| Border radius | `rounded-2xl` (16 px) |
| Padding | `p-5` mobile, `p-6` tablet+ |
| Top accent | `-top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent` |
| Backdrop | `backdrop-blur-sm` |
| Shadow | `s-4` (heavy) |

### 2.5 FAQ item (interactive card)

A border + bg card that animates open. The + icon rotates 45° to become ×.

```html
<li data-faq-item data-open="false"
    class="rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors">
  <button data-faq-toggle aria-expanded="false"
          class="flex w-full items-center justify-between gap-4 px-5 py-4 text-left
                 text-[15px] font-medium text-white sm:px-6 sm:py-5">
    <span>What technologies are used?</span>
    <svg class="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  </button>
  <div class="grid max-h-0 overflow-hidden px-5 opacity-0 transition-all duration-300
              data-[open=true]:max-h-[600px] data-[open=true]:opacity-100 sm:px-6">
    <p class="pb-5 text-sm leading-relaxed text-zinc-400 sm:pb-6">
      Answer text.
    </p>
  </div>
</li>
```

Open state (CSS):
```css
[data-faq-item][data-open="true"] svg            { transform: rotate(45deg); }
[data-faq-item][data-open="true"]                { background-color: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.14); }
[data-faq-item] > div[data-open]                 { grid-template-rows: 0fr; }
[data-faq-item] > div[data-open="true"]          { grid-template-rows: 1fr; }
```

| Property | Value |
|---|---|
| Resting bg | `bg-white/[0.02]` |
| Open bg | `bg-white/[0.04]` |
| Resting border | `border-white/[0.08]` |
| Open border | `border-white/[0.14]` |
| Question text | `text-[15px] font-medium text-white` |
| Answer text | `text-sm leading-relaxed text-zinc-400` |
| Padding | `px-5 py-4` mobile, `sm:px-6 sm:py-5` tablet+ |
| Spacing between items | `space-y-2` |
| + icon | `h-4 w-4 text-zinc-500`, rotates 45° when open |

### 2.6 Pricing card / verdict card (default + featured)

The featured card is a **polarity flip**: black background, white text, same shape.

```html
<!-- Default tier -->
<article class="card p-8">
  <h3 class="text-xl font-semibold tracking-tight text-white">Starter</h3>
  <p class="mt-1 text-sm text-zinc-400">For solo developers.</p>
  <p class="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white">
    $0<span class="text-base text-zinc-500">/mo</span>
  </p>
  <ul class="mt-6 space-y-2 text-sm text-zinc-300"><!-- features --></ul>
  <a class="btn-secondary mt-8 w-full" href="#">Get started</a>
</article>

<!-- Featured tier (polarity flip) -->
<article class="card border-white/0 bg-black text-white p-8
               shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_30px_60px_-20px_rgba(0,0,0,0.7)]">
  <span class="badge-mono">Most popular</span>
  <h3 class="mt-3 text-xl font-semibold tracking-tight text-white">Pro</h3>
  <p class="mt-1 text-sm text-zinc-400">For serious teams.</p>
  <p class="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white">
    $29<span class="text-base text-zinc-500">/mo</span>
  </p>
  <ul class="mt-6 space-y-2 text-sm text-zinc-300"><!-- features --></ul>
  <a class="btn-primary mt-8 w-full" href="#">Start free trial</a>
</article>
```

| Property | Default | Featured |
|---|---|---|
| Background | `bg-white/[0.02]` | `bg-black` |
| Border | `border-white/[0.08]` | `border-white/0` (replaced by inset ring) |
| Inset ring | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` (stronger) |
| Drop shadow | `s-1` | `0 30px 60px -20px rgba(0,0,0,0.7)` |
| Tier name | `text-xl font-semibold tracking-tight text-white` | same |
| Description | `text-sm text-zinc-400` | same |
| Price | `text-4xl font-semibold tracking-[-0.04em] text-white` | same |
| Price suffix | `text-base text-zinc-500` | same |
| CTA | `btn-secondary` | `btn-primary` (polarity-flip the button too) |
| Padding | `p-8` (32 px) | `p-8` |

### 2.7 Comparison table (data table)

The "Forge vs Scratch vs OSS" table. Desktop = grid table, mobile = stacked cards.

```html
<div class="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
  <!-- Column headers -->
  <div class="grid grid-cols-[minmax(180px,1.2fr)_1fr_1fr_1fr] border-b border-white/[0.06]">
    <div class="px-6 py-5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
      Feature
    </div>
    <div class="flex items-center justify-center border-l border-white/[0.06] px-4 py-5
                text-center bg-white/[0.04]">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-white">Norcel</span>
      <span class="ml-2 rounded-full bg-emerald-500/10 px-1.5 py-0.5
                   font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300
                   ring-1 ring-inset ring-emerald-500/30">best</span>
    </div>
    <div class="border-l border-white/[0.06] px-4 py-5 text-center">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">From Scratch</span>
    </div>
    <div class="border-l border-white/[0.06] px-4 py-5 text-center">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Open source</span>
    </div>
  </div>

  <!-- Rows -->
  <div role="table" class="divide-y divide-white/[0.06]">
    <div role="row" class="grid grid-cols-[minmax(180px,1.2fr)_1fr_1fr_1fr]
                          transition-colors hover:bg-white/[0.02]">
      <div role="cell" class="px-6 py-4 text-sm font-medium text-white">Time to Launch</div>
      <div role="cell" class="flex items-center gap-2 border-l border-white/[0.06] px-4 py-4
                              text-sm bg-white/[0.04] text-white">
        <svg class="h-3.5 w-3.5 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Days
      </div>
      <div role="cell" class="flex items-center gap-2 border-l border-white/[0.06] px-4 py-4
                              text-sm text-zinc-400">
        <svg class="h-3.5 w-3.5 shrink-0 text-zinc-600" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        2–3 months
      </div>
      <div role="cell" class="flex items-center gap-2 border-l border-white/[0.06] px-4 py-4
                              text-sm text-zinc-400">
        <span class="h-1 w-1 rounded-full bg-zinc-500"></span>
        Weeks (setup)
      </div>
    </div>
    <!-- repeat rows -->
  </div>
</div>
```

| Property | Value |
|---|---|
| Container | `rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden` |
| Header row border | `border-b border-white/[0.06]` |
| Header text | `font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500` |
| Featured header bg | `bg-white/[0.04]` |
| Column divider | `border-l border-white/[0.06]` |
| Row divider | `divide-y divide-white/[0.06]` |
| Row hover | `hover:bg-white/[0.02]` |
| Featured cell bg | `bg-white/[0.04] text-white` |
| Win check | `h-3.5 w-3.5 text-emerald-400` (stroke 2) |
| Loss X | `h-3.5 w-3.5 text-zinc-600` (stroke 1.8) |
| Neutral dot | `h-1 w-1 rounded-full bg-zinc-500` |
| Cell padding | `px-4 py-4` |
| Feature cell | `px-6 py-4 text-sm font-medium text-white` |

### 2.8 Gift / offer card (amber accent)

The single accent-colored card on the page. Amber border + amber gradient haze.

```html
<article class="relative overflow-hidden rounded-2xl border border-amber-500/20
                bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-transparent">
  <!-- Soft corner glows -->
  <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full
              bg-amber-500/10 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full
              bg-orange-500/10 blur-3xl"></div>

  <div class="relative grid grid-cols-1 gap-10 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr]
              lg:gap-16 lg:p-14">
    <!-- Left: heading + CTA -->
    <!-- Right: gift detail card with progress bar -->
  </div>
</article>
```

Gift detail card (sits inside the gift block):
```html
<div class="rounded-xl border border-white/[0.08] bg-black/30 p-6 backdrop-blur-sm">
  <div class="flex items-center gap-2">
    <span class="grid h-9 w-9 place-items-center rounded-lg
                 border border-amber-500/30 bg-amber-500/10 text-amber-300
                 ring-1 ring-inset ring-amber-500/20"><!-- gift icon --></span>
    <div>
      <div class="text-sm font-medium text-white">Free gift included</div>
      <div class="font-mono text-[11px] text-zinc-500">for the first 50 customers</div>
    </div>
  </div>
  <h3 class="mt-5 text-xl font-semibold tracking-tight text-white">Norcel UI Kit</h3>
  <p class="mt-1 text-sm text-zinc-400">A premium component library…</p>
  <ul class="mt-5 space-y-2.5">
    <li class="flex items-start gap-2.5 text-sm text-zinc-200">
      <svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300"><!-- check --></svg>
      <span>40+ production-ready components</span>
    </li>
  </ul>

  <!-- Progress bar -->
  <div class="mt-6 border-t border-white/[0.06] pt-5">
    <div class="flex items-center justify-between text-[12px]">
      <span class="font-mono uppercase tracking-[0.16em] text-zinc-500">Offer remaining</span>
      <span class="font-mono text-zinc-300"><span class="text-white">32</span> <span class="text-zinc-500">/ 50 left</span></span>
    </div>
    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
      <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
           style="width: 64%"></div>
    </div>
  </div>
</div>
```

| Property | Value |
|---|---|
| Outer card border | `border-amber-500/20` |
| Outer card background | `bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-transparent` |
| Inner detail card | `rounded-xl border border-white/[0.08] bg-black/30 backdrop-blur-sm` |
| Pill text | `text-amber-300` |
| Pill border | `ring-1 ring-inset ring-amber-500/30` |
| Pill background | `bg-amber-500/10` |
| Icon container | `border-amber-500/30 bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20` |
| Check icon | `h-3.5 w-3.5 text-amber-300` |
| Progress track | `h-1.5 overflow-hidden rounded-full bg-white/[0.04]` |
| Progress fill | `h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500` |

### 2.9 Final CTA section card (none — section IS the card)

The final-CTA section is just a centered text block over the mesh gradient — no card
chrome, no border. The mesh gradient is the surface.

```html
<section class="relative isolate overflow-hidden border-t border-white/[0.06] py-28 sm:py-36">
  <div class="mesh-gradient" aria-hidden="true"></div>
  <div class="container-page relative">
    <div class="mx-auto max-w-2xl text-center">
      <p class="badge-mono">/ ship it</p>
      <h2 class="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
        <span class="text-gradient">Launch your SaaS faster.</span>
      </h2>
      <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
        Skip weeks of authentication development and start building your product today.
      </p>
      <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a class="btn-primary h-12 w-full px-7 text-[15px] sm:w-auto">Primary →</a>
        <a class="btn-secondary h-12 w-full px-7 text-[15px] sm:w-auto">Secondary</a>
      </div>
      <p class="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        Instant access · Lifetime updates · Commercial license
      </p>
    </div>
  </div>
</section>
```

---

## 3. Badges, Tags, and Labels

### 3.1 Section eyebrow (the `badge-mono`)

The single most-repeated element on the page. Above every section headline.

```html
<p class="badge-mono">/ features</p>
```

```css
.badge-mono {
  @apply font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500;
}
```

| Property | Value |
|---|---|
| Font | `font-mono` |
| Size | `text-[11px]` (11 px) |
| Case | `uppercase` |
| Tracking | `tracking-[0.18em]` (loose, +18%) |
| Color | `text-zinc-500` |
| Leading | default |

### 3.2 Pill badge (eyebrow, status)

```html
<!-- Default eyebrow pill (lives above the hero headline) -->
<span class="badge-eyebrow">
  <span class="relative grid h-1.5 w-1.5 place-items-center">
    <span class="absolute inline-flex h-full w-full animate-ping rounded-full
                 bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
  </span>
  Production-Grade SaaS Starter Kit
</span>
```

```css
.badge-eyebrow {
  @apply inline-flex items-center gap-2 rounded-full
    bg-white/[0.04] px-3 py-1 text-xs text-zinc-300
    ring-1 ring-inset ring-white/[0.08];
}
```

### 3.3 Status tag ("best", "ready", "free", "$99 value")

```html
<span class="rounded-full bg-emerald-500/10 px-1.5 py-0.5
             font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300
             ring-1 ring-inset ring-emerald-500/30">best</span>

<span class="rounded-full bg-amber-500/10 px-1.5 py-0.5
             font-mono text-[9px] uppercase tracking-[0.16em] text-amber-300
             ring-1 ring-inset ring-amber-500/30">free</span>
```

| Property | Value |
|---|---|
| Shape | `rounded-full` |
| Background | `bg-{color}-500/10` (10% opacity) |
| Border | `ring-1 ring-inset ring-{color}-500/30` |
| Text | `text-{color}-300` (300 shade for contrast) |
| Font | `font-mono text-[9px] uppercase tracking-[0.16em]` |
| Padding | `px-1.5 py-0.5` |

Color variants used: **emerald** (best/win), **amber** (offer/free), **white/[0.04] + zinc-400** (neutral).

### 3.4 Live ping dot (hero only)

```html
<span class="relative grid h-1.5 w-1.5 place-items-center">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full
               bg-emerald-400 opacity-75"></span>
  <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
</span>
```

The static inner dot is `bg-emerald-400`; the outer ring is the same color with
`animate-ping` for the radar-pulse effect.

### 3.5 Gift / icon container (36 × 36 square)

```html
<span class="grid h-9 w-9 place-items-center rounded-lg
             border border-white/[0.08] bg-white/[0.04]">
  <svg class="h-4 w-4 text-zinc-300"><!-- icon --></svg>
</span>
```

Variant (amber accent):
```html
<span class="grid h-9 w-9 place-items-center rounded-lg
             border border-amber-500/30 bg-amber-500/10 text-amber-300
             ring-1 ring-inset ring-amber-500/20">
  <svg class="h-4 w-4"><!-- icon --></svg>
</span>
```

---

## 4. Navigation

### 4.1 Sticky top nav

```html
<header class="sticky top-0 z-50 w-full border-b border-white/[0.06]
               bg-[#0a0a0a]/70 backdrop-blur-xl
               supports-[backdrop-filter]:bg-[#0a0a0a]/60">
  <div class="container-page flex h-16 items-center justify-between gap-6">
    <!-- logo -->
    <a href="/" class="flex items-center gap-2 text-white">
      <span class="grid h-7 w-7 place-items-center rounded-md bg-white text-black
                   font-mono text-[12px] font-semibold">F</span>
      <span class="text-[15px] font-semibold tracking-tight">Norcel</span>
    </a>
    <!-- centered links -->
    <nav class="hidden md:block">
      <ul class="flex items-center gap-1">
        <li><a class="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors duration-200
                      hover:bg-white/[0.04] hover:text-white" href="#">Features</a></li>
      </ul>
    </nav>
    <!-- right cluster -->
    <div class="hidden items-center gap-2 md:flex">
      <a class="btn-ghost" href="#">Sign In</a>
      <a class="btn-primary" href="#">Get Norcel</a>
    </div>
    <!-- mobile hamburger -->
    <button class="grid h-9 w-9 place-items-center rounded-md text-zinc-300
                   ring-1 ring-inset ring-white/10 transition-colors
                   hover:bg-white/[0.04] hover:text-white md:hidden">…</button>
  </div>
</header>
```

| Property | Value |
|---|---|
| Sticky | `sticky top-0 z-50` |
| Bottom border | `border-b border-white/[0.06]` |
| Background | `bg-[#0a0a0a]/70 backdrop-blur-xl` |
| Fallback (no backdrop support) | `supports-[backdrop-filter]:bg-[#0a0a0a]/60` |
| Height | `h-16` (64 px) |
| Logo container | `h-7 w-7 rounded-md bg-white text-black` |
| Logo text | `font-mono text-[12px] font-semibold` |
| Wordmark | `text-[15px] font-semibold tracking-tight text-white` |

### 4.2 Mobile drawer

```html
<div id="nav-menu" data-nav-menu data-open="false"
     class="border-t border-white/[0.06] bg-[#0a0a0a] md:hidden">
  <div class="container-page grid max-h-0 overflow-hidden opacity-0 transition-all duration-300
              data-[open=true]:max-h-[600px] data-[open=true]:opacity-100"
       data-open="false">
    <ul class="flex flex-col gap-1 py-4">
      <li><a class="block rounded-md px-3 py-2 text-sm text-zinc-300
                    hover:bg-white/[0.04] hover:text-white" href="#">Features</a></li>
      <li class="mt-2 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
        <a class="btn-primary w-full" href="#">Get Norcel</a>
      </li>
    </ul>
  </div>
</div>
```

Toggle script:
```js
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu   = document.querySelector("[data-nav-menu]");
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = navMenu.dataset.open === "true";
    navMenu.dataset.open = String(!open);
    navToggle.setAttribute("aria-expanded", String(!open));
  });
}
```

---

## 5. Footer

```html
<footer class="relative border-t border-white/[0.06] bg-[#0a0a0a]">
  <div class="container-page py-16 sm:py-20">
    <div class="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_2fr]">

      <!-- Brand column -->
      <div>
        <a href="/" class="flex items-center gap-2 text-white">
          <span class="grid h-7 w-7 place-items-center rounded-md bg-white text-black
                       font-mono text-[12px] font-semibold">F</span>
          <span class="text-[15px] font-semibold tracking-tight">Brand</span>
        </a>
        <p class="mt-4 max-w-xs text-sm text-zinc-400">
          One-sentence description of what the product is.
        </p>
        <div class="mt-6 flex items-center gap-3">
          <a class="grid h-9 w-9 place-items-center rounded-md text-zinc-400
                    ring-1 ring-inset ring-white/10 transition-colors
                    hover:bg-white/[0.04] hover:text-white" href="#" aria-label="GitHub">
            <svg class="h-4 w-4">…</svg>
          </a>
        </div>
      </div>

      <!-- Link columns -->
      <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
        <div>
          <h3 class="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Product</h3>
          <ul class="mt-4 space-y-3">
            <li><a class="text-sm text-zinc-400 transition-colors hover:text-white" href="#">Features</a></li>
          </ul>
        </div>
        <!-- repeat -->
      </div>
    </div>

    <div class="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06]
                pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center">
      <p>© 2026 Brand. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <a class="hover:text-white" href="#">Privacy</a>
        <a class="hover:text-white" href="#">Terms</a>
      </div>
    </div>
  </div>
</footer>
```

| Property | Value |
|---|---|
| Top border | `border-t border-white/[0.06]` |
| Background | `bg-[#0a0a0a]` (solid, no transparency — always opaque at bottom of page) |
| Padding | `py-16 sm:py-20` |
| Grid | `1fr` mobile, `1.4fr 2fr` desktop |
| Column label | `font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500` |
| Column links | `text-sm text-zinc-400 hover:text-white` |
| Column spacing | `space-y-3` (12 px) |
| Bottom bar | `mt-16 border-t border-white/[0.06] pt-8` |
| Bottom bar text | `text-sm text-zinc-500 hover:text-white` |
| Social icon | `h-9 w-9 rounded-md ring-1 ring-inset ring-white/10` |

---

## 6. Section Headers (the repeating pattern)

Every content section on the page uses this exact same shape:

```html
<section class="relative border-t border-white/[0.06] py-24 sm:py-32">
  <div class="container-page">
    <div class="mx-auto max-w-2xl text-center">
      <p class="reveal badge-mono">/ section-id</p>
      <h2 class="reveal delay-1 mt-4 text-balance text-3xl font-semibold leading-tight
                 tracking-[-0.02em] sm:text-4xl lg:text-5xl">
        <span class="text-gradient">Section headline that fades white.</span>
      </h2>
      <p class="reveal delay-2 mt-5 text-balance text-base text-zinc-400 sm:text-lg">
        One-sentence supporting copy.
      </p>
    </div>
  </div>
</section>
```

| Property | Value |
|---|---|
| Section padding | `py-24 sm:py-32` (96 / 128 px) |
| Container | `container-page` (max-w 1200, px-6 sm:px-8) |
| Inner header max-width | `max-w-2xl mx-auto text-center` |
| Eyebrow | `badge-mono` |
| Headline size | `text-3xl sm:text-4xl lg:text-5xl` (30 / 36 / 48 px) |
| Headline weight | `font-semibold` (600) |
| Headline tracking | `tracking-[-0.02em]` |
| Headline color | wrapped in `<span class="text-gradient">` for white fade |
| Body | `text-base sm:text-lg text-zinc-400` |
| Top divider | `border-t border-white/[0.06]` |

**Sticky variant** (for FAQ where the left column stays in view):
```html
<div class="lg:sticky lg:top-28 lg:self-start">
  <!-- header content here -->
</div>
```

---

## 7. The Mesh Gradient (signature backdrop)

```html
<div class="mesh-gradient" aria-hidden="true"></div>
<div class="grid-noise absolute inset-0 -z-10 opacity-40" aria-hidden="true"></div>
```

| Property | Value |
|---|---|
| Container | `relative isolate overflow-hidden` on the section |
| Mesh | `position: absolute; inset: 0; pointer-events: none; z-index: 0` |
| Mesh filter | `blur(60px) saturate(140%)` |
| Mesh mask | `radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, black 40%, transparent 90%)` |
| Mesh opacity | `0.9` |
| Grid noise | `background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 56px 56px` |
| Noise opacity | `0.4` |
| Noise z-index | `-z-10` |

Two sections in the page use it: **Hero** and **Final CTA**.

---

## 8. Code Window (the developer-product surface)

```html
<div class="code-window">
  <div class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
    <div class="code-dots">
      <span></span><span></span><span></span>
    </div>
    <div class="font-mono text-[11px] text-zinc-500">norcel / data / auth.ts</div>
    <div class="font-mono text-[11px] text-zinc-600">TypeScript</div>
  </div>
  <pre class="overflow-x-auto p-5 text-[12.5px] leading-[1.7] sm:p-6 sm:text-[13px]"><code>
<span class="tk-comment">// comment</span>
<span class="tk-keyword">async</span> <span class="tk-fn">authorize</span>(…)
  </code></pre>
</div>
```

| Property | Value |
|---|---|
| Border radius | `rounded-xl` (12 px) |
| Border | `1px solid rgba(255,255,255,0.08)` |
| Background | `linear-gradient(180deg, #0a0a0a 0%, #060606 100%)` |
| Shadow | `0 0 0 1px rgba(255,255,255,0.04) inset, 0 30px 80px -20px rgba(0,0,0,0.7), 0 8px 24px -8px rgba(0,0,0,0.5)` |
| Traffic-light dots | red `#ff5f57`, yellow `#febc2e`, green `#28c840` — all at 0.55 opacity, 12 × 12 |
| Dot row padding | `px-4 py-3` |
| Filename | `font-mono text-[11px] text-zinc-500` |
| Language tag | `font-mono text-[11px] text-zinc-600` |
| Pre padding | `p-5 sm:p-6` |
| Pre font size | `text-[12.5px] sm:text-[13px]` |
| Pre line-height | `leading-[1.7]` |

### Syntax tokens (`.tk-*`)

```css
.tk-comment { color: #6b7280; }   /* gray */
.tk-keyword { color: #ff79c6; }   /* pink */
.tk-fn     { color: #50e3c2; }    /* cyan */
.tk-str    { color: #f9cb28; }    /* amber */
.tk-num    { color: #ff8a65; }    /* salmon */
.tk-var    { color: #fafafa; }    /* near-white */
.tk-type   { color: #007cf0; }    /* blue */
.tk-punct  { color: #a1a1a1; }    /* mid gray */
.tk-tag    { color: #ff79c6; }    /* pink */
.tk-attr   { color: #50e3c2; }    /* cyan */
.tk-prop   { color: #fafafa; }    /* near-white */
.tk-meta   { color: #6b7280; }    /* gray */
```

---

## 9. Icons (conventions)

All icons are inline SVGs with no library dependency. Three rules:

| Rule | Value |
|---|---|
| Stroke width | `1.6` for body icons (cards), `1.8` for action icons (buttons), `2` for check / X |
| Stroke caps | `stroke-linecap="round" stroke-linejoin="round"` |
| Sizing | `h-4 w-4` (16 px) for button/card icons, `h-3.5 w-3.5` (14 px) for inline indicators, `h-6 w-6` (24 px) for hero glyphs |
| Color | inherits from `text-{color}` parent |
| Style | outline / stroke (never solid) — except brand mark and testimonial quote glyph (which are filled) |

---

## 10. Form Inputs (if you need them)

This app has no forms on the marketing surface, but when you need one, follow the
canonical primitive — `bg-white/[0.04] border border-white/[0.08] rounded-md
text-white placeholder-zinc-500 focus:ring-2 focus:ring-white/20`. Never use the
default browser chrome (white bg, blue ring); override with `color-scheme: dark`
already declared in the root `<html>`.

```html
<input class="h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.04]
              px-3 text-sm text-white placeholder-zinc-500 transition-colors
              focus:border-white/[0.16] focus:outline-none focus:ring-2 focus:ring-white/20"
       placeholder="you@example.com" />
```

---

## 11. Layouts & Grids

| Pattern | Recipe |
|---|---|
| Section wrapper | `<section class="relative border-t border-white/[0.06] py-24 sm:py-32">` |
| Page container | `<div class="container-page">` (1200 max, px-6 sm:px-8) |
| Centered header | `mx-auto max-w-2xl text-center` |
| 3-up card grid | `mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` |
| 3-up hero/feature | `mt-10 grid grid-cols-1 gap-4 md:grid-cols-3` |
| Sticky-side FAQ | `grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]` |
| 2-up footer | `grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_2fr]` |
| Gap standard | `gap-4` (16 px) for cards, `gap-12` (48 px) for major sections, `gap-3` (12 px) for button rows |

---

## 12. Animation Conventions

```css
/* Reveal on scroll */
.reveal     { opacity: 0; transform: translateY(16px); transition: 700ms cubic-bezier(0.16, 1, 0.3, 1); }
.reveal-fade{ opacity: 0; transition: 800ms cubic-bezier(0.16, 1, 0.3, 1); }
.reveal.is-visible, .reveal-fade.is-visible { opacity: 1; transform: translateY(0); }

/* Stagger delays (80 ms steps) */
.delay-1 { transition-delay: 80ms; }
.delay-2 { transition-delay: 160ms; }
.delay-3 { transition-delay: 240ms; }
.delay-4 { transition-delay: 320ms; }
.delay-5 { transition-delay: 400ms; }
```

| Use | Class |
|---|---|
| Single element fade-in-up | `class="reveal"` |
| Staggered group (3-up card grid) | `class="reveal delay-1"`, `delay-2`, `delay-3` (cycling 1–3 across rows) |
| Single fade without translate | `class="reveal-fade"` |
| Rotating FAQ icon | `transition-transform duration-300`, plus 45° rotation in `[data-faq-item][data-open="true"] svg` |
| Mobile nav drawer | `transition-all duration-300` on inner container, `data-[open=true]:max-h-[600px] data-[open=true]:opacity-100` |
| Live ping dot | `animate-ping` on outer ring, static inner dot |
| Hover transitions (universal) | `transition-colors duration-200` (links) or `transition-all duration-200` (buttons) |

The IntersectionObserver wiring lives once in the root layout (see `Layout.astro`):

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  });
}, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });

document.querySelectorAll(".reveal, .reveal-fade").forEach((el) => io.observe(el));
```

---

## 13. Quick-Copy Recipes (the most-used building blocks)

### 13.1 Icon container (neutral)
```html
<span class="grid h-9 w-9 place-items-center rounded-lg
             border border-white/[0.08] bg-white/[0.04] text-zinc-300">
  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <!-- path -->
  </svg>
</span>
```

### 13.2 Icon container (amber accent)
```html
<span class="grid h-9 w-9 place-items-center rounded-lg
             border border-amber-500/30 bg-amber-500/10 text-amber-300
             ring-1 ring-inset ring-amber-500/20">
  <svg class="h-4 w-4"><!-- path --></svg>
</span>
```

### 13.3 Check-list item
```html
<li class="flex items-start gap-2.5 text-sm text-zinc-300">
  <svg class="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  <span>Item text</span>
</li>
```

### 13.4 Inline link
```html
<a class="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white" href="#">link</a>
```

### 13.5 Avatar (gradient + initials)
```html
<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full
             bg-gradient-to-br from-zinc-700 to-zinc-900
             font-mono text-[12px] font-semibold text-zinc-200">MO</span>
```

### 13.6 Progress bar
```html
<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
  <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
       style="width: 64%"></div>
</div>
```

### 13.7 Code window header (with traffic-light dots)
```html
<div class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
  <div class="code-dots"><span></span><span></span><span></span></div>
  <div class="font-mono text-[11px] text-zinc-500">path / to / file.ts</div>
  <div class="font-mono text-[11px] text-zinc-600">TypeScript</div>
</div>
```

### 13.8 Status / live dot
```html
<span class="relative flex h-2 w-2">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full
               bg-emerald-400 opacity-75"></span>
  <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
</span>
```

### 13.9 Strikethrough price
```html
<span class="font-mono text-[11px] text-zinc-500 line-through">$99 value</span>
```

### 13.10 Sticky-tagged article (used in stack list in hero)
```html
<li class="group relative overflow-hidden rounded-xl border border-white/[0.06]
           bg-white/[0.02] p-3 transition-colors duration-200
           hover:border-white/[0.14] hover:bg-white/[0.04]">
  <div class="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60
              from-violet-500/20 to-fuchsia-500/10"></div>
  <div class="relative flex items-start gap-3">
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg
                 border border-white/[0.08] bg-black/40 text-zinc-200
                 ring-1 ring-inset ring-white/[0.04]">
      <svg class="h-4 w-4"><!-- icon --></svg>
    </span>
    <div class="min-w-0">
      <div class="truncate text-[13px] font-medium text-white">Title</div>
      <div class="mt-0.5 text-[12px] leading-snug text-zinc-400">Subtitle.</div>
    </div>
  </div>
</li>
```

---

## 14. The Card-Hover Convention

Every card on the page (FAQ items, feature cards, pricing tiers, hero stack items)
follows the **same hover transition**:

| State | Background | Border |
|---|---|---|
| Resting | `bg-white/[0.02]` | `border-white/[0.08]` |
| Hover | `bg-white/[0.04]` | `border-white/[0.14]` |
| Open (FAQ) | `bg-white/[0.04]` | `border-white/[0.14]` |
| Featured / "win" | `bg-white/[0.04]` (no border, replaced by stronger inset ring) |

```css
transition: background-color 300ms, border-color 300ms; /* default */
```

---

## 15. The "Polarity Flip" Pattern

Two places in the page invert the surface: **the featured pricing/verdict card** and **the live ping dot's green pulse**. Everywhere else, the design stays dark.

| Surface | Resting | Polarity-flipped |
|---|---|---|
| Card background | `bg-white/[0.02]` | `bg-black` |
| Card border | `border-white/[0.08]` | `border-white/0` (removed) |
| Inset ring | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` (stronger) |
| Drop shadow | small | heavy: `0 30px 60px -20px rgba(0,0,0,0.7)` |
| CTA button inside | `btn-secondary` (white-tint) | `btn-primary` (white pill) |
| Text | `text-white` | `text-white` (no change) |

Use **at most one** polarity-flipped surface per visual group — that's what makes it
"featured" rather than "loud."

---

## 16. Color Decision Flowchart

When you need to pick a color, follow this decision tree:

1. **Page background?** → `bg-[#0a0a0a]` (canvas) — never change it.
2. **Section divider?** → `border-white/[0.06]` — never thicker.
3. **Card / surface?** → `bg-white/[0.02]` + `border-white/[0.08]`.
4. **Card hover / open?** → `bg-white/[0.04]` + `border-white/[0.14]`.
5. **Primary headline?** → white, wrapped in `.text-gradient` for fade.
6. **Section eyebrow?** → mono `text-zinc-500` (`.badge-mono`).
7. **Body / lead?** → `text-zinc-400`.
8. **Card title?** → `text-white text-[15px] font-semibold tracking-tight`.
9. **List item / secondary?** → `text-zinc-300`.
10. **Mono label / metadata?** → `font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500`.
11. **Icon on card?** → `text-zinc-300` (h-4 w-4, stroke 1.6).
12. **Check / status indicator?** → `text-zinc-500` (resting) or `text-emerald-400` (win).
13. **Primary button?** → `bg-white text-black rounded-full`.
14. **Secondary button?** → `bg-white/5 text-white ring-1 ring-inset ring-white/10`.
15. **Accent surface (only one per page)?** → `border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-transparent`.

---

## 17. What NOT To Do

- ❌ Don't introduce `bg-zinc-900`, `bg-zinc-800`, `bg-zinc-700` card fills. The system is **white-on-black-tint only**.
- ❌ Don't use `shadow-xl` / `shadow-2xl` alone. Always stack with an inset ring.
- ❌ Don't render the mesh gradient at icon scale, in a single colour, or cropped.
- ❌ Don't use `font-bold` (700+). The display ceiling is 600.
- ❌ Don't use `uppercase` on display text. Sentence-case only.
- ❌ Don't set body paragraphs in mono. Mono is for code, eyebrows, file paths, version strings.
- ❌ Don't mix two polarity-flipped surfaces on the same screen.
- ❌ Don't use `text-zinc-100` for "primary" text. That's a body color. Use `text-white`.
- ❌ Don't use `text-zinc-500` for "important" text. That's the metadata voice. Use `text-zinc-300` or `text-zinc-200`.
- ❌ Don't add a card border on top of a card border. The system has one card shape; nest with `bg-white/[0.04]` and `ring-1` instead.
- ❌ Don't use `tracking-wide` or `tracking-wider` on display text. Tracking is *negative* on display, neutral on body, *positive* on mono labels only.
- ❌ Don't make buttons rectangular. Marketing CTAs are always `rounded-full` (100 px).

---

*Last updated 2026-06-28. Use this alongside `DESIGN_SYSTEM.md` (the higher-level
system) and `global.css` (the implementation).*
