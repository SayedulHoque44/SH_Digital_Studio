import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import Icon from "@/components/shared/Icon";
import ButtonLink from "@/components/ui/ButtonLink";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { IHomeData } from "@/features/Public/interface/public.interface";

// Static class names (Tailwind can't see computed ones): how many columns the
// last card spans so an incomplete final row never leaves an empty patch.
const SM_SPAN: Record<number, string> = { 1: "sm:col-span-1", 2: "sm:col-span-2" };
const XL_SPAN: Record<number, string> = { 1: "xl:col-span-1", 2: "xl:col-span-2", 3: "xl:col-span-3", 4: "xl:col-span-4" };
const lastCardSpan = (count: number) => {
  const smSpan = count % 2 === 1 ? 2 : 1; // 2 columns from sm
  const xlSpan = 4 - (count % 4 || 4) + 1; // 4 columns from xl
  return `${SM_SPAN[smSpan]} ${XL_SPAN[xlSpan]}`;
};

// "What we build": every item links to its service page.
export default function ServicesGrid({ data }: { data: IHomeData["services"] }) {
  if (!data.items.length) return null;
  const lastSpan = lastCardSpan(data.items.length);

  return (
    <Section tone="dark" aria-labelledby="services-heading">
      <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-40 mask-fade-y" />
      <div className="relative">
        <SectionHeading
          id="services-heading"
          eyebrow="Services"
          title={data.heading || "What we build"}
          intro={data.intro}
          action={
            <ButtonLink href="/services" variant="outline-light" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
              All services
            </ButtonLink>
          }
        />
        {/* 1px gaps over a tinted background draw consistent hairline dividers */}
        <ul className="grid gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {data.items.map((service, index) => (
            <li
              key={service.id}
              data-reveal
              style={{ "--reveal-delay": (index % 4) * 80 } as CSSProperties}
              className={index === data.items.length - 1 ? `bg-ink-950 ${lastSpan}` : "bg-ink-950"}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group relative flex h-full min-h-[15.5rem] flex-col p-7 transition-colors duration-500 hover:bg-white/[0.04] focus-visible:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-ink-400 transition-colors group-hover:text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon name={service.icon} className="size-6 text-ink-300 transition-colors group-hover:text-accent" />
                </div>
                <h3 className="mt-auto pt-10 font-display text-[1.3rem] font-semibold leading-snug tracking-[-0.02em] text-paper-50">
                  {service.title}
                </h3>
                {service.shortDescription && (
                  <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-300">{service.shortDescription}</p>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-200 transition-colors group-hover:text-accent">
                  Learn more
                  <LuArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
