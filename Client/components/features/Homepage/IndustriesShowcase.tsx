import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowRight, LuArrowUpRight, LuMessageCircle } from "react-icons/lu";
import Icon from "@/components/shared/Icon";
import SmartImage from "@/components/shared/SmartImage";
import ButtonLink from "@/components/ui/ButtonLink";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import type { ICategoryCard, IHomeData, IProjectCard } from "@/features/Public/interface/public.interface";

function IndustryCard({
  industry,
  previews,
  featured,
}: {
  industry: ICategoryCard;
  previews: IProjectCard[];
  featured: boolean;
}) {
  const hasDemos = industry.projectCount > 0;
  return (
    <Link
      href={`/demos/${industry.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10 transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:[box-shadow:var(--shadow-card)]",
        featured && "lg:p-9",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-paper-200 text-ink-900 transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-contrast">
          <Icon name={industry.icon} className="size-6" />
        </span>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium",
            hasDemos ? "bg-ink-950 text-paper-50" : "bg-paper-200 text-stone-600",
          )}
        >
          {hasDemos ? `${industry.projectCount} live ${industry.projectCount === 1 ? "demo" : "demos"}` : "Demos in production"}
        </span>
      </div>

      <h3 className={cn("mt-8 font-display font-semibold tracking-[-0.025em] text-ink-950", featured ? "text-[2rem] leading-tight" : "text-[1.4rem] leading-snug")}>
        {industry.name}
      </h3>
      {industry.shortDescription && (
        <p className="mt-3 max-w-[52ch] text-[0.97rem] leading-relaxed text-stone-600">{industry.shortDescription}</p>
      )}

      {featured && previews.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-3" aria-hidden>
          {previews.slice(0, 3).map((project, index) => (
            <div
              key={project.id}
              className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-900 ring-1 ring-ink-900/10 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <SmartImage
                src={project.mobilePreview?.url || project.coverImage?.url}
                alt=""
                fill
                sizes="(max-width: 768px) 30vw, 200px"
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>
      )}

      <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-ink-900">
        {hasDemos ? "Explore demos" : "See what we build"}
        <LuArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

// Closing card: invites businesses from industries not listed yet.
function OtherIndustryCard() {
  return (
    <Link
      href="/contact"
      className="surface-dark group flex h-full flex-col rounded-[1.4rem] bg-ink-950 p-7 text-paper-50 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
        <LuMessageCircle aria-hidden className="size-6" />
      </span>
      <h3 className="mt-8 font-display text-[1.4rem] font-semibold leading-snug tracking-[-0.025em]">
        Don&apos;t see your industry?
      </h3>
      <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-300">
        Every website is designed around the business it serves. Tell us about yours.
      </p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium text-accent">
        Start a conversation
        <LuArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/**
 * Grid placement that never leaves holes, whatever number of industries is
 * selected in the admin: the first card spans 2x2 on large screens, the
 * others flow around it and the final card stretches to fill its row.
 */
const lastCardSpan = (smallCards: number) => {
  // lg: first 2 small cards sit beside the featured card, then rows of 3
  const lgLeftover = smallCards <= 2 ? 0 : (smallCards - 2) % 3;
  // md: rows of 2 below the full-width featured card
  const mdLeftover = smallCards % 2;
  return cn(mdLeftover === 1 && "md:col-span-2", lgLeftover === 1 && "lg:col-span-3", lgLeftover === 2 && "lg:col-span-2", lgLeftover === 0 && "lg:col-span-1");
};

export default function IndustriesShowcase({
  data,
  previews,
}: {
  data: IHomeData["industries"];
  previews: IProjectCard[];
}) {
  if (!data.items.length) return null;
  const [first, ...rest] = data.items;
  const smallCards = rest.length + 1; // + the "other industry" card

  return (
    <Section tone="paper" aria-labelledby="industries-heading">
      <SectionHeading
        id="industries-heading"
        eyebrow="Industries"
        title={data.heading || "Built around your industry"}
        intro={data.intro}
        action={
          <ButtonLink href="/industries" variant="outline" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
            All industries
          </ButtonLink>
        }
      />
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <li data-reveal className="md:col-span-2 lg:row-span-2">
          <IndustryCard industry={first} previews={previews} featured />
        </li>
        {rest.map((industry, index) => (
          <li key={industry.id} data-reveal style={{ "--reveal-delay": (index % 2) * 90 } as CSSProperties}>
            <IndustryCard industry={industry} previews={[]} featured={false} />
          </li>
        ))}
        <li data-reveal className={lastCardSpan(smallCards)}>
          <OtherIndustryCard />
        </li>
      </ul>
    </Section>
  );
}
