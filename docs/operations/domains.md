# Domain strategy

> **Last updated:** 2026-07-12 · Norcel v1.0

How the three surfaces (landing page, template demo, UI kit) are mapped to domains. Update this when the strategy changes.

---

## TL;DR

| Surface | v1.0 (now) | When to upgrade |
|---|---|---|
| Landing page | **Buy a custom domain** (~$12/yr) | Day 1 of launch |
| Template demo | **Vercel free subdomain** | First paid ad, white-label work, or paying customer |
| UI kit | **Vercel free subdomain** | Same as template demo |

**Don't spend money on domains for things that don't have paying customers yet.** The free subdomains are fine until they aren't.

---

## Why this split

The three surfaces serve different audiences and need different mental models:

| Surface | Audience | Mental model | When trust is built |
|---|---|---|---|
| **Landing page** | Cold visitors, "should I buy?" | "This is the company / product" | First impression — has to be polished |
| **Template demo** | Warm leads, "does this work?" | "This is the live product" | When they click into the app and see it works |
| **UI kit** | Designers / devs evaluating | "These are the components" | When they find what they need |

A `vercel.app` URL is fine for "this is the product running somewhere". It's a liability for "this is my company" — visitors won't take a `yourbrand.vercel.app` business card seriously.

---

## The setup for v1.0

### Landing page → `yourbrand.dev` (custom domain, paid)

This is your storefront. **Buy a domain on day 1 of launch.** Recommended registrars:

- **Cloudflare Registrar** — at-cost pricing, no markup
- **Porkbun** — cheap, includes WHOIS privacy
- **Namecheap** — popular, slightly more expensive

Domains to look at:

- `yourbrand.dev` — preferred for a SaaS / dev tool
- `yourbrand.io` — works for a broader product
- `yourbrand.com` — most universal, slightly more expensive

**Cost**: $8–15/year for `.dev`/`.io`, $10–20/year for `.com`.

**Why you need it on day 1**:
- Cold visitors who Google you land on the landing page
- Cold visitors who see a Twitter ad click through to the landing page
- Customers who read your docs share the URL
- The domain itself is a trust signal (you "own" the product)

### Template demo → `norcel-demo.vercel.app` (Vercel free)

Free Vercel subdomain. Live, works, has HTTPS. **Don't buy a custom domain for it in v1.**

**Why a free subdomain is OK**:
- Visitors arrive at the demo **from** your landing page — they already trust you
- The URL signals "this is a demo" vs. the marketing site, which is the right mental model
- You'll be updating the demo constantly — one less thing to manage
- Migration to a custom domain is a 5-minute DNS change, can happen any time

### UI kit → `uikit.vercel.app` (Vercel free)

Same logic as the demo.

---

## DNS layout (when you buy the landing page domain)

When you buy `yourbrand.dev`, set up the DNS so the demo and UI kit can later live at clean subdomains:

```
yourbrand.dev           A     76.76.21.21     (Vercel — landing page)
www.yourbrand.dev       CNAME cname.vercel-dns.com
demo.yourbrand.dev      CNAME cname.vercel-dns.com  (later — template demo)
uikit.yourbrand.dev     CNAME cname.vercel-dns.com  (later — UI kit)
```

**All four point to Vercel.** Each subdomain can be assigned to its own Vercel project at any time. The DNS doesn't change when you migrate.

The point of doing this on day 1, even though `demo.yourbrand.dev` doesn't exist yet:
- When you DO buy / configure the demo, the URL is already there
- Customers never see a URL change
- You can put `demo.yourbrand.dev` on your landing page immediately as a forward-looking link

---

## When to buy custom domains for the demo / UI kit

Buy the demo a custom domain when **any** of these is true:

1. **You're running paid ads** that point to the demo. Ad networks flag `vercel.app` URLs as low-quality.
2. **Customers are asking for the demo URL by name** — they want to bookmark it. `demo.yourbrand.dev` is more memorable than `norcel-abc123.vercel.app`.
3. **You're selling the demo as a separate product tier** (some kit vendors do this).
4. **You have a "Pro" tier** that includes a hosted demo for customers. That deserves a real domain.
5. **Your domain authority matters for SEO** — if you write blog posts about your template, they should live on `yourbrand.dev/blog`, not `yourbrand.vercel.app/blog`.

For v1.0, **none of these are true yet**. You're at $0 revenue. The demo is a "look, it works" link from your landing page. Vercel's free subdomain is fine.

### Migration is cheap

If you decide to buy a custom domain for the demo later:

1. Buy `demo.yourbrand.dev` (or whatever name).
2. Add the DNS record (`CNAME cname.vercel-dns.com`).
3. In Vercel project settings, add the custom domain.
4. Update links from `norcel-demo.vercel.app` to `demo.yourbrand.dev` in your landing page and docs.

**Total time**: 10 minutes. **No code changes** other than updating the link in the landing page.

---

## The white-label / agency exception

If you ever **white-label the template for a client** (e.g. you sell them a custom-branded version of Norcel with their logo, their copy, their colors), the demo needs a custom domain — `demo.theircompany.com`, not `norcel-demo.vercel.app`. The client will pay for the domain.

At that point, **yes, buy a domain for the demo**. But that's a future-you problem, not a v1 problem.

---

## Cost summary for v1.0

| Item | Cost | Recurrence |
|---|---|---|
| Landing page domain (`yourbrand.dev`) | $10–20 | Yearly |
| Template demo | $0 | — |
| UI kit | $0 | — |
| Vercel Pro (if you outgrow the free tier) | $20 | Monthly |
| **Total v1 cost** | **$10–20** | **Yearly** |

If the template doesn't sell, your sunk cost is one domain registration (~$12). If it does sell, you'll know within the first month whether the demo needs its own domain.

---

## Concrete checklist for v1.0 launch

- [ ] Buy `yourbrand.dev` (or your chosen domain) on Cloudflare or Porkbun
- [ ] Set up DNS:
  - [ ] `yourbrand.dev` → Vercel
  - [ ] `www.yourbrand.dev` → Vercel
  - [ ] `demo.yourbrand.dev` → Vercel (forward to the free subdomain for now)
  - [ ] `uikit.yourbrand.dev` → Vercel (forward to the free subdomain for now)
- [ ] Deploy the landing page to Vercel
- [ ] Deploy the template demo to Vercel (free subdomain is fine)
- [ ] Deploy the UI kit to Vercel (free subdomain is fine)
- [ ] Add links in the landing page: "Live demo" → `demo.yourbrand.dev`, "Browse components" → `uikit.yourbrand.dev`
- [ ] In Vercel project settings, add the custom domain `yourbrand.dev` to the landing page
- [ ] (Optional) Add `demo.yourbrand.dev` to the demo project and `uikit.yourbrand.dev` to the UI kit project — only if you want to migrate early

---

## Related docs

- [`docs/getting-started.md`](../getting-started.md) — general setup guide
- [`docs/operations/deployment.md`](./deployment.md) — Vercel deployment (planned for v1.1)
- [`docs/INDEX.md`](../INDEX.md) — topic index
