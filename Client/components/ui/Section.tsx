import React from "react";
import { cn } from "@/lib/utils";
import Container from "./Container";

type TSectionProps = {
  children: React.ReactNode;
  tone?: "paper" | "paper-alt" | "white" | "dark";
  className?: string;
  containerClassName?: string;
  containerSize?: "default" | "narrow" | "wide";
  id?: string;
  as?: "section" | "div";
  "aria-labelledby"?: string;
};

const tones = {
  paper: "bg-paper-100 text-ink-900",
  "paper-alt": "bg-paper-200/70 text-ink-900",
  white: "bg-paper-50 text-ink-900",
  dark: "surface-dark bg-ink-950 text-paper-100",
};

export function Section({
  children,
  tone = "paper",
  className,
  containerClassName,
  containerSize,
  id,
  as: Tag = "section",
  ...rest
}: TSectionProps) {
  return (
    <Tag id={id} className={cn("relative py-[clamp(4.5rem,9vw,8.5rem)]", tones[tone], className)} {...rest}>
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </Tag>
  );
}

type THeadingProps = {
  // Text, or a placeholder in skeletons (components/features/Skeletons)
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "lg" | "md";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  id,
  align = "left",
  as: Tag = "h2",
  size = "lg",
  className,
}: THeadingProps) {
  return (
    <div
      className={cn(
        "mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
        <Tag id={id} className={size === "lg" ? "text-display-lg" : "text-display-md"}>
          {title}
        </Tag>
        {intro && (
          <p className="text-lead mt-5 max-w-2xl text-stone-600 [.surface-dark_&]:text-ink-300">
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-eyebrow inline-flex items-center gap-2.5 text-stone-600 [.surface-dark_&]:text-ink-300",
        className,
      )}
    >
      <span aria-hidden className="inline-block size-1.5 rounded-[1px] bg-accent" />
      {children}
    </p>
  );
}
