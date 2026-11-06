import {
  getCategory,
  getProject,
  getService,
  getSettings,
  isRedirect,
} from "@/features/Public/apis/public.api";
import { PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS } from "@/lib/format";
import { normalizeAccent } from "@/lib/color";
import { renderOgImage } from "@/lib/server/og";

// Fixed copy for static pages (no arbitrary text can be injected via URL)
const PAGES: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  about: { eyebrow: "About", title: "The developer behind the studio", subtitle: "Skills, process and selected work." },
  work: { eyebrow: "Work", title: "Websites & applications, built to perform", subtitle: "Live websites, concept demos and applications." },
  demos: { eyebrow: "Demo library", title: "Website demos, by industry", subtitle: "Open any demo on your phone." },
  industries: { eyebrow: "Industries", title: "Built around the way your industry works", subtitle: "Demos and capabilities by industry." },
  services: { eyebrow: "Services", title: "Services shaped around your business", subtitle: "From landing pages to web applications." },
  contact: { eyebrow: "Start a project", title: "Let's talk about your project", subtitle: "Every inquiry is read personally." },
};

/**
 * /og/projects/<slug>, /og/demos/<slug>, /og/services/<slug>, /og/pages/<key>
 * Only published content can be rendered (drafts return 404).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await params;
  const settings = await getSettings();
  const base = { brand: settings.brand.name, accent: normalizeAccent(settings.theme.accent) };
  const notFound = () => new Response("Not found", { status: 404 });

  if (kind === "pages") {
    const page = PAGES[slug];
    return page ? renderOgImage({ ...base, ...page }) : notFound();
  }

  if (kind === "projects") {
    const project = await getProject(slug);
    if (!project || isRedirect(project) || "isPreview" in project) return notFound();
    return renderOgImage({
      ...base,
      eyebrow: `${project.isClientWork ? "Client project" : PROJECT_STATUS_LABELS[project.projectStatus]} · ${
        project.subcategory || PROJECT_TYPE_LABELS[project.projectType]
      }`,
      title: project.title,
      subtitle: project.summary || project.subtitle,
      image: project.coverImage?.url,
    });
  }

  if (kind === "demos") {
    const category = await getCategory(slug);
    if (!category || isRedirect(category)) return notFound();
    const count = category.projects.length;
    return renderOgImage({
      ...base,
      eyebrow: count ? `${count} live website ${count === 1 ? "demo" : "demos"}` : "Website demos",
      title: category.name,
      subtitle: category.shortDescription,
      image: category.coverImage?.url || category.projects[0]?.coverImage?.url,
    });
  }

  if (kind === "services") {
    const service = await getService(slug);
    if (!service || isRedirect(service)) return notFound();
    return renderOgImage({
      ...base,
      eyebrow: "Service",
      title: service.title,
      subtitle: service.shortDescription,
      image: service.image?.url || service.relatedProjects[0]?.coverImage?.url,
    });
  }

  return notFound();
}
