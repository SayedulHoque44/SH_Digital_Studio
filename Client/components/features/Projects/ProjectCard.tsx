import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { BrowserFrame, PhoneFrame } from "@/components/shared/DeviceFrames";
import SmartImage from "@/components/shared/SmartImage";
import Badge from "@/components/ui/Badge";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IProjectCard } from "@/features/Public/interface/public.interface";

type TCardSize = "lg" | "md" | "sm";

const aspect: Record<TCardSize, string> = {
  lg: "aspect-[16/10]",
  md: "aspect-[16/10]",
  sm: "aspect-[16/10]",
};

const imageSizes: Record<TCardSize, string> = {
  lg: "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 820px",
  md: "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px",
  sm: "(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 440px",
};

/**
 * Visual for the card. Websites show a full-bleed screenshot; mobile apps
 * show phone mockups; web/desktop/SaaS applications show their interface in
 * a browser frame - so different kinds of work never look identical.
 */
function CardVisual({
  project,
  size,
  priority,
}: {
  project: IProjectCard;
  size: TCardSize;
  priority?: boolean;
}) {
  const imageClass =
    "object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]";

  if (project.projectType === "mobile-app") {
    return (
      <div className="relative flex h-full items-end justify-center gap-4 overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-ink-700),var(--color-ink-950))] px-8 pt-8">
        <PhoneFrame
          image={project.mobilePreview || project.coverImage}
          className="w-[34%] translate-y-[14%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-[8%]"
          sizes="(max-width: 768px) 35vw, 220px"
          priority={priority}
        />
        {project.coverImage && project.mobilePreview && (
          <PhoneFrame
            image={project.coverImage}
            className="hidden w-[30%] translate-y-[24%] opacity-90 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-[18%] sm:block"
            sizes="(max-width: 768px) 30vw, 200px"
          />
        )}
      </div>
    );
  }

  if (project.projectType !== "website" && project.projectType !== "ui-ux") {
    return (
      <div className="relative h-full overflow-hidden bg-[linear-gradient(140deg,var(--color-paper-200),var(--color-paper-300))] px-[7%] pt-[7%]">
        <BrowserFrame
          url={project.liveUrl}
          tone="light"
          className="h-full rounded-b-none transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5"
        >
          <div className="relative aspect-[16/10]">
            <SmartImage
              src={project.coverImage?.url}
              alt={project.coverImage?.alt || ""}
              fill
              sizes={imageSizes[size]}
              priority={priority}
              className="object-cover object-top"
              placeholderLabel="Interface preview coming soon"
            />
          </div>
        </BrowserFrame>
      </div>
    );
  }

  return (
    <SmartImage
      src={project.coverImage?.url}
      alt={project.coverImage?.alt || `${project.title} website preview`}
      fill
      sizes={imageSizes[size]}
      priority={priority}
      className={imageClass}
      placeholderLabel="Screenshots coming soon"
    />
  );
}

export default function ProjectCard({
  project,
  size = "md",
  priority,
  headingLevel = "h3",
  className,
  showSummary = true,
}: {
  project: IProjectCard;
  size?: TCardSize;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
  showSummary?: boolean;
}) {
  const Heading = headingLevel;
  const kicker = project.subcategory || PROJECT_TYPE_LABELS[project.projectType];

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/projects/${project.slug}`} className="block rounded-[1.4rem]">
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.4rem] bg-ink-900 ring-1 ring-ink-900/10 [box-shadow:var(--shadow-card)]",
            aspect[size],
          )}
        >
          <CardVisual project={project} size={size} priority={priority} />
          {/* Hover affordance */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-4 left-4 inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-paper-50 px-3.5 py-2 text-sm font-medium text-ink-950 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
            View project <LuArrowUpRight aria-hidden className="size-4" />
          </span>
          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
            <Badge tone="glass">
              {project.isClientWork ? "Client project" : PROJECT_STATUS_LABELS[project.projectStatus]}
            </Badge>
            {project.projectType !== "website" && (
              <Badge tone="glass">{PROJECT_TYPE_LABELS[project.projectType]}</Badge>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-eyebrow text-stone-600">{kicker}</p>
            <Heading
              className={cn(
                "mt-2 font-display font-semibold tracking-[-0.025em] text-ink-950 transition-colors",
                size === "lg" ? "text-[1.75rem] leading-tight" : "text-[1.35rem] leading-snug",
              )}
            >
              {project.title}
            </Heading>
            {showSummary && project.summary && (
              <p className="mt-2 line-clamp-2 max-w-[60ch] text-[0.97rem] leading-relaxed text-stone-600">
                {project.summary}
              </p>
            )}
          </div>
          <span
            aria-hidden
            className="mt-1 hidden size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-ink-900/15 transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink-950 group-hover:text-paper-50 sm:flex"
          >
            <LuArrowUpRight className="size-5" />
          </span>
        </div>
      </Link>

      {/* Separate link (never nested inside the card link) */}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 z-10 inline-flex h-8 items-center gap-1 rounded-full bg-ink-950/55 px-3 text-xs font-medium text-paper-50 ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-ink-950/80"
        >
          Live demo <LuArrowUpRight aria-hidden className="size-3.5" />
          <span className="sr-only"> of {project.title} (opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}
