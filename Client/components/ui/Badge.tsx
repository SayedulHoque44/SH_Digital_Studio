import React from "react";
import { cn } from "@/lib/utils";

type TBadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "dark" | "accent" | "outline" | "outline-light" | "glass";
  className?: string;
};

const tones = {
  neutral: "bg-paper-200 text-ink-800",
  dark: "bg-ink-900 text-paper-50",
  accent: "bg-accent text-accent-contrast",
  outline: "border border-ink-900/15 text-ink-800",
  "outline-light": "border border-white/15 text-ink-200",
  glass: "bg-ink-950/55 text-paper-50 backdrop-blur-md ring-1 ring-white/10",
};

export default function Badge({ children, tone = "neutral", className }: TBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium leading-none tracking-[0.01em] whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
