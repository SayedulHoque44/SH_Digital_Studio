"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  AboutSkeleton,
  ContactSkeleton,
  DemoCategorySkeleton,
  DemosSkeleton,
  HomeSkeleton,
  IndustriesSkeleton,
  LegalSkeleton,
  ProjectSkeleton,
  ServiceSkeleton,
  ServicesSkeleton,
  WorkSkeleton,
} from "@/components/features/Skeletons/PageSkeletons";
import { SkeletonStatus } from "@/components/ui/Skeleton";
import { onNavigationStart } from "@/lib/navigationEvents";

/**
 * Page skeleton for client-side navigation on the public site.
 *
 * When a link to another page is followed, the skeleton of the destination
 * page type covers the current page (under the real header) until the new
 * page has rendered.
 *
 * Why not loading.tsx: a loading boundary makes Next.js stream the page, which
 * turns notFound()/permanentRedirect() on the slug routes into "200 OK" and
 * leaves the content hidden for visitors without JavaScript. This component
 * runs only in the browser, after hydration, so HTTP status codes, crawlers
 * and no-JS visitors are unaffected — and it works for every route.
 */

type TPage = "home" | "work" | "demos" | "demo" | "industries" | "project" | "services" | "service" | "about" | "contact" | "legal";

const SKELETONS: Record<TPage, ReactNode> = {
  home: <HomeSkeleton />,
  work: <WorkSkeleton />,
  demos: <DemosSkeleton />,
  demo: <DemoCategorySkeleton />,
  industries: <IndustriesSkeleton />,
  project: <ProjectSkeleton />,
  services: <ServicesSkeleton />,
  service: <ServiceSkeleton />,
  about: <AboutSkeleton />,
  contact: <ContactSkeleton />,
  legal: <LegalSkeleton />,
};

const normalize = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

// Which skeleton a public URL gets. null = none (admin, files, unknown paths).
function pageFor(pathname: string): TPage | null {
  const path = normalize(pathname);
  if (path === "/") return "home";
  if (path === "/work") return "work";
  if (path === "/demos") return "demos";
  if (path === "/industries") return "industries";
  if (path === "/services") return "services";
  if (path === "/about") return "about";
  if (path === "/contact") return "contact";
  if (path === "/privacy" || path === "/terms") return "legal";

  // Slug pages (/industries/<slug> redirects to /demos/<slug>)
  const [, section, slug, extra] = path.split("/");
  if (!slug || extra) return null;
  if (section === "projects") return "project";
  if (section === "demos" || section === "industries") return "demo";
  if (section === "services") return "service";
  return null;
}

// Prefetched pages render within a frame or two: waiting this long first means
// an instant navigation never flashes a skeleton.
const SHOW_AFTER_MS = 120;
// Once visible, stay long enough to read as a state rather than a flicker.
const MIN_VISIBLE_MS = 300;
// A navigation that never changes the page (e.g. a redirect back to this URL).
const GIVE_UP_MS = 12000;

export default function NavigationSkeleton() {
  const pathname = usePathname();
  const [page, setPage] = useState<TPage | null>(null);
  const timers = useRef({ show: 0, hide: 0, giveUp: 0, shownAt: 0 });

  // A navigation started
  useEffect(() => {
    const t = timers.current;
    const clear = () => {
      window.clearTimeout(t.show);
      window.clearTimeout(t.hide);
      window.clearTimeout(t.giveUp);
    };

    const stop = onNavigationStart(({ url }) => {
      clear();
      // State is only ever set from timers: this listener runs inside the
      // router's transition, where a direct update would wait for the new page.
      const leavesPage = url.origin === window.location.origin && normalize(url.pathname) !== normalize(window.location.pathname);
      const next = leavesPage ? pageFor(url.pathname) : null;
      if (!next) {
        // Same page (filters, #anchors, back/forward) or a route without a
        // skeleton: make sure an earlier one is not left on screen
        t.hide = window.setTimeout(() => setPage(null), 0);
        return;
      }
      t.show = window.setTimeout(() => {
        t.shownAt = performance.now();
        setPage(next);
      }, SHOW_AFTER_MS);
      t.giveUp = window.setTimeout(() => setPage(null), GIVE_UP_MS);
    });

    return () => {
      stop();
      clear();
    };
  }, []);

  // The destination rendered (the path changed): cancel a skeleton that has
  // not appeared yet, or hide the visible one after its minimum time
  useEffect(() => {
    const t = timers.current;
    window.clearTimeout(t.show);
    window.clearTimeout(t.giveUp);
    const remaining = Math.max(0, MIN_VISIBLE_MS - (performance.now() - t.shownAt));
    t.hide = window.setTimeout(() => setPage(null), remaining);
  }, [pathname]);

  // While the skeleton covers the page, the page behind it must not scroll
  // (same lock as the mobile menu and lightbox)
  const visible = page !== null;
  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!page) return null;

  return (
    // Below the header (z-50) and mobile menu (z-60), above all page content
    <div className="fixed inset-0 z-40 animate-[fade-in_0.2s_ease-out_both] overflow-hidden bg-paper-100">
      <SkeletonStatus label="Loading page…" />
      <div aria-hidden>{SKELETONS[page]}</div>
    </div>
  );
}
