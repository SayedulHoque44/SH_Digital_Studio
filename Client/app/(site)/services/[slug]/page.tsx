import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { CSSProperties } from "react";
import { LuArrowRight, LuArrowUpRight, LuCheck } from "react-icons/lu";
import ProjectCard from "@/components/features/Projects/ProjectCard";
import CtaBand from "@/components/shared/CtaBand";
import FaqList from "@/components/shared/FaqList";
import Icon from "@/components/shared/Icon";
import JsonLd from "@/components/shared/JsonLd";
import Markdown from "@/components/shared/Markdown";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getService, getServices, getSettings, isRedirect } from "@/features/Public/apis/public.api";
import type { IServiceDetail } from "@/features/Public/interface/public.interface";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type TParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    return ((await getServices()) || []).map((service) => ({ slug: service.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: TParams }): Promise<Metadata> {
  const { slug } = await params;
  const [settings, data] = await Promise.all([getSettings(), getService(slug)]);
  if (!data) notFound();
  // A renamed slug: the page itself issues the 308 (redirecting here as well
  // sent the Location header twice)
  if (isRedirect(data)) return {};
  return buildMetadata({
    settings,
    title: data.seo?.title || data.title,
    description: data.seo?.description || data.shortDescription,
    path: `/services/${data.slug}`,
    image: `/og/services/${data.slug}`,
    seo: data.seo,
  });
}

export default async function ServicePage({ params }: { params: TParams }) {
  const { slug } = await params;
  const data = await getService(slug);
  if (!data) notFound();
  if (isRedirect(data)) permanentRedirect(`/services/${data.redirectSlug}`);
  const service = data as IServiceDetail;
  const settings = await getSettings();
  const contactHref = `/contact?service=${encodeURIComponent(service.slug)}`;
  const pageUrl = absoluteUrl(`/services/${service.slug}`);

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.title, href: `/services/${service.slug}` },
        ]}
        eyebrow="Service"
        title={service.title}
        intro={service.shortDescription}
        actions={
          <>
            <ButtonLink href={contactHref} variant="primary" size="lg" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
              {service.cta?.buttonLabel || "Start a project"}
            </ButtonLink>
            {service.relatedProjects.length > 0 && (
              <ButtonLink href="#work" variant="outline" size="lg">
                See related work
              </ButtonLink>
            )}
          </>
        }
      >
        {(service.startingPrice || service.timeline) && (
          <dl className="animate-fade-in mt-12 flex flex-wrap gap-x-12 gap-y-4 border-t border-ink-900/10 pt-6 [--delay:400]">
            {service.startingPrice && (
              <div>
                <dt className="text-eyebrow text-stone-600">Starting from</dt>
                <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">{service.startingPrice}</dd>
                {service.priceNote && <dd className="mt-1 text-sm text-stone-600">{service.priceNote}</dd>}
              </div>
            )}
            {service.timeline && (
              <div>
                <dt className="text-eyebrow text-stone-600">Typical timeline</dt>
                <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">{service.timeline}</dd>
              </div>
            )}
          </dl>
        )}
      </PageHero>

      {(service.description || service.benefits.length > 0) && (
        <Section tone="white">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-eyebrow mb-5 text-stone-600">Overview</h2>
              <Markdown className="text-[1.1rem]">{service.description}</Markdown>
            </div>
            {service.benefits.length > 0 && (
              <div className="lg:col-span-5">
                <div className="rounded-[1.4rem] bg-paper-100 p-7 ring-1 ring-ink-900/[0.07]">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Why it works</h2>
                  <ul className="mt-6 space-y-4">
                    {service.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 leading-relaxed">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
                          <LuCheck aria-hidden className="size-3.5" />
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {service.features.length > 0 && (
        <Section tone="paper" aria-labelledby="features-heading">
          <SectionHeading id="features-heading" eyebrow="What's included" title="Built in, not bolted on" size="md" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature, index) => (
              <li
                key={feature.title}
                data-reveal
                style={{ "--reveal-delay": (index % 3) * 80 } as CSSProperties}
                className="rounded-2xl bg-paper-50 p-6 ring-1 ring-ink-900/10"
              >
                <span className="font-mono text-xs text-stone-500">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">{feature.title}</h3>
                {feature.description && <p className="mt-2 leading-relaxed text-stone-600">{feature.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {service.deliverables.length > 0 && (
        <Section tone="dark" aria-labelledby="deliverables-heading">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading id="deliverables-heading" eyebrow="Deliverables" title="What you receive" size="md" />
            </div>
            <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:col-span-7">
              {service.deliverables.map((item) => (
                <li key={item} className="flex gap-3 bg-ink-950 p-5 leading-relaxed text-ink-200">
                  <LuCheck aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {service.relatedProjects.length > 0 && (
        <Section tone="paper" id="work" aria-labelledby="work-heading" className="scroll-mt-24">
          <SectionHeading
            id="work-heading"
            eyebrow="Related work"
            title="See it in practice"
            size="md"
            action={
              <ButtonLink href="/work" variant="outline" rightIcon={<LuArrowRight aria-hidden className="size-4" />}>
                All work
              </ButtonLink>
            }
          />
          <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {service.relatedProjects.map((project) => (
              <li key={project.id} data-reveal>
                <ProjectCard project={project} size="sm" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {service.industries.length > 0 && (
        <Section tone="white" aria-labelledby="industries-heading">
          <SectionHeading id="industries-heading" eyebrow="Industries" title="Where this fits" size="md" />
          <ul className="flex flex-wrap gap-3">
            {service.industries.map((industry) => (
              <li key={industry.id}>
                <Link
                  href={`/demos/${industry.slug}`}
                  className="group inline-flex h-12 items-center gap-3 rounded-full bg-paper-100 pl-2 pr-5 ring-1 ring-ink-900/10 transition-colors hover:bg-ink-950 hover:text-paper-50"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-paper-50 text-ink-900">
                    <Icon name={industry.icon} className="size-4" />
                  </span>
                  {industry.name}
                  <LuArrowUpRight aria-hidden className="size-4 opacity-60" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {service.faqs.length > 0 && (
        <Section tone="paper" containerSize="narrow" aria-labelledby="faq-heading">
          <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions, answered" size="md" />
          <FaqList faqs={service.faqs} />
        </Section>
      )}

      {service.otherServices.length > 0 && (
        <Section tone="paper" className="pt-0" aria-labelledby="other-services-heading">
          <h2 id="other-services-heading" className="text-eyebrow mb-6 text-stone-600">
            Other services
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.otherServices.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/services/${item.slug}`}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl bg-paper-50 p-5 font-medium ring-1 ring-ink-900/10 transition-shadow hover:[box-shadow:var(--shadow-card)]"
                >
                  {item.title}
                  <LuArrowUpRight aria-hidden className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand
        heading={service.cta?.heading || `Ready to talk about ${service.title.toLowerCase()}?`}
        text={service.cta?.text || "Share a few details about your business and goals. You'll get a clear, honest reply."}
        buttonLabel={service.cta?.buttonLabel || "Start a project"}
        contactHref={contactHref}
        settings={settings}
        whatsappContext={{ page: pageUrl }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          serviceType: service.title,
          description: service.shortDescription,
          url: pageUrl,
          provider: { "@type": "Organization", name: settings.brand.name, url: absoluteUrl("/") },
        }}
      />
    </>
  );
}
