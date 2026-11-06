import { LogoSymbol } from "@/components/brand/Logo";
import SmartImage from "@/components/shared/SmartImage";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IMedia } from "@/features/Public/interface/public.interface";

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Available for new projects",
  limited: "Limited availability",
  unavailable: "Currently fully booked",
};

/**
 * Real profile photo uploaded in the admin. Until one is supplied, a
 * monogram placeholder is shown - never a generated or stock face.
 * size="sm" renders a compact avatar (no availability caption).
 */
export default function ProfilePortrait({
  name,
  photo,
  availability,
  className,
  priority,
  size = "lg",
}: {
  name: string;
  photo?: IMedia;
  availability?: { status: string; note?: string };
  className?: string;
  priority?: boolean;
  size?: "lg" | "sm";
}) {
  const small = size === "sm";
  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden bg-ink-950 ring-1 ring-ink-900/10",
          small ? "rounded-2xl" : "rounded-[1.75rem]",
        )}
      >
        {photo?.url ? (
          <SmartImage
            src={photo.url}
            alt={photo.alt || `Portrait of ${name}`}
            fill
            priority={priority}
            sizes={small ? "96px" : "(max-width: 1024px) 90vw, 520px"}
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              "surface-dark flex h-full flex-col items-center justify-center text-paper-50",
              small ? "gap-0" : "bg-grid-ink gap-6",
            )}
          >
            <span
              className={cn(
                "font-display font-semibold leading-none",
                small ? "text-3xl tracking-[-0.04em]" : "text-[clamp(5rem,14vw,9rem)] tracking-[-0.06em]",
              )}
            >
              {initials(name)}
            </span>
            {!small && <LogoSymbol className="size-10 text-ink-300" />}
          </div>
        )}
      </div>
      {availability && !small && (
        <figcaption className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-ink-950/80 px-4 py-3 text-sm text-paper-50 ring-1 ring-white/10 backdrop-blur-md">
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              availability.status === "available"
                ? "animate-pulse-dot bg-accent"
                : availability.status === "limited"
                  ? "bg-warning"
                  : "bg-ink-400",
            )}
          />
          <span>{availability.note || AVAILABILITY_LABEL[availability.status] || availability.status}</span>
        </figcaption>
      )}
    </figure>
  );
}
