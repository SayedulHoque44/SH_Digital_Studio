import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import Icon from "@/components/shared/Icon";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { getCategories, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Industries we build for",
    description:
      "Websites and applications for restaurants, gyms, travel, photography, beauty, real estate, retail, education and more.",
    path: "/industries",
    image: "/og/pages/industries",
  });
}

export default async function IndustriesPage() {
  const categories = (await getCategories()) || [];
  const industries = categories.filter((category) => !category.parentId);
  const childrenOf = (id: string) => categories.filter((category) => category.parentId === id);

  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={
          <>
            Built around the way <span className="font-serif font-normal italic tracking-[-0.02em]">your industry</span> works.
          </>
        }
        intro="Each industry page shows relevant demos, what we typically build and how to get started. Share the one that fits your business."
      />
      <section aria-label="Industries" className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {industries.map((industry, index) => {
              const children = childrenOf(industry.id);
              const live = industry.projectCount > 0;
              return (
                <li
                  key={industry.id}
                  data-reveal
                  style={{ "--reveal-delay": (index % 3) * 80 } as CSSProperties}
                  className={cn(children.length > 0 && "md:col-span-2 xl:col-span-3")}
                >
                  <div className="group relative flex h-full flex-col rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10 transition-shadow duration-500 hover:[box-shadow:var(--shadow-card)]">
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-paper-200 transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-contrast">
                        <Icon name={industry.icon} className="size-6" />
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-medium",
                          live ? "bg-ink-950 text-paper-50" : "bg-paper-200 text-stone-600",
                        )}
                      >
                        {live ? `${industry.projectCount} live ${industry.projectCount === 1 ? "demo" : "demos"}` : "Demos in production"}
                      </span>
                    </div>
                    <h2 className="mt-8 font-display text-[1.5rem] font-semibold tracking-[-0.025em]">
                      {/* Stretched link: the whole card is clickable, sub-category links stay separate */}
                      <Link href={`/demos/${industry.slug}`} className="after:absolute after:inset-0 after:rounded-[1.4rem]">
                        {industry.name}
                      </Link>
                    </h2>
                    {industry.shortDescription && (
                      <p className="mt-3 max-w-2xl leading-relaxed text-stone-600">{industry.shortDescription}</p>
                    )}
                    {children.length > 0 && (
                      <ul className="relative z-10 mt-6 flex flex-wrap gap-2">
                        {children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/demos/${child.slug}`}
                              className="inline-flex h-9 items-center gap-2 rounded-full bg-paper-200 px-4 text-sm transition-colors hover:bg-ink-950 hover:text-paper-50"
                            >
                              {child.name}
                              {child.projectCount > 0 && <span className="text-xs opacity-60">{child.projectCount}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium">
                      {live ? "Explore demos" : "See what we build"}
                      <LuArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
}
