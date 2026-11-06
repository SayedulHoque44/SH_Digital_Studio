import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { LuArrowRight, LuCheck, LuCode, LuEye, LuInfo, LuPlay } from "react-icons/lu";
import BlockRenderer from "@/components/features/Blocks/BlockRenderer";
import CaseStudySections from "@/components/features/Projects/CaseStudySections";
import DemoAccessPanel from "@/components/features/Projects/DemoAccessPanel";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import ProjectShowcase from "@/components/features/Projects/ProjectShowcase";
import ScreensGallery from "@/components/features/Projects/ScreensGallery";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import CtaBand from "@/components/shared/CtaBand";
import Icon from "@/components/shared/Icon";
import JsonLd from "@/components/shared/JsonLd";
import Markdown from "@/components/shared/Markdown";
import ShareActions from "@/components/shared/ShareActions";
import VideoPlayer from "@/components/shared/VideoPlayer";
import Badge from "@/components/ui/Badge";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getProject, getProjects, getSettings, isRedirect } from "@/features/Public/apis/public.api";
import type { IProjectDetail } from "@/features/Public/interface/public.interface";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, formatDate, hostnameOf, isAppType } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type TParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const projects = await getProjects("limit=100");
    return (projects?.result || []).map((project) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: TParams }): Promise<Metadata> {
  const { slug } = await params;
  const [settings, data] = await Promise.all([getSettings(), getProject(slug)]);
  if (!data) notFound();
  // A renamed slug: the page itself issues the 308 (redirecting here as well
  // sent the Location header twice)
  if (isRedirect(data)) return {};
  const kind = data.subcategory || PROJECT_TYPE_LABELS[data.projectType];
  return buildMetadata({
    settings,
    title: data.seo?.title || `${data.title} — ${kind}`,
    description: data.seo?.description || data.summary || data.subtitle,
    path: `/projects/${data.slug}`,
    image: `/og/projects/${data.slug}`,
    imageAlt: `${data.title} — ${kind}`,
    seo: data.seo,
    type: "article",
    // Unlisted projects are shareable by link but kept out of search results
    noIndex: data.visibility === "unlisted" || data.isPreview,
  });
}

function Facts({ project }: { project: IProjectDetail }) {
  const rows = [
    project.categories.length
      ? {
          label: "Industry",
          value: (
            <span className="flex flex-wrap gap-x-1.5">
              {project.categories.map((category, index) => (
                <span key={category.slug}>
                  <Link href={`/demos/${category.slug}`} className="underline-offset-4 hover:underline">
                    {category.name}
                  </Link>
                  {index < project.categories.length - 1 && <span className="text-stone-500"> ·</span>}
                </span>
              ))}
            </span>
          ),
        }
      : null,
    project.subcategory ? { label: "Type of business", value: project.subcategory } : null,
    { label: "Project type", value: PROJECT_TYPE_LABELS[project.projectType] },
    {
      label: "Status",
      value: project.isClientWork ? `Client project${project.clientName ? ` — ${project.clientName}` : ""}` : PROJECT_STATUS_LABELS[project.projectStatus],
    },
    project.platforms.length ? { label: "Platforms", value: project.platforms.join(", ") } : null,
    project.links.liveUrl
      ? {
          label: "Live site",
          value: (
            <a href={project.links.liveUrl} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4">
              {hostnameOf(project.links.liveUrl)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ),
        }
      : null,
    project.publishedAt ? { label: "Published", value: formatDate(project.publishedAt, { month: "long", year: "numeric" }) } : null,
  ].filter(Boolean) as { label: string; value: ReactNode }[];

  return (
    <div className="rounded-[1.4rem] bg-paper-50 p-7 ring-1 ring-ink-900/10">
      <dl className="divide-y divide-ink-900/10">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5 text-[0.95rem] first:pt-0 last:pb-0">
            <dt className="text-stone-600">{row.label}</dt>
            <dd className="font-medium text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>
      {project.techStack.length > 0 && (
        <div className="mt-6 border-t border-ink-900/10 pt-6">
          <p className="text-eyebrow mb-3 text-stone-600">Built with</p>
          <ul className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className="rounded-full bg-paper-200 px-3 py-1.5 text-sm font-medium">
                {tech}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FeatureList({ items, heading, id }: { items: IProjectDetail["features"]; heading: string; id: string }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 id={id} className="text-display-md mb-8">
        {heading}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={item.title}
            data-reveal
            style={{ "--reveal-delay": (index % 3) * 80 } as CSSProperties}
            className="rounded-2xl bg-paper-50 p-6 ring-1 ring-ink-900/10"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-paper-200">
              {item.icon ? <Icon name={item.icon} className="size-4.5" /> : <LuCheck aria-hidden className="size-4.5" />}
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.02em]">{item.title}</h3>
            {item.description && <p className="mt-2 leading-relaxed text-stone-600">{item.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: TParams }) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) notFound();
  if (isRedirect(data)) permanentRedirect(`/projects/${data.redirectSlug}`);
  const project = data as IProjectDetail & { isPreview?: boolean };
  const settings = await getSettings();

  const primaryCategory = project.categories[0];
  const pageUrl = absoluteUrl(`/projects/${project.slug}`);
  const contactHref = `/contact?project=${encodeURIComponent(project.slug)}${
    primaryCategory ? `&industry=${encodeURIComponent(primaryCategory.slug)}` : ""
  }`;
  const isApp = isAppType(project.projectType);
  const kind = project.subcategory || PROJECT_TYPE_LABELS[project.projectType];

  return (
    <>
      {project.isPreview && (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-4 bg-warning px-4 py-3 text-sm font-medium text-ink-950">
          <LuEye aria-hidden className="size-4" />
          Draft preview — visible only to you while signed in.
          <a href="/preview/exit" className="underline underline-offset-4">
            Exit preview
          </a>
        </div>
      )}

      {/* Hero */}
      <section className="surface-dark relative overflow-x-clip bg-ink-950 pt-[calc(var(--announce-h,0px)+8.5rem)] text-paper-100 md:pt-[calc(var(--announce-h,0px)+10rem)]">
        <div aria-hidden className="bg-grid-ink pointer-events-none absolute inset-0 opacity-70 mask-fade-y" />
        <Container className="relative">
          <Breadcrumbs
            tone="dark"
            className="mb-8"
            items={[
              { label: "Work", href: "/work" },
              ...(primaryCategory ? [{ label: primaryCategory.name, href: `/demos/${primaryCategory.slug}` }] : []),
              { label: project.title, href: `/projects/${project.slug}` },
            ]}
          />
          <div className="animate-fade-in flex flex-wrap gap-2 [--delay:0]">
            <Badge tone="accent">{project.isClientWork ? "Client project" : PROJECT_STATUS_LABELS[project.projectStatus]}</Badge>
            <Badge tone="outline-light">{PROJECT_TYPE_LABELS[project.projectType]}</Badge>
            {project.subcategory && <Badge tone="outline-light">{project.subcategory}</Badge>}
          </div>
          <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="animate-rise text-display-xl max-w-[18ch] [--delay:60]">{project.title}</h1>
              {project.subtitle && (
                <p className="animate-rise text-lead mt-6 max-w-[56ch] text-ink-300 [--delay:160]">{project.subtitle}</p>
              )}
            </div>
            <div className="animate-rise flex flex-wrap gap-3 lg:col-span-4 lg:justify-end [--delay:260]">
              {project.links.liveUrl && (
                <ButtonLink href={project.links.liveUrl} variant="accent" size="lg">
                  {project.links.liveUrlLabel || (isApp ? "Launch app" : "Open live site")}
                </ButtonLink>
              )}
              <ButtonLink href={contactHref} variant="outline-light" size="lg">
                Request something similar
              </ButtonLink>
            </div>
          </div>
          <div className="animate-fade-in mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-ink-300 [--delay:400]">
            {project.video && (
              <a href="#video" className="inline-flex items-center gap-2 hover:text-paper-50">
                <LuPlay aria-hidden className="size-4" /> Watch demo
              </a>
            )}
            {project.links.secondaryUrl && (
              <a href={project.links.secondaryUrl} target="_blank" rel="noopener noreferrer" className="hover:text-paper-50">
                {project.links.secondaryUrlLabel || "Secondary preview"} ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {project.links.sourceUrl && (
              <a href={project.links.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-paper-50">
                <LuCode aria-hidden className="size-4" /> View source<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {project.links.appStoreUrl && (
              <a href={project.links.appStoreUrl} target="_blank" rel="noopener noreferrer" className="hover:text-paper-50">
                App Store ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {project.links.playStoreUrl && (
              <a href={project.links.playStoreUrl} target="_blank" rel="noopener noreferrer" className="hover:text-paper-50">
                Google Play ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <span className="ml-auto">
              <ShareActions url={pageUrl} title={`${project.title} — ${kind}`} text={project.summary} tone="dark" />
            </span>
          </div>
        </Container>
        <Container size="wide" className="relative z-10 mt-14">
          <div className="-mb-[clamp(4rem,12vw,11rem)]">
            <ProjectShowcase project={project} />
          </div>
        </Container>
      </section>

      {/* Overview + facts */}
      <section className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)] pt-[calc(clamp(4rem,12vw,11rem)+clamp(4rem,7vw,6rem))]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-eyebrow mb-5 text-stone-600">Overview</h2>
              {project.overview ? (
                <Markdown className="text-[1.1rem]">{project.overview}</Markdown>
              ) : (
                project.summary && <p className="text-lead text-stone-700">{project.summary}</p>
              )}
              {project.designHighlights.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">Design highlights</h3>
                  <ul className="mt-5 space-y-3">
                    {project.designHighlights.map((item) => (
                      <li key={item} className="flex gap-3 leading-relaxed">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-[1px] bg-ink-900" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {project.corePages.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">Pages</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.corePages.map((page) => (
                      <li key={page} className="rounded-full bg-paper-50 px-4 py-2 text-sm ring-1 ring-ink-900/10">
                        {page}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <aside className="space-y-6 lg:col-span-5">
              <Facts project={project} />
              {project.demoAccess && (
                <DemoAccessPanel access={project.demoAccess} appUrl={project.links.liveUrl} title={project.title} />
              )}
            </aside>
          </div>
        </Container>
      </section>

      {(project.features.length > 0 || project.modules.length > 0 || project.workflows.length > 0) && (
        <Section tone="white">
          <div className="space-y-20">
            <FeatureList items={project.features} heading={isApp ? "Key features" : "What's on the site"} id="features-heading" />
            <FeatureList items={project.modules} heading="Main modules" id="modules-heading" />
            <FeatureList items={project.workflows} heading="Key workflows" id="workflows-heading" />
          </div>
        </Section>
      )}

      {(project.media.desktopScreenshots.length > 0 ||
        project.media.tabletScreenshots.length > 0 ||
        project.media.mobileScreenshots.length > 0 ||
        project.media.gallery.length > 0) && (
        <Section tone="paper" aria-labelledby="screens-heading">
          <SectionHeading id="screens-heading" eyebrow="Screens" title="A closer look" size="md" />
          <ScreensGallery
            title={project.title}
            desktop={project.media.desktopScreenshots}
            tablet={project.media.tabletScreenshots}
            mobile={project.media.mobileScreenshots}
            gallery={project.media.gallery}
          />
        </Section>
      )}

      {project.video && (
        <Section tone="paper-alt" id="video" aria-labelledby="video-heading" className="scroll-mt-24">
          <SectionHeading id="video-heading" eyebrow="Walkthrough" title={project.video.title || "Watch the demo"} size="md" />
          <VideoPlayer video={project.video} />
          {project.video.transcript && (
            <details className="mt-6 rounded-2xl bg-paper-50 p-5 ring-1 ring-ink-900/10">
              <summary className="cursor-pointer font-medium">Read the transcript</summary>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-stone-600">{project.video.transcript}</p>
            </details>
          )}
        </Section>
      )}

      {Object.keys(project.caseStudy).some((key) => key !== "limitations") && (
        <Section tone="white" aria-labelledby="case-study-heading">
          <SectionHeading id="case-study-heading" eyebrow="Case study" title="Behind the build" size="md" />
          <CaseStudySections caseStudy={project.caseStudy} />
        </Section>
      )}

      {project.contentBlocks.length > 0 && (
        <Section tone="paper">
          <BlockRenderer blocks={project.contentBlocks} />
        </Section>
      )}

      {project.caseStudy.limitations && (
        <section className="bg-paper-100 pt-4">
          <Container>
            <aside className="flex gap-4 rounded-2xl bg-paper-200/80 p-6 text-[0.95rem] leading-relaxed text-stone-700 ring-1 ring-ink-900/[0.07]">
              <LuInfo aria-hidden className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium text-ink-900">About this project</p>
                <p className="mt-1">{project.caseStudy.limitations}</p>
              </div>
            </aside>
          </Container>
        </section>
      )}

      <CtaBand
        heading={project.cta?.heading || `Want something like ${project.brandName || project.title}?`}
        text={
          project.cta?.text ||
          "Tell me about your business and I'll design a website around it — with this level of care and detail."
        }
        buttonLabel={project.cta?.buttonLabel || "Request something similar"}
        contactHref={project.cta?.buttonHref || contactHref}
        settings={settings}
        whatsappContext={{ page: pageUrl, project: project.title, industry: primaryCategory?.name }}
      />

      {project.related.length > 0 && (
        <Section tone="paper" aria-labelledby="related-heading" className="pt-0">
          <SectionHeading
            id="related-heading"
            eyebrow="More work"
            title="Related projects"
            size="md"
            action={
              <ButtonLink href="/work" variant="outline" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
                All work
              </ButtonLink>
            }
          />
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {project.related.map((item) => (
              <li key={item.id} data-reveal>
                <ProjectCard project={item} size="sm" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <JsonLd
        data={
          isApp
            ? {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: project.title,
                description: project.summary || project.subtitle,
                applicationCategory: "BusinessApplication",
                ...(project.platforms.length ? { operatingSystem: project.platforms.join(", ") } : {}),
                ...(project.links.liveUrl ? { url: project.links.liveUrl } : {}),
                ...(project.coverImage ? { image: absoluteUrl(project.coverImage.url) } : {}),
                author: { "@type": "Organization", name: settings.brand.name, url: absoluteUrl("/") },
              }
            : {
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                name: project.title,
                headline: `${project.title} — ${kind}`,
                description: project.summary || project.subtitle,
                url: pageUrl,
                ...(project.coverImage ? { image: absoluteUrl(project.coverImage.url) } : {}),
                ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
                ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
                ...(project.tags.length ? { keywords: project.tags.join(", ") } : {}),
                ...(primaryCategory ? { about: primaryCategory.name } : {}),
                creator: { "@type": "Organization", name: settings.brand.name, url: absoluteUrl("/") },
              }
        }
      />
    </>
  );
}
