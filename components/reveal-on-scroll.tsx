"use client";

import * as React from "react";

/**
 * Mounts a single IntersectionObserver that toggles `.is-visible` on
 * every `.reveal` / `.reveal-fade` element when it scrolls into view.
 * Once visible the element is unobserved (one-shot animation).
 *
 * Mirrors the convention from `readme/DESIGN_SYSTEM.md` §8.
 */
export function RevealOnScroll() {
  React.useEffect(() => {
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
    return () => io.disconnect();
  }, []);

  return null;
}
