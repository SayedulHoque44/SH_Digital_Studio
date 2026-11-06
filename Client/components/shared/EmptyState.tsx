import React from "react";
import { LogoSymbol } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export default function EmptyState({
  title,
  description,
  action,
  className,
  tone = "light",
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed px-6 py-14 text-center sm:px-12",
        tone === "light" ? "border-ink-900/15 bg-paper-50" : "border-white/15 bg-white/[0.03]",
        className,
      )}
    >
      <LogoSymbol
        className={cn("mx-auto mb-5 size-10", tone === "light" ? "text-ink-800" : "text-paper-100")}
      />
      <h3 className="text-display-sm">{title}</h3>
      {description && (
        <div
          className={cn(
            "mx-auto mt-3 max-w-xl text-[1.02rem] leading-relaxed",
            tone === "light" ? "text-stone-600" : "text-ink-300",
          )}
        >
          {description}
        </div>
      )}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
