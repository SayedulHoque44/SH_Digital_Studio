"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ProjectGridSkeleton } from "@/components/features/Skeletons/SkeletonParts";
import { SkeletonStatus } from "@/components/ui/Skeleton";
import { onNavigationStart } from "@/lib/navigationEvents";
import { readWorkFilters, workFiltersKey, type TWorkFilters } from "@/lib/workFilters";

// Cached filter changes come back almost instantly: only slower ones show a skeleton
const SHOW_AFTER_MS = 120;
// A request that never returns different results (network error)
const GIVE_UP_MS = 15000;

type TPending = { from: string; mode: "replace" | "append" };

/**
 * Result list of /work. The page itself stays on screen while a filter,
 * search or "Show more" request loads (so the search box keeps focus); this
 * swaps only the cards that are about to change for card skeletons:
 * - new filters / search / sort → the whole grid
 * - "Show more"                 → three more cards below the current ones
 *
 * `filters` are the filters the server rendered `children` for. A pending
 * state belongs to those results and ends by itself when results for other
 * filters arrive.
 */
export default function WorkResults({ filters, more, children }: { filters: TWorkFilters; more?: ReactNode; children: ReactNode }) {
  const resultsKey = workFiltersKey(filters);
  const currentPage = filters.page;
  const [pending, setPending] = useState<TPending | null>(null);

  useEffect(() => {
    let showTimer = 0;
    let giveUpTimer = 0;

    const stop = onNavigationStart(({ url }) => {
      if (url.origin !== window.location.origin || url.pathname !== "/work" || window.location.pathname !== "/work") return;
      const next = readWorkFilters((name) => url.searchParams.get(name));
      if (workFiltersKey(next) === resultsKey) return; // same results: nothing will change

      const onlyMorePages = next.page > currentPage && workFiltersKey({ ...next, page: currentPage }) === resultsKey;
      const mode = onlyMorePages ? "append" : "replace";
      window.clearTimeout(showTimer);
      window.clearTimeout(giveUpTimer);
      // From timers, not directly: this runs inside the router's transition
      showTimer = window.setTimeout(() => setPending({ from: resultsKey, mode }), SHOW_AFTER_MS);
      giveUpTimer = window.setTimeout(() => setPending(null), GIVE_UP_MS);
    });

    return () => {
      stop();
      window.clearTimeout(showTimer);
      window.clearTimeout(giveUpTimer);
      // These results are being replaced: forget their pending state, so it
      // cannot reappear if the same filters are opened again later
      window.setTimeout(() => setPending(null), 0);
    };
  }, [resultsKey, currentPage]);

  // Only while these results are still the ones on screen
  const active = pending?.from === resultsKey ? pending : null;

  if (active?.mode === "replace") {
    return (
      <>
        <SkeletonStatus label="Loading projects…" />
        <div aria-hidden>
          <ProjectGridSkeleton count={6} />
        </div>
      </>
    );
  }

  return (
    <>
      {children}
      {active?.mode === "append" ? (
        <>
          <SkeletonStatus label="Loading more projects…" />
          <div aria-hidden>
            <ProjectGridSkeleton count={3} className="mt-14" />
          </div>
        </>
      ) : (
        more
      )}
    </>
  );
}
