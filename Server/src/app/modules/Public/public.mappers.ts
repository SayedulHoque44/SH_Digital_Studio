/*
 * Public DTO mappers.
 *
 * Public endpoints never return raw documents. Each mapper copies an explicit
 * whitelist of fields, so private data (internal notes, slug history, admin
 * settings, unapproved testimonials, disabled demo credentials, ...) cannot
 * leak - even when new fields are added to a model later.
 */
import { TContentBlock, TMediaRef } from "../shared/shared.interface";

type Doc = Record<string, any>;

const clean = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== null && item !== "",
    ),
  ) as Partial<T>;

export const toMedia = (media?: TMediaRef | null) =>
  media?.url
    ? clean({
        url: media.url,
        alt: media.alt || "",
        caption: media.caption,
        width: media.width,
        height: media.height,
      })
    : undefined;

export const toMediaList = (list?: TMediaRef[] | null) =>
  (list || []).filter(item => item?.url).map(item => toMedia(item)!);

const nonEmptyText = (value?: string | null) =>
  typeof value === "string" && value.trim() ? value : undefined;

export const toFeatureList = (items?: Doc[]) =>
  (items || [])
    .filter(item => item?.title)
    .map(item => clean({ title: item.title, description: item.description, icon: item.icon }));

export const toFaqs = (items?: Doc[]) =>
  (items || [])
    .filter(item => item?.question && item?.answer)
    .map(item => ({ question: item.question, answer: item.answer }));

export const toCta = (cta?: Doc | null) => (cta ? clean({
  heading: cta.heading,
  text: cta.text,
  buttonLabel: cta.buttonLabel,
  buttonHref: cta.buttonHref,
}) : undefined);

export const toSeo = (seo?: Doc | null) => (seo ? clean({
  title: seo.title,
  description: seo.description,
  ogImage: seo.ogImage,
  canonicalUrl: seo.canonicalUrl,
  noIndex: seo.noIndex || undefined,
}) : undefined);

// Unapproved quotes are dropped; everything else was validated on save.
export const toBlocks = (blocks?: TContentBlock[]) =>
  (blocks || [])
    .filter(block => block?.type && block.data)
    .filter(block => block.type !== "quote" || block.data.approved === true)
    .map(block => ({ id: String(block._id || ""), type: block.type, data: block.data }));

// Only published categories are ever named publicly.
export const toCategoryRefs = (categories?: Doc[]) =>
  (categories || [])
    .filter(category => category?.slug && category.status === "published")
    .map(category => ({ name: category.name, slug: category.slug }));

export const toProjectCard = (project: Doc) =>
  clean({
    id: String(project._id),
    title: project.title,
    slug: project.slug,
    subtitle: nonEmptyText(project.subtitle),
    summary: nonEmptyText(project.summary),
    projectType: project.projectType,
    projectStatus: project.projectStatus,
    isClientWork: Boolean(project.isClientWork),
    subcategory: nonEmptyText(project.subcategory),
    brandName: nonEmptyText(project.brandName),
    tags: project.tags || [],
    featured: Boolean(project.featured),
    publishedAt: project.publishedAt,
    coverImage:
      toMedia(project.media?.coverImage) || toMedia(project.media?.desktopScreenshots?.[0]),
    logo: toMedia(project.media?.logo),
    mobilePreview: toMedia(project.media?.mobileScreenshots?.[0]),
    techStack: (project.techStack || []).slice(0, 6),
    platforms: project.platforms || [],
    categories: toCategoryRefs(project.categories),
    liveUrl: nonEmptyText(project.links?.liveUrl),
    hasVideo: Boolean(project.video?.url),
  });

const CASE_STUDY_FIELDS = [
  "goals",
  "problem",
  "solution",
  "targetAudience",
  "process",
  "designDecisions",
  "challenges",
  "implementation",
  "role",
  "collaboration",
  "timeline",
  "outcomes",
  "lessons",
  "limitations",
] as const;

export const toProjectDetail = (project: Doc) => {
  const links = project.links || {};
  const demo = project.demoAccess || {};
  return {
    ...toProjectCard(project),
    overview: nonEmptyText(project.overview),
    clientName: project.isClientWork ? nonEmptyText(project.clientName) : undefined,
    visibility: project.visibility,
    media: {
      coverImage: toMedia(project.media?.coverImage),
      logo: toMedia(project.media?.logo),
      browserMockup: toMedia(project.media?.browserMockup),
      fullPageScreenshot: toMedia(project.media?.fullPageScreenshot),
      desktopScreenshots: toMediaList(project.media?.desktopScreenshots),
      tabletScreenshots: toMediaList(project.media?.tabletScreenshots),
      mobileScreenshots: toMediaList(project.media?.mobileScreenshots),
      gallery: toMediaList(project.media?.gallery),
    },
    video: project.video?.url
      ? clean({
          url: project.video.url,
          title: project.video.title,
          posterUrl: project.video.posterUrl,
          captionsUrl: project.video.captionsUrl,
          transcript: project.video.transcript,
        })
      : undefined,
    links: clean({
      liveUrl: links.liveUrl,
      liveUrlLabel: links.liveUrlLabel,
      secondaryUrl: links.secondaryUrl,
      secondaryUrlLabel: links.secondaryUrlLabel,
      // Source code is only exposed when explicitly marked public
      sourceUrl: links.showSourceUrl ? links.sourceUrl : undefined,
      appStoreUrl: links.appStoreUrl,
      playStoreUrl: links.playStoreUrl,
    }),
    techStack: project.techStack || [],
    corePages: project.corePages || [],
    designHighlights: project.designHighlights || [],
    features: toFeatureList(project.features),
    modules: toFeatureList(project.modules),
    workflows: toFeatureList(project.workflows),
    caseStudy: clean(
      Object.fromEntries(
        CASE_STUDY_FIELDS.map(field => [field, nonEmptyText(project.caseStudy?.[field])]),
      ),
    ),
    contentBlocks: toBlocks(project.contentBlocks),
    // Public demo credentials are only included while the panel is enabled.
    demoAccess: demo.enabled
      ? clean({
          username: demo.username,
          password: demo.password,
          loginUrl: demo.loginUrl,
          instructions: demo.instructions,
          limitations: demo.limitations,
        })
      : undefined,
    cta: toCta(project.cta),
    seo: toSeo(project.seo),
    updatedAt: project.updatedAt,
  };
};

export const toCategoryCard = (category: Doc, projectCount = 0) =>
  clean({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    shortDescription: nonEmptyText(category.shortDescription),
    icon: nonEmptyText(category.icon),
    coverImage: toMedia(category.coverImage),
    parentId: category.parent ? String(category.parent._id || category.parent) : undefined,
    projectCount,
  });

export const toServiceCard = (service: Doc) =>
  clean({
    id: String(service._id),
    title: service.title,
    slug: service.slug,
    shortDescription: nonEmptyText(service.shortDescription),
    icon: nonEmptyText(service.icon),
    image: toMedia(service.image),
    projectTypes: service.projectTypes || [],
    startingPrice: nonEmptyText(service.startingPrice),
    timeline: nonEmptyText(service.timeline),
  });
