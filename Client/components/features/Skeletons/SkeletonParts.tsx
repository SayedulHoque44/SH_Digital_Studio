import type { ReactNode } from "react";
import { BrowserFrame } from "@/components/shared/DeviceFrames";
import Container from "@/components/ui/Container";
import { Eyebrow, SectionHeading } from "@/components/ui/Section";
import { Skeleton, SkeletonInline, SkeletonText } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

/*
 * Building blocks for the public page skeletons. Each one copies the markup,
 * spacing and type classes of the real component it stands in for (named in
 * the comments), and reuses the real layout components where possible
 * (Container, Eyebrow, SectionHeading, BrowserFrame) so they stay in sync.
 *
 * Text placeholders inside a content-sized flex item need an explicit width
 * (flex-1 / w-full): percentage-wide lines have no intrinsic width of their own.
 */

// components/ui/buttonStyles.ts sizes
const BUTTON_HEIGHTS = { sm: "h-9", md: "h-11", lg: "h-13" } as const;

export function ButtonSkeleton({
  size = "md",
  width = "9rem",
  className,
}: {
  size?: keyof typeof BUTTON_HEIGHTS;
  width?: string;
  className?: string;
}) {
  return <Skeleton className={cn("max-w-full shrink-0 rounded-full", BUTTON_HEIGHTS[size], className)} style={{ width }} />;
}

/** Row of pill buttons/chips (share actions, tag chips, filter tabs). */
export function PillRowSkeleton({ widths, height = "h-10", className }: { widths: string[]; height?: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {widths.map((width, index) => (
        <Skeleton key={index} className={cn("max-w-full rounded-full", height)} style={{ width }} />
      ))}
    </div>
  );
}

// components/shared/Breadcrumbs.tsx (text-sm row: Home › … › Current)
export function BreadcrumbsSkeleton({ widths, className }: { widths: string[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 text-sm", className)}>
      {widths.map((width, index) => (
        <SkeletonInline key={index} width={width} />
      ))}
    </div>
  );
}

// components/ui/PageHero.tsx (without the entrance animations)
export function PageHeroSkeleton({
  tone = "paper",
  crumbs,
  eyebrow = "6rem",
  title = ["78%", "52%"],
  intro = 2,
  actions,
  children,
}: {
  tone?: "paper" | "dark";
  /** Breadcrumb widths, when the page has breadcrumbs */
  crumbs?: string[];
  eyebrow?: string;
  /** One width per heading line */
  title?: string[];
  /** Number of intro lines (0 = none) */
  intro?: number;
  /** Large buttons under the intro */
  actions?: string[];
  children?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section
      className={cn(
        "relative overflow-x-clip pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--announce-h,0px)+8.5rem)] md:pt-[calc(var(--announce-h,0px)+10rem)]",
        dark ? "surface-dark bg-ink-950 text-paper-100" : "bg-paper-100 text-ink-900",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 mask-fade-y", dark ? "bg-grid-ink opacity-70" : "bg-grid-paper opacity-60")} />
      <Container className="relative">
        {crumbs && <BreadcrumbsSkeleton widths={crumbs} className="mb-8" />}
        <Eyebrow className="mb-6">
          <SkeletonInline width={eyebrow} />
        </Eyebrow>
        <SkeletonText lines={title.length} widths={title} className="text-display-xl max-w-[18ch] [--skeleton-bar:0.74em]" />
        {/* Same class composition as the real intro, so it renders at the same size */}
        {intro > 0 && <SkeletonText lines={intro} className={cn("text-lead mt-6 max-w-[58ch]", dark ? "text-ink-300" : "text-stone-600")} />}
        {actions && (
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {actions.map((width, index) => (
              <ButtonSkeleton key={index} size="lg" width={width} />
            ))}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

// components/ui/Section.tsx → SectionHeading (the real component, with placeholders)
export function SectionHeadingSkeleton({
  size = "lg",
  eyebrow = "5.5rem",
  title = ["62%"],
  intro = 2,
  action,
  className,
}: {
  size?: "lg" | "md";
  eyebrow?: string;
  title?: string[];
  intro?: number;
  /** Width of the button on the right, if the heading has one */
  action?: string;
  className?: string;
}) {
  return (
    <SectionHeading
      size={size}
      // The text column is content-sized in the desktop row: let it fill the space
      className={cn("md:[&>div:first-child]:flex-1", className)}
      eyebrow={<SkeletonInline width={eyebrow} />}
      title={<SkeletonText lines={title.length} widths={title} className="[--skeleton-bar:0.74em]" />}
      intro={intro ? <SkeletonText lines={intro} widths={intro === 1 ? ["82%"] : undefined} /> : undefined}
      action={action ? <ButtonSkeleton width={action} /> : undefined}
    />
  );
}

// components/features/Projects/ProjectCard.tsx
export function ProjectCardSkeleton({ size = "sm" }: { size?: "lg" | "md" | "sm" }) {
  return (
    <div>
      <Skeleton className="aspect-16/10 w-full rounded-[1.4rem]" />
      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <SkeletonText lines={1} widths={["7.5rem"]} className="text-eyebrow" />
          <SkeletonText
            lines={1}
            widths={["62%"]}
            className={cn("mt-2 font-display [--skeleton-bar:0.7em]", size === "lg" ? "text-[1.75rem] leading-tight" : "text-[1.35rem] leading-snug")}
          />
          <SkeletonText lines={2} widths={["100%", "74%"]} className="mt-2 max-w-[60ch] text-[0.97rem] leading-relaxed" />
        </div>
        <Skeleton className="mt-1 hidden size-11 shrink-0 rounded-full sm:block" />
      </div>
    </div>
  );
}

/** Project card grid (work list, demo library, related projects). */
export function ProjectGridSkeleton({
  count = 6,
  size = "sm",
  columns = "md:grid-cols-2 xl:grid-cols-3",
  className,
}: {
  count?: number;
  size?: "lg" | "md" | "sm";
  columns?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-x-8 gap-y-14", columns, className)}>
      {Array.from({ length: count }, (_, index) => (
        <ProjectCardSkeleton key={index} size={size} />
      ))}
    </div>
  );
}

// components/shared/DeviceFrames.tsx → BrowserFrame with an empty screen
export function BrowserFrameSkeleton({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <BrowserFrame tone={tone} className={className}>
      <div className="relative aspect-16/10">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
    </BrowserFrame>
  );
}

// components/shared/DeviceFrames.tsx → PhoneFrame
export function PhoneFrameSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-ink-950 p-[7px] shadow-frame ring-1 ring-white/15", className)}>
      <div className="surface-dark relative h-full w-full overflow-hidden rounded-[1.65rem] bg-ink-800">
        <Skeleton className="absolute inset-0 rounded-none" />
        <span className="absolute left-1/2 top-2 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-ink-950" />
      </div>
    </div>
  );
}

// Industry cards: homepage IndustriesShowcase and the /industries page
export function IndustryCardSkeleton({ chips = 0, titleClassName = "text-[1.5rem]" }: { chips?: number; titleClassName?: string }) {
  return (
    <div className="flex h-full flex-col rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10">
      <div className="flex items-center justify-between">
        <Skeleton className="size-12 rounded-2xl" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <SkeletonText lines={1} widths={["52%"]} className={cn("mt-8 font-display [--skeleton-bar:0.7em]", titleClassName)} />
      <SkeletonText lines={2} widths={["100%", "68%"]} className="mt-3 max-w-2xl leading-relaxed" />
      {chips > 0 && <PillRowSkeleton className="mt-6" height="h-9" widths={Array.from({ length: chips }, (_, index) => `${6 + (index % 3)}rem`)} />}
      <SkeletonText lines={1} widths={["7rem"]} className="mt-auto pt-8 text-sm" />
    </div>
  );
}
