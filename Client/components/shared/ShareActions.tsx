"use client";

import { useSyncExternalStore } from "react";
import { LuMail, LuShare2 } from "react-icons/lu";
import { cn } from "@/lib/utils";
import CopyButton from "./CopyButton";

/**
 * Share controls for industry and project pages: copy link, the device's
 * native share sheet (where supported) and a prefilled e-mail.
 */
const noSubscription = () => () => {};

export default function ShareActions({
  url,
  title,
  text,
  tone = "light",
  className,
}: {
  url: string;
  title: string;
  text?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  // Native sharing is a browser capability: false while server rendering,
  // read from the browser after hydration (no mismatch, no effect)
  const canShare = useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false,
  );

  const handleShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // user dismissed the share sheet - nothing to do
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
    `${text ? `${text}\n\n` : ""}${url}`,
  )}`;

  const pill =
    tone === "dark"
      ? "bg-white/[0.08] text-paper-50 ring-1 ring-white/15 hover:bg-white/15"
      : "bg-paper-50 text-ink-900 ring-1 ring-ink-900/12 hover:ring-ink-900/30";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <CopyButton value={url} label="Copy link" copiedLabel="Link copied" tone={tone} />
      {canShare && (
        <button
          type="button"
          onClick={handleShare}
          className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors", pill)}
        >
          <LuShare2 aria-hidden className="size-4" />
          Share
        </button>
      )}
      <a
        href={mailto}
        className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors", pill)}
      >
        <LuMail aria-hidden className="size-4" />
        Email
      </a>
    </div>
  );
}
