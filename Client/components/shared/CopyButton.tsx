"use client";

import { useEffect, useRef, useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { cn } from "@/lib/utils";

// navigator.clipboard needs a secure context; fall back to a hidden textarea
const copyText = async (value: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy method
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
};

/**
 * Copy-to-clipboard button with accessible feedback: the result is announced
 * through an aria-live region and shown visually for a moment.
 */
export default function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  className,
  tone = "light",
  size = "md",
}: {
  value: string;
  label: string;
  copiedLabel?: string;
  className?: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(value);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium transition-colors",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        tone === "dark"
          ? "bg-white/[0.08] text-paper-50 ring-1 ring-white/15 hover:bg-white/15"
          : "bg-paper-50 text-ink-900 ring-1 ring-ink-900/12 hover:ring-ink-900/30",
        className,
      )}
    >
      {state === "copied" ? (
        <LuCheck aria-hidden className="size-4 text-success" />
      ) : (
        <LuCopy aria-hidden className="size-4" />
      )}
      <span>{state === "copied" ? copiedLabel : state === "failed" ? "Copy failed" : label}</span>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? `${copiedLabel} to clipboard` : state === "failed" ? "Could not copy" : ""}
      </span>
    </button>
  );
}
