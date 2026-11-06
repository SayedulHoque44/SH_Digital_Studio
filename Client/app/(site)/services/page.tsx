import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import ProcessSteps from "@/components/features/Homepage/ProcessSteps";
import CtaBand from "@/components/shared/CtaBand";
import Icon from "@/components/shared/Icon";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { getHome, getServices, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: "Services",
    description:
      "Custom websites, restaurant websites, landing pages, web applications, dashboards, e-commerce and booking systems — scoped around your business.",
    path: "/services",
    image: "/og/pages/services",
  });
}

export default async function ServicesPage() {
  const [services, settings, home] = await Promise.all([getServices(), getSettings(), getHome().catch(() => null)]);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Services shaped around <span className="font-serif font-normal italic tracking-[-0.02em]">your business</span>.
          </>
        }
        intro="From a focused landing page to a full web application. Every engagement starts with understanding what your business needs — then building exactly that."
      />

      <section aria-label="Service list" className="bg-paper-100 pb-[clamp(4rem,8vw,7rem)]">
        <Container>
          <ol className="border-t border-ink-900/15">
            {(services || []).map((service, index) => (
              <li key={service.id} data-reveal style={{ "--reveal-delay": 40 } as CSSProperties} className="border-b border-ink-900/15">
                <Link
                  href={`/services/${service.slug}`}
                  className="group grid items-center gap-x-8 gap-y-3 py-8 transition-colors md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:py-10"
                >
                  <span className="font-mono text-sm text-stone-500">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="flex items-center gap-4 font-display text-[clamp(1.5rem,1.1rem+1.3vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                    <Icon name={service.icon} className="hidden size-7 shrink-0 text-stone-500 transition-colors group-hover:text-ink-900 md:block" />
                    {service.title}
                  </h2>
                  {service.shortDescription && <p className="leading-relaxed text-stone-600">{service.shortDescription}</p>}
                  <span className="hidden size-12 items-center justify-center rounded-full ring-1 ring-ink-900/15 transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:ring-transparent md:flex">
                    <LuArrowUpRight aria-hidden className="size-5" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {home?.process.steps.length ? (
        <ProcessSteps heading={home.process.heading} intro={home.process.intro} steps={home.process.steps} tone="dark" id="services-process" />
      ) : null}

      <CtaBand
        heading="Not sure which service fits?"
        text="Describe what you need in a few sentences. You'll get an honest recommendation — even if it's a smaller project than you expected."
        settings={settings}
        whatsappContext={{ page: "Services page" }}
      />
    </>
  );
}
