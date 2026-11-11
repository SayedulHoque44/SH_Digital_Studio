import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Loading placeholders (styles: .skeleton in styles/globals.css).
 * - Blocks shimmer softly; the shimmer is off for reduced motion.
 * - Inside `.surface-dark` they turn light-on-dark (`.surface-light` switches
 *   back for a light card on a dark surface).
 * - Text placeholders take the real text utility (text-lead, text-sm,
 *   text-display-xl …): every line is exactly one line box tall (1lh), so a
 *   skeleton paragraph is as tall as the paragraph that replaces it.
 * Every block is aria-hidden; announce the loading state once with
 * <SkeletonStatus> (or wrap a decorative skeleton in <SkeletonScreen>).
 */

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cn("skeleton", className)} style={style} />;
}

// Slightly uneven line lengths read as text; the last line of a paragraph is shorter
const LINE_WIDTHS = ["100%", "94%", "97%", "89%", "92%"];
const lineWidth = (index: number, lines: number, widths?: string[]) =>
  widths?.[index] ?? (lines > 1 && index === lines - 1 ? "64%" : LINE_WIDTHS[index % LINE_WIDTHS.length]);

// Bar height relative to the font size; headings set --skeleton-bar to a taller value
const BAR = "skeleton h-[var(--skeleton-bar,0.62em)] max-w-full rounded-[0.22em]";

/** Block of text lines. Put the real text classes (size, line height, max width) in className. */
export function SkeletonText({ lines = 3, widths, className }: { lines?: number; widths?: string[]; className?: string }) {
  return (
    <span aria-hidden className={cn("block", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="flex h-[1lh] items-center">
          <span className={BAR} style={{ width: lineWidth(index, lines, widths) }} />
        </span>
      ))}
    </span>
  );
}

/** A single line that sits inline: inside a flex row, an eyebrow or a heading. */
export function SkeletonInline({ width = "6rem", className }: { width?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-[1lh] max-w-full items-center align-top", className)}>
      <span className={BAR} style={{ width }} />
    </span>
  );
}

/** Announces the loading state once to assistive technology (visually hidden). */
export function SkeletonStatus({ label = "Loading…" }: { label?: string }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

/** A purely decorative skeleton (no real controls inside): announced once, hidden from assistive technology. */
export function SkeletonScreen({ label, className, children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <SkeletonStatus label={label} />
      <div aria-hidden>{children}</div>
    </div>
  );
}
