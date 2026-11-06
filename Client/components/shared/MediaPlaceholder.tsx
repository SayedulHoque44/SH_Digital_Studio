import { LogoSymbol } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

// Honest placeholder shown until real media is supplied - never a fake image.
export default function MediaPlaceholder({
  label = "Preview coming soon",
  className,
  tone = "light",
}: {
  label?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden",
        tone === "light" ? "bg-paper-200 text-stone-600 bg-grid-paper" : "bg-ink-800 text-ink-300 bg-grid-ink",
        className,
      )}
    >
      <LogoSymbol className={cn("size-9 opacity-60", tone === "light" ? "text-ink-700" : "text-ink-300")} />
      <span className="text-eyebrow">{label}</span>
    </div>
  );
}
