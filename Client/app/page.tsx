import type { Metadata } from "next";
import AboutPreview from "@/components/features/Homepage/AboutPreview";
import Capabilities from "@/components/features/Homepage/Capabilities";
import Hero from "@/components/features/Homepage/Hero";
import IndustriesShowcase from "@/components/features/Homepage/IndustriesShowcase";
import ProcessSteps from "@/components/features/Homepage/ProcessSteps";
import SelectedWork from "@/components/features/Homepage/SelectedWork";
import ServicesGrid from "@/components/features/Homepage/ServicesGrid";
import SiteShell from "@/components/layouts/Site/SiteShell";
import JsonLd from "@/components/shared/JsonLd";
import { getHome, getProjects, getSettings } from "@/features/Public/apis/public.api";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    settings,
    title: settings.seo.defaultTitle || settings.brand.name,
    absoluteTitle: true,
    description: settings.seo.defaultDescription || settings.brand.description,
    path: "/",
  });
}

export default async function HomePage() {
  const [home, settings] = await Promise.all([getHome(), getSettings()]);
  if (!home) throw new Error("Homepage content is unavailable");

  // Hero composition and the restaurant preview strip use real screenshots
  const showcase = home.selectedWork.projects.length
    ? home.selectedWork.projects
    : (await getProjects("limit=3&sort=featured"))?.result || [];
  const firstIndustry = home.industries.items[0];
  const industryPreviews = firstIndustry
    ? (await getProjects(`category=${encodeURIComponent(firstIndustry.slug)}&limit=3&sort=featured`))?.result || []
    : [];
  const sections = home.sections;

  return (
    <SiteShell>
      <Hero hero={home.hero} projects={showcase} liveCount={home.counts.projects} />
      {sections.selectedWork !== false && <SelectedWork data={home.selectedWork} />}
      {sections.services !== false && <ServicesGrid data={home.services} />}
      {sections.industries !== false && <IndustriesShowcase data={home.industries} previews={industryPreviews} />}
      {sections.process !== false && (
        <ProcessSteps heading={home.process.heading} intro={home.process.intro} steps={home.process.steps} />
      )}
      {sections.capabilities !== false && <Capabilities data={home.capabilities} />}
      {sections.about !== false && <AboutPreview data={home.about} />}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: settings.brand.name,
            url: SITE_URL,
            logo: absoluteUrl("/brand/sh-symbol-512.png"),
            ...(settings.brand.description ? { description: settings.brand.description } : {}),
            ...(settings.contact.email ? { email: settings.contact.email } : {}),
            ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
            ...(settings.socialLinks.length ? { sameAs: settings.socialLinks.map((item) => item.url) } : {}),
            founder: { "@type": "Person", name: home.about.profile.name, url: absoluteUrl("/about") },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: settings.brand.name,
            url: SITE_URL,
          },
        ]}
      />
    </SiteShell>
  );
}
