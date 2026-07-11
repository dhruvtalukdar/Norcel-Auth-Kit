"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Mounts a single IntersectionObserver that toggles `.is-visible` on
 * every `.reveal` / `.reveal-fade` element when it scrolls into view.
 * Once visible the element is unobserved (one-shot animation).
 *
 * Re-runs the observer on every route change (tracked via
 * `usePathname()`) so client-side navigations to a page that has
 * fresh `.reveal` elements re-attach the observer. Without this,
 * the new elements would stay at `opacity: 0` (the CSS initial
 * state) and the page would appear blank until a hard refresh.
 *
 * Mirrors the convention from `readme/DESIGN_SYSTEM.md` §8.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  React.useEffect(() => {
    // Defer to the next frame so the new route's DOM is in place
    // before we query it. Without this, client-side navigations
    // can race the DOM update and the observer misses the new
    // `.reveal` elements.
    const raf = requestAnimationFrame(() => {
      const targets = document.querySelectorAll<HTMLElement>(
        ".reveal, .reveal-fade"
      );
      if (targets.length === 0) return;

      if (typeof IntersectionObserver === "undefined") {
        targets.forEach((el) => el.classList.add("is-visible"));
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
      );

      targets.forEach((el) => io.observe(el));
      // Disconnect on the next cleanup. Since `pathname` is in
      // the dep array, the effect re-runs (and re-disconnects
      // the previous observer) on every route change.
      return () => io.disconnect();
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
