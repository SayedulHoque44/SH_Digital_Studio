import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import Icon from "@/components/shared/Icon";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { Eyebrow } from "@/components/ui/Section";
import { getCategories, getProjects, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Website demo library",
    description:
      "Live website demos grouped by industry. Open any demo on your phone, or share the page that fits your business.",
    path: "/demos",
    image: "/og/pages/demos",
  });
}

export default async function DemosPage() {
  const [categories, projects] = await Promise.all([getCategories(), getProjects("limit=100&sort=order")]);
  const all = (categories || []).filter((category) => !category.parentId);
  const websites = (projects?.result || []).filter((project) => project.projectType === "website");

  // A project belongs to an industry directly or through a sub-category
  const childSlugs = (parentId: string) =>
    (categories || []).filter((category) => category.parentId === parentId).map((category) => category.slug);
  const projectsFor = (id: string, slug: string) => {
    const slugs = new Set([slug, ...childSlugs(id)]);
    return websites.filter((project) => project.categories.some((category) => slugs.has(category.slug)));
  };

  const withDemos = all
    .map((category) => ({ category, projects: projectsFor(category.id, category.slug) }))
    .filter((item) => item.projects.length > 0);
  const upcoming = all.filter((category) => !withDemos.some((item) => item.category.id === category.id));

  return (
    <>
      <PageHero
        eyebrow="Demo library"
        title={
          <>
            Website demos,{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em]">by industry</span>.
          </>
        }
        intro="Live, working website concepts grouped by industry. Open any demo on your phone — or share the page that fits your business."
      />

      <div className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container className="space-y-24">
          {withDemos.map(({ category, projects: items }) => (
            <section key={category.id} aria-labelledby={`industry-${category.slug}`}>
              <div className="mb-10 flex flex-col gap-6 border-t border-ink-900/10 pt-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <Eyebrow className="mb-4">
                    {items.length} live {items.length === 1 ? "demo" : "demos"}
                  </Eyebrow>
                  <h2 id={`industry-${category.slug}`} className="text-display-md">
                    {category.name}
                  </h2>
                  {category.shortDescription && <p className="mt-4 text-stone-600">{category.shortDescription}</p>}
                </div>
                <ButtonLink
                  href={`/demos/${category.slug}`}
                  variant="primary"
                  rightIcon={<LuArrowRight aria-hidden className="size-4" />}
                >
                  View industry page
                </ButtonLink>
              </div>
              <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                {items.slice(0, 6).map((project, index) => (
                  <li key={project.id} data-reveal style={{ "--reveal-delay": (index % 3) * 90 } as CSSProperties}>
                    <ProjectCard project={project} size="sm" priority={index < 3} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {upcoming.length > 0 && (
            <section aria-labelledby="upcoming-heading" className="border-t border-ink-900/10 pt-10">
              <Eyebrow className="mb-4">In production</Eyebrow>
              <h2 id="upcoming-heading" className="text-display-md">
                More industries
              </h2>
              <p className="mt-4 max-w-2xl text-stone-600">
                Demos for these industries are on the way. Each page already explains what we build — and your site is
                always designed from scratch, so there&apos;s no need to wait.
              </p>
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/demos/${category.slug}`}
                      className="group flex items-center gap-4 rounded-2xl bg-paper-50 p-5 ring-1 ring-ink-900/10 transition-shadow hover:[box-shadow:var(--shadow-card)]"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper-200">
                        <Icon name={category.icon} className="size-5" />
                      </span>
                      <span className="flex-1 font-display text-[1.1rem] font-semibold tracking-[-0.015em]">
                        {category.name}
                      </span>
                      <LuArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </div>
    </>
  );
}
