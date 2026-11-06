// Shown while the work list re-renders for a new filter: a slim progress bar
// instead of a full-screen spinner, so the page never "flashes".
//
// Deliberately scoped to /work. A loading boundary makes Next.js stream the
// page shell (and its "200 OK") before the page runs, so at the root it turned
// notFound() on unknown project/demo/service URLs into soft 404s. Other pages
// are static and prefetched, so they don't need one.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-70 h-0.5 overflow-hidden">
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-accent" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
