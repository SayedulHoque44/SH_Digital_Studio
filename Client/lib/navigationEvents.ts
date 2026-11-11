/**
 * Browser-side "a navigation just started" signal.
 *
 * Next.js calls `onRouterTransitionStart` (instrumentation-client.ts) for
 * every client-side navigation: links, router.push/replace, <Form> and
 * back/forward. It is re-broadcast here as a DOM event so UI can react
 * immediately — the page skeleton (components/layouts/Site/NavigationSkeleton)
 * and the /work results skeleton (components/features/Projects/WorkResults).
 *
 * Listeners run inside the router's React transition: update state from a
 * timer (as both listeners do), not synchronously, or the update would wait
 * for the navigation to finish.
 */
const EVENT = "shds:navigation-start";

export type TNavigationType = "push" | "replace" | "traverse";
export type TNavigationStart = { url: URL; type: TNavigationType };

export function announceNavigationStart(href: string, type: TNavigationType) {
  if (typeof window === "undefined") return;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return; // malformed href: nothing to show, the router reports it
  }
  window.dispatchEvent(new CustomEvent<TNavigationStart>(EVENT, { detail: { url, type } }));
}

/** Subscribe; returns the unsubscribe function (use it as an effect cleanup). */
export function onNavigationStart(listener: (navigation: TNavigationStart) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<TNavigationStart>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
