"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole site. Server components only add a
 * `data-reveal` attribute (optionally style={{"--reveal-delay": 120}}) and
 * this component adds `is-visible` when the element scrolls into view - so
 * scroll animations need no per-component client JavaScript.
 *
 * Hidden-until-revealed styles only apply when JS runs (html.js), and
 * prefers-reduced-motion disables the effect entirely (see globals.css).
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Tells the failsafe in the root layout that reveals are running
    (window as Window & { __revealReady?: boolean }).__revealReady = true;
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      // Reveal as soon as any part is on screen (a threshold left cards that sat
      // just inside the bottom of the viewport hidden until the visitor scrolled)
      { rootMargin: "0px 0px -4% 0px", threshold: 0 },
    );

    const observeAll = () =>
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => observer.observe(el));

    observeAll();
    // Content streamed in later (Suspense) or rendered by client components
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
