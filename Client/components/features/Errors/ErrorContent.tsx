"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LuRefreshCw } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

/**
 * Friendly error state. Technical details are never shown to visitors -
 * only a digest reference (useful when checking server logs) - and the
 * visitor can retry in place.
 */
export default function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged in the browser console for debugging; no details in the UI.
    console.error(error);
  }, [error]);

  return (
    <section className="surface-dark relative min-h-[80vh] overflow-hidden bg-ink-950 pb-24 pt-[calc(var(--announce-h,0px)+9rem)] text-paper-100">
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
      <Container className="relative">
        <p className="text-eyebrow text-ink-400">Something went wrong</p>
        <h1 className="text-display-xl mt-6 max-w-[16ch]">We couldn&apos;t load this page right now.</h1>
        <p className="text-lead mt-6 max-w-xl text-ink-300">
          This is usually temporary. Please try again in a moment — if it keeps happening, get in touch and we&apos;ll
          look into it.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="accent" size="lg" onClick={reset} leftIcon={<LuRefreshCw aria-hidden className="size-4" />}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-[3.25rem] items-center rounded-full px-7 text-paper-50 ring-1 ring-white/20 hover:bg-white/10"
          >
            Back to homepage
          </Link>
        </div>
        {error.digest && <p className="mt-10 font-mono text-xs text-ink-500">Reference: {error.digest}</p>}
      </Container>
    </section>
  );
}
