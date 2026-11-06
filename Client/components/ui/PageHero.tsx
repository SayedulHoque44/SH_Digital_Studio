import React from "react";
import Breadcrumbs, { type TCrumb } from "@/components/shared/Breadcrumbs";
import { cn } from "@/lib/utils";
import Container from "./Container";
import { Eyebrow } from "./Section";

/**
 * Opening section for inner pages. Leaves room for the floating header
 * (and the optional announcement bar) and sets the page's single <h1>.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  actions,
  children,
  tone = "paper",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  breadcrumbs?: TCrumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "paper" | "dark";
  className?: string;
  titleClassName?: string;
}) {
  const dark = tone === "dark";
  return (
    <section
      className={cn(
        "relative overflow-x-clip pb-[clamp(3rem,7vw,6rem)] pt-[calc(var(--announce-h,0px)+8.5rem)] md:pt-[calc(var(--announce-h,0px)+10rem)]",
        dark ? "surface-dark bg-ink-950 text-paper-100" : "bg-paper-100 text-ink-900",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 mask-fade-y", dark ? "bg-grid-ink opacity-70" : "bg-grid-paper opacity-60")}
      />
      <Container className="relative">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} tone={dark ? "dark" : "light"} className="mb-8" />}
        {eyebrow && (
          <Eyebrow className="animate-fade-in mb-6">{eyebrow}</Eyebrow>
        )}
        <h1 className={cn("animate-rise text-display-xl max-w-[18ch] [--delay:60]", titleClassName)}>{title}</h1>
        {intro && (
          <div
            className={cn(
              "animate-rise text-lead mt-6 max-w-[58ch] [--delay:180]",
              dark ? "text-ink-300" : "text-stone-600",
            )}
          >
            {intro}
          </div>
        )}
        {actions && <div className="animate-rise mt-9 flex flex-wrap items-center gap-3 [--delay:280]">{actions}</div>}
        {children}
      </Container>
    </section>
  );
}
