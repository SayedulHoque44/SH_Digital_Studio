import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { CSSProperties } from "react";
import { LuArrowDown, LuArrowRight, LuArrowUpRight, LuCheck } from "react-icons/lu";
import ProfilePortrait from "@/components/features/About/ProfilePortrait";
import BlockRenderer from "@/components/features/Blocks/BlockRenderer";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import CtaBand from "@/components/shared/CtaBand";
import EmptyState from "@/components/shared/EmptyState";
import FaqList from "@/components/shared/FaqList";
import Icon from "@/components/shared/Icon";
import JsonLd from "@/components/shared/JsonLd";
import Markdown from "@/components/shared/Markdown";
import ShareActions from "@/components/shared/ShareActions";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  getCategories,
  getCategory,
  getProfile,
  getProjects,
  getSettings,
  isRedirect,
} from "@/features/Public/apis/public.api";
import type { ICategoryDetail } from "@/features/Public/interface/public.interface";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type TParams = Promise<{ slug: string }>;

// Pre-render every published industry page at build time (ISR afterwards).
export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return (categories || []).map((category) => ({ slug: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: TParams }): Promise<Metadata> {
  const { slug } = await params;
  const [settings, data] = await Promise.all([getSettings(), getCategory(slug)]);
  if (!data) notFound();
  // A renamed slug: the page itself issues the 308 (redirecting here as well
  // sent the Location header twice)
  if (isRedirect(data)) return {};
  return buildMetadata({
    settings,
    title: data.seo?.title || `${data.name} — website demos`,
    description: data.seo?.description || data.shortDescription,
    path: `/demos/${data.slug}`,
    image: `/og/demos/${data.slug}`,
    imageAlt: `${data.name} website demos by ${settings.brand.name}`,
    seo: data.seo,
  });
}

/**
 * Shareable industry landing page, e.g. /demos/restaurants or /demos/gyms.
 * Designed so a business owner who receives the link lands directly on
 * relevant work, understands what is offered and can act immediately.
 */
export default async function IndustryDemosPage({ params }: { params: TParams }) {
  const { slug } = await params;
  const data = await getCategory(slug);
  if (!data) notFound();
  if (isRedirect(data)) permanentRedirect(`/demos/${data.redirectSlug}`);
  const category = data as ICategoryDetail;

  const [settings, profile] = await Promise.all([getSettings(), getProfile().catch(() => null)]);
  const hasDemos = category.projects.length > 0;
  const otherWork = hasDemos ? [] : (await getProjects("limit=6&sort=featured"))?.result || [];
  const pageUrl = absoluteUrl(`/demos/${category.slug}`);
  const contactHref = `/contact?industry=${encodeURIComponent(category.slug)}`;

  const crumbs = [
    { label: "Demos", href: "/demos" },
    ...(category.parent ? [{ label: category.parent.name, href: `/demos/${category.parent.slug}` }] : []),
    { label: category.name, href: `/demos/${category.slug}` },
  ];

  return (
    <>
      <PageHero
        tone="dark"
        breadcrumbs={crumbs}
        eyebrow={category.parent ? `${category.parent.name} · website demos` : "Website demos"}
        title={category.name}
        intro={category.shortDescription}
        actions={
          <>
            <ButtonLink href={contactHref} variant="accent" size="lg" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
              Request a custom website
            </ButtonLink>
            {hasDemos && (
              <ButtonLink href="#demos" variant="outline-light" size="lg" rightIcon={<LuArrowDown aria-hidden className="size-4" />}>
                {category.projects.length} live {category.projects.length === 1 ? "demo" : "demos"}
              </ButtonLink>
            )}
          </>
        }
      >
        <div className="animate-fade-in mt-12 flex flex-col gap-8 border-t border-white/10 pt-8 [--delay:400] lg:flex-row lg:items-center lg:justify-between">
          {category.children.length > 0 ? (
            <nav aria-label={`${category.name} sub-categories`}>
              <ul className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <li key={child.slug}>
                    <Link
                      href={`/demos/${child.slug}`}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm text-ink-200 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-paper-50"
                    >
                      {child.name}
                      {child.projectCount > 0 && <span className="text-xs text-ink-400">{child.projectCount}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="text-sm text-ink-400">Share this page with your team</p>
          )}
          <ShareActions
            url={pageUrl}
            title={`${category.name} — website demos by ${settings.brand.name}`}
            text={category.emailIntro || category.shortDescription}
            tone="dark"
            className="shrink-0 lg:flex-nowrap"
          />
        </div>
      </PageHero>

      {/* Personal note for visitors arriving from a shared link */}
      {category.emailIntro && profile && (
        <section aria-label="A note from the developer" className="bg-paper-100 pt-[clamp(3rem,6vw,5rem)]">
          <Container size="narrow">
            <figure data-reveal className="flex flex-col gap-6 rounded-[1.75rem] bg-paper-50 p-6 ring-1 ring-ink-900/10 sm:flex-row sm:items-center sm:p-8">
              <ProfilePortrait name={profile.name} photo={profile.photo} size="sm" className="w-20 shrink-0" />
              <div>
                <blockquote className="font-display text-[1.25rem] leading-snug tracking-[-0.015em] text-ink-900">
                  “{category.emailIntro}”
                </blockquote>
                <figcaption className="mt-3 text-sm text-stone-600">
                  — {profile.name}
                  {profile.title ? `, ${profile.title}` : ""}
                </figcaption>
              </div>
            </figure>
          </Container>
        </section>
      )}

      {/* Demos */}
      <section id="demos" aria-labelledby="demos-heading" className="scroll-mt-28 bg-paper-100 py-[clamp(4rem,8vw,7rem)]">
        <Container>
          {hasDemos ? (
            <>
              <SectionHeading
                id="demos-heading"
                eyebrow="Live demos"
                title={`${category.name} website demos`}
                intro="Each demo is a working website. Open it on your phone to see exactly how it would feel for your customers."
              />
              <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2">
                {category.projects.map((project, index) => (
                  <li key={project.id} data-reveal style={{ "--reveal-delay": (index % 2) * 110 } as CSSProperties}>
                    <ProjectCard project={project} size="lg" priority={index < 2} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 id="demos-heading" className="sr-only">
                Demos
              </h2>
              <EmptyState
                title={`${category.name} demos are in production`}
                description={
                  <>
                    New demos for this industry are on the way. A website for your business is always designed from
                    scratch, so you don&apos;t need to wait — the work below shows the quality you can expect.
                  </>
                }
                action={
                  <>
                    <ButtonLink href={contactHref} variant="primary">
                      Talk about your website
                    </ButtonLink>
                    <ButtonLink href="/work" variant="outline">
                      Browse all work
                    </ButtonLink>
                  </>
                }
              />
              {otherWork.length > 0 && (
                <div className="mt-20">
                  <h3 className="text-display-sm mb-10">Recent work from other industries</h3>
                  <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
                    {otherWork.map((project) => (
                      <li key={project.id} data-reveal>
                        <ProjectCard project={project} size="sm" headingLevel="h3" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* What we build for this industry */}
      {(category.highlights.length > 0 || category.introduction) && (
        <Section tone="white" aria-labelledby="industry-build-heading">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading
                id="industry-build-heading"
                eyebrow="What we build"
                title={`What we build for ${category.name}`}
                className="mb-6"
              />
              {category.introduction && <Markdown>{category.introduction}</Markdown>}
            </div>
            {category.highlights.length > 0 && (
              <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7">
                {category.highlights.map((item, index) => (
                  <li
                    key={item}
                    data-reveal
                    style={{ "--reveal-delay": (index % 2) * 80 } as CSSProperties}
                    className="flex gap-3 rounded-2xl bg-paper-100 p-5 ring-1 ring-ink-900/[0.07]"
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
                      <LuCheck aria-hidden className="size-3.5" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      )}

      {category.contentBlocks.length > 0 && (
        <Section tone="paper">
          <BlockRenderer blocks={category.contentBlocks} />
        </Section>
      )}

      {category.relatedServices.length > 0 && (
        <Section tone="paper" aria-labelledby="industry-services-heading">
          <SectionHeading id="industry-services-heading" eyebrow="Services" title="How we can help" />
          <ul className="grid gap-5 md:grid-cols-3">
            {category.relatedServices.map((service) => (
              <li key={service.id} data-reveal>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10 transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:[box-shadow:var(--shadow-card)]"
                >
                  <Icon name={service.icon} className="size-7 text-ink-900" />
                  <h3 className="mt-6 font-display text-[1.3rem] font-semibold tracking-[-0.02em]">{service.title}</h3>
                  {service.shortDescription && <p className="mt-3 leading-relaxed text-stone-600">{service.shortDescription}</p>}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium">
                    Learn more
                    <LuArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {category.faqs.length > 0 && (
        <Section tone="white" aria-labelledby="industry-faq-heading" containerSize="narrow">
          <SectionHeading id="industry-faq-heading" eyebrow="FAQ" title="Questions, answered" size="md" />
          <FaqList faqs={category.faqs} />
        </Section>
      )}

      <CtaBand
        heading={category.cta?.heading || `Want a website like these for your business?`}
        text={category.cta?.text || "Tell me about your business and I'll suggest the best starting point and a clear plan."}
        buttonLabel={category.cta?.buttonLabel || "Request a custom website"}
        contactHref={contactHref}
        settings={settings}
        whatsappContext={{ page: pageUrl, industry: category.name }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${category.name} website demos`,
          description: category.shortDescription,
          url: pageUrl,
          isPartOf: { "@type": "WebSite", name: settings.brand.name, url: absoluteUrl("/") },
          ...(hasDemos
            ? {
                mainEntity: {
                  "@type": "ItemList",
                  itemListElement: category.projects.map((project, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    url: absoluteUrl(`/projects/${project.slug}`),
                    name: project.title,
                  })),
                },
              }
            : {}),
        }}
      />
    </>
  );
}
