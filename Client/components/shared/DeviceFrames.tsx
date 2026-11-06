import React from "react";
import { hostnameOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IMedia } from "@/features/Public/interface/public.interface";
import SmartImage from "./SmartImage";

/*
 * Lightweight CSS device mockups (no images or 3D libraries). Used for the
 * hero composition, project cards and project detail pages.
 */

export function BrowserFrame({
  url,
  children,
  className,
  tone = "dark",
}: {
  url?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] shadow-[var(--shadow-frame)] ring-1",
        tone === "dark" ? "bg-ink-800 ring-white/10" : "bg-paper-50 ring-ink-900/10",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-8 items-center gap-3 border-b px-3",
          tone === "dark" ? "border-white/[0.06] bg-ink-850" : "border-ink-900/[0.06] bg-paper-100",
        )}
        aria-hidden
      >
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/85" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/85" />
          <span className="size-2.5 rounded-full bg-[#28c840]/85" />
        </div>
        {url && (
          <div
            className={cn(
              "mx-auto flex h-5 max-w-[60%] flex-1 items-center justify-center truncate rounded-md px-3 font-mono text-[10px]",
              tone === "dark" ? "bg-white/[0.05] text-ink-300" : "bg-ink-900/[0.04] text-stone-600",
            )}
          >
            {hostnameOf(url)}
          </div>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

export function PhoneFrame({
  image,
  className,
  sizes = "(max-width: 768px) 40vw, 260px",
  priority,
}: {
  image?: IMedia;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19.5] overflow-hidden rounded-[2.1rem] bg-ink-950 p-[7px] shadow-[var(--shadow-frame)] ring-1 ring-white/15",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-ink-800">
        <SmartImage
          src={image?.url}
          alt={image?.alt || ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
          placeholderLabel="Mobile preview"
        />
        {/* Dynamic island */}
        <span aria-hidden className="absolute left-1/2 top-2 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-ink-950" />
      </div>
    </div>
  );
}
