import { Types } from "mongoose";
import { escapeRegex } from "../shared/shared.utils";
import { CategoryModel } from "../Category/category.model";
import { ProfileServices } from "../Profile/profile.service";
import { ProjectModel } from "../Project/project.model";
import { ServiceModel } from "../Service/service.model";
import { SiteSettingsServices } from "../SiteSettings/siteSettings.service";
import {
  toBlocks,
  toCategoryCard,
  toCta,
  toFaqs,
  toFeatureList,
  toMedia,
  toProjectCard,
  toProjectDetail,
  toSeo,
  toServiceCard,
} from "./public.mappers";

type Doc = Record<string, any>;

// Visitors only ever see published content. "Unlisted" projects are
// reachable by direct link but never appear in listings or the sitemap.
const PUBLISHED = { publishStatus: "published" };
const LISTED = { publishStatus: "published", visibility: "listed" };
const PUBLISHED_CATEGORY = { status: "published" };
const PUBLISHED_SERVICE = { status: "published" };

const CARD_FIELDS =
  "title slug subtitle summary projectType projectStatus isClientWork subcategory brandName tags featured featuredOrder sortOrder publishedAt media.coverImage media.logo media.mobileScreenshots media.desktopScreenshots techStack platforms categories links.liveUrl video.url";

const populateCategories = { path: "categories", select: "name slug status" };

// Keeps the order of `ids`, dropping anything missing/unpublished
const orderByIds = <T extends Doc>(docs: T[], ids: unknown[] = []) => {
  const map = new Map(docs.map(doc => [String(doc._id), doc]));
  return ids.map(id => map.get(String(id))).filter(Boolean) as T[];
};

// Published+listed project counts per category (direct assignment)
const getProjectCountsByCategory = async () => {
  const counts = await ProjectModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: LISTED },
    { $unwind: "$categories" },
    { $group: { _id: "$categories", count: { $sum: 1 } } },
  ]);
  return new Map(counts.map(item => [String(item._id), item.count]));
};

// Counts for a category include projects assigned to its sub-categories.
const getRollupCounts = async (categories: Doc[]) => {
  const direct = await getProjectCountsByCategory();
  const childrenByParent = new Map<string, string[]>();
  categories.forEach(category => {
    if (category.parent) {
      const parentId = String(category.parent._id || category.parent);
      childrenByParent.set(parentId, [...(childrenByParent.get(parentId) || []), String(category._id)]);
    }
  });

  // A project in both parent and child must only be counted once, so the
  // rollup is computed from distinct project ids.
  const rollup = new Map<string, number>();
  for (const category of categories) {
    const id = String(category._id);
    const children = childrenByParent.get(id) || [];
    if (!children.length) {
      rollup.set(id, direct.get(id) || 0);
      continue;
    }
    const ids = [id, ...children].map(item => new Types.ObjectId(item));
    rollup.set(id, await ProjectModel.countDocuments({ ...LISTED, categories: { $in: ids } }));
  }
  return rollup;
};

// ---------------------------------------------------------------------------
// Settings (used by every page: header, footer, metadata)
// ---------------------------------------------------------------------------

const getPublicSettings = async () => {
  const settings = (await SiteSettingsServices.getSettingsDoc()) as Doc;
  const [services, industries] = await Promise.all([
    ServiceModel.find(PUBLISHED_SERVICE).select("title slug").sort("sortOrder title").limit(12).lean(),
    CategoryModel.find({ ...PUBLISHED_CATEGORY, parent: null })
      .select("name slug")
      .sort("sortOrder name")
      .limit(12)
      .lean(),
  ]);

  return {
    brand: settings.brand,
    theme: settings.theme,
    announcement: settings.announcement?.enabled ? settings.announcement : { enabled: false },
    navigation: {
      header: (settings.navigation?.header || [])
        .filter((item: Doc) => item.visible)
        .map((item: Doc) => ({ label: item.label, href: item.href })),
    },
    footer: {
      blurb: settings.footer?.blurb,
      services: settings.footer?.showServices
        ? services.map(item => ({ title: item.title, slug: item.slug }))
        : [],
      industries: settings.footer?.showIndustries
        ? industries.map(item => ({ name: item.name, slug: item.slug }))
        : [],
    },
    contact: {
      email: settings.contact?.email || undefined,
      phone: settings.contact?.phone || undefined,
      whatsappNumber: settings.contact?.whatsappNumber || undefined,
      whatsappMessage: settings.contact?.whatsappMessage || undefined,
      location: settings.contact?.location || undefined,
      responseTime: settings.contact?.responseTime || undefined,
    },
    socialLinks: (settings.socialLinks || []).map((item: Doc) => ({
      platform: item.platform,
      url: item.url,
      label: item.label,
    })),
    seo: settings.seo,
    inquiry: {
      budgetRanges: settings.inquiry?.budgetRanges || [],
    },
    // Closing call-to-action shown above the footer on every page
    closingCta:
      settings.home?.sections?.finalCta === false
        ? null
        : {
            heading: settings.home?.finalCta?.heading,
            text: settings.home?.finalCta?.text,
            buttonLabel: settings.home?.finalCta?.buttonLabel,
            buttonHref: settings.home?.finalCta?.buttonHref,
          },
    legalUpdatedAt: settings.legal?.updatedAt,
    updatedAt: settings.updatedAt,
  };
};

const getLegalPage = async (doc: "privacy" | "terms") => {
  const settings = (await SiteSettingsServices.getSettingsDoc()) as Doc;
  return {
    content: doc === "privacy" ? settings.legal?.privacyPolicy || "" : settings.legal?.terms || "",
    updatedAt: settings.legal?.updatedAt || settings.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

const resolveCategoryIds = async (slug: string) => {
  const category = await CategoryModel.findOne({ slug, ...PUBLISHED_CATEGORY }).select("_id").lean();
  if (!category) return null;
  const children = await CategoryModel.find({ parent: category._id, ...PUBLISHED_CATEGORY })
    .select("_id")
    .lean();
  return [category._id, ...children.map(child => child._id)];
};

const SORTS: Record<string, string> = {
  featured: "-featured featuredOrder sortOrder",
  newest: "-publishedAt -createdAt",
  oldest: "publishedAt createdAt",
  title: "title",
  order: "sortOrder -publishedAt",
};

const listProjects = async (query: Record<string, any>) => {
  const filter: Record<string, unknown> = { ...LISTED };
  if (query.type) filter.projectType = query.type;
  if (query.featured === "true") filter.featured = true;
  if (query.category) {
    const ids = await resolveCategoryIds(query.category);
    if (!ids) return { meta: { page: 1, limit: 0, total: 0, totalPage: 1 }, result: [] };
    filter.categories = { $in: ids };
  }
  if (query.searchTerm) {
    const pattern = new RegExp(escapeRegex(String(query.searchTerm).slice(0, 100)), "i");
    filter.$or = [
      { title: pattern },
      { summary: pattern },
      { brandName: pattern },
      { subcategory: pattern },
      { tags: pattern },
      { techStack: pattern },
    ];
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 24));
  const sort = SORTS[query.sort] || SORTS.order;

  const [docs, total] = await Promise.all([
    ProjectModel.find(filter)
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProjectModel.countDocuments(filter),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.max(1, Math.ceil(total / limit)) },
    result: docs.map(toProjectCard),
  };
};

// Related work: explicit picks first, otherwise projects sharing a category.
const getRelatedProjects = async (project: Doc) => {
  const explicit = (project.relatedProjects || []).map((id: unknown) => String(id));
  if (explicit.length) {
    const docs = await ProjectModel.find({ _id: { $in: explicit }, ...LISTED })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .lean();
    return orderByIds(docs, explicit).map(toProjectCard);
  }
  const categoryIds = (project.categories || []).map((item: Doc) => item?._id || item);
  const docs = await ProjectModel.find({
    ...LISTED,
    _id: { $ne: project._id },
    ...(categoryIds.length ? { categories: { $in: categoryIds } } : { projectType: project.projectType }),
  })
    .select(CARD_FIELDS)
    .populate(populateCategories)
    .sort("-featured sortOrder")
    .limit(3)
    .lean();
  return docs.map(toProjectCard);
};

const buildProjectDetail = async (project: Doc) => {
  const populated = project.categories?.[0]?.slug
    ? project
    : await ProjectModel.populate(project, populateCategories);
  return {
    ...toProjectDetail(populated),
    related: await getRelatedProjects(populated),
  };
};

const getProjectBySlug = async (slug: string) => {
  const project = await ProjectModel.findOne({ slug, ...PUBLISHED })
    .populate(populateCategories)
    .lean();
  if (project) return { project: await buildProjectDetail(project) };

  // Old slugs keep working: tell the page where the project lives now.
  const moved = await ProjectModel.findOne({ previousSlugs: slug, ...PUBLISHED }).select("slug").lean();
  if (moved) return { redirectSlug: moved.slug };
  return null;
};

// ---------------------------------------------------------------------------
// Categories / industries
// ---------------------------------------------------------------------------

const listCategories = async () => {
  const categories = await CategoryModel.find(PUBLISHED_CATEGORY)
    .select("name slug shortDescription icon coverImage parent sortOrder")
    .sort("sortOrder name")
    .lean();
  const counts = await getRollupCounts(categories);
  return categories.map(category => toCategoryCard(category, counts.get(String(category._id)) || 0));
};

const getCategoryBySlug = async (slug: string) => {
  const category = await CategoryModel.findOne({ slug, ...PUBLISHED_CATEGORY })
    .populate({ path: "parent", select: "name slug status" })
    .lean();

  if (!category) {
    const moved = await CategoryModel.findOne({ previousSlugs: slug, ...PUBLISHED_CATEGORY })
      .select("slug")
      .lean();
    return moved ? { redirectSlug: moved.slug } : null;
  }

  const children = await CategoryModel.find({ parent: category._id, ...PUBLISHED_CATEGORY })
    .select("name slug shortDescription icon coverImage parent sortOrder")
    .sort("sortOrder name")
    .lean();
  const categoryIds = [category._id, ...children.map(child => child._id)];

  const [projects, services, childCounts] = await Promise.all([
    ProjectModel.find({ ...LISTED, categories: { $in: categoryIds } })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .sort("sortOrder -publishedAt")
      .lean(),
    ServiceModel.find({ _id: { $in: category.relatedServices || [] }, ...PUBLISHED_SERVICE }).lean(),
    getProjectCountsByCategory(),
  ]);

  // Featured projects (in the chosen order) come first, then the rest.
  const featuredIds = (category.featuredProjects || []).map(id => String(id));
  const featured = orderByIds(projects, featuredIds);
  const rest = projects.filter(project => !featuredIds.includes(String(project._id)));

  const parent = category.parent as Doc | null;
  return {
    category: {
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      shortDescription: category.shortDescription,
      introduction: category.introduction,
      emailIntro: category.emailIntro,
      highlights: category.highlights || [],
      icon: category.icon,
      coverImage: toMedia(category.coverImage),
      featuredImage: toMedia(category.featuredImage),
      contentBlocks: toBlocks(category.contentBlocks),
      faqs: toFaqs(category.faqs),
      cta: toCta(category.cta),
      seo: toSeo(category.seo),
      parent: parent?.status === "published" ? { name: parent.name, slug: parent.slug } : null,
      children: children.map(child =>
        toCategoryCard(child, childCounts.get(String(child._id)) || 0),
      ),
      projects: [...featured, ...rest].map(toProjectCard),
      relatedServices: orderByIds(services, category.relatedServices || []).map(toServiceCard),
      updatedAt: category.updatedAt,
    },
  };
};

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

const listServices = async () => {
  const services = await ServiceModel.find(PUBLISHED_SERVICE).sort("sortOrder title").lean();
  return services.map(toServiceCard);
};

const getServiceBySlug = async (slug: string) => {
  const service = await ServiceModel.findOne({ slug, ...PUBLISHED_SERVICE }).lean();
  if (!service) {
    const moved = await ServiceModel.findOne({ previousSlugs: slug, ...PUBLISHED_SERVICE })
      .select("slug")
      .lean();
    return moved ? { redirectSlug: moved.slug } : null;
  }

  const relatedIds = (service.relatedProjects || []).map(id => String(id));
  let projects: Doc[] = [];
  if (relatedIds.length) {
    const docs = await ProjectModel.find({ _id: { $in: relatedIds }, ...LISTED })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .lean();
    projects = orderByIds(docs, relatedIds);
  } else if (service.projectTypes?.length || service.industries?.length) {
    projects = await ProjectModel.find({
      ...LISTED,
      $or: [
        ...(service.projectTypes?.length ? [{ projectType: { $in: service.projectTypes } }] : []),
        ...(service.industries?.length ? [{ categories: { $in: service.industries } }] : []),
      ],
    })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .sort("-featured sortOrder")
      .limit(6)
      .lean();
  }

  const [industries, otherServices, counts] = await Promise.all([
    CategoryModel.find({ _id: { $in: service.industries || [] }, ...PUBLISHED_CATEGORY })
      .select("name slug shortDescription icon coverImage parent sortOrder")
      .sort("sortOrder name")
      .lean(),
    ServiceModel.find({ ...PUBLISHED_SERVICE, _id: { $ne: service._id } })
      .sort("sortOrder title")
      .limit(4)
      .lean(),
    getProjectCountsByCategory(),
  ]);

  return {
    service: {
      ...toServiceCard(service),
      description: service.description,
      benefits: service.benefits || [],
      features: toFeatureList(service.features),
      deliverables: service.deliverables || [],
      priceNote: service.priceNote || undefined,
      faqs: toFaqs(service.faqs),
      cta: toCta(service.cta),
      seo: toSeo(service.seo),
      industries: industries.map(item => toCategoryCard(item, counts.get(String(item._id)) || 0)),
      relatedProjects: projects.map(toProjectCard),
      otherServices: otherServices.map(toServiceCard),
      updatedAt: service.updatedAt,
    },
  };
};

// ---------------------------------------------------------------------------
// Profile / about
// ---------------------------------------------------------------------------

const getPublicProfile = async () => {
  const profile = (await ProfileServices.getProfileDoc()) as Doc;
  const settings = (await SiteSettingsServices.getSettingsDoc()) as Doc;

  const featuredIds = (profile.featuredProjects || []).map((id: unknown) => String(id));
  const projectIds = new Set<string>(featuredIds);
  (profile.testimonials || []).forEach((item: Doc) => item.project && projectIds.add(String(item.project)));

  const projects = projectIds.size
    ? await ProjectModel.find({ _id: { $in: [...projectIds] }, ...LISTED })
        .select(CARD_FIELDS)
        .populate(populateCategories)
        .lean()
    : [];
  const projectMap = new Map(projects.map(project => [String(project._id), project]));

  // Skills grouped in the configured category order
  const order: string[] = profile.skillCategories || [];
  const groups = new Map<string, Doc[]>();
  (profile.skills || []).forEach((skill: Doc) => {
    groups.set(skill.category, [...(groups.get(skill.category) || []), skill]);
  });
  const sortedCategories = [...groups.keys()].sort(
    (a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999),
  );

  const experience = [...(profile.experience || [])].sort((a: Doc, b: Doc) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return String(b.startDate || "").localeCompare(String(a.startDate || ""));
  });

  return {
    name: profile.name,
    title: profile.title,
    shortIntro: profile.shortIntro,
    bio: profile.bio,
    photo: toMedia(profile.photo),
    location: profile.location || undefined,
    availability:
      profile.availabilityStatus && profile.availabilityStatus !== "hidden"
        ? { status: profile.availabilityStatus, note: profile.availabilityNote }
        : undefined,
    specializations: profile.specializations || [],
    workingArrangements: profile.workingArrangements || [],
    skillGroups: sortedCategories.map(category => ({
      category,
      skills: (groups.get(category) || []).map(skill => ({
        name: skill.name,
        description: skill.description || undefined,
        icon: skill.icon || undefined,
        proficiencyLabel: skill.proficiencyLabel || undefined,
      })),
    })),
    experience: experience.map((item: Doc) => ({
      organization: item.organization,
      position: item.position,
      employmentType: item.employmentType,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      isCurrent: item.isCurrent,
      description: item.description,
      responsibilities: item.responsibilities || [],
      achievements: item.achievements || [],
      technologies: item.technologies || [],
      logo: toMedia(item.logo),
    })),
    education: (profile.education || []).map((item: Doc) => ({
      institution: item.institution,
      qualification: item.qualification,
      field: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description,
    })),
    capabilities: toFeatureList(profile.capabilities),
    workingProcess: toFeatureList(profile.workingProcess),
    certifications: (profile.certifications || []).map((item: Doc) => ({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
      url: item.url,
    })),
    // Only approved, genuine testimonials are ever shown
    testimonials: (profile.testimonials || [])
      .filter((item: Doc) => item.approved)
      .map((item: Doc) => {
        const project = item.project ? projectMap.get(String(item.project)) : undefined;
        return {
          quote: item.quote,
          author: item.author,
          role: item.role,
          company: item.company,
          project: project ? { title: project.title, slug: project.slug } : undefined,
        };
      }),
    featuredProjects: orderByIds(projects, featuredIds).map(toProjectCard),
    resumeUrl: profile.resumeUrl || undefined,
    seo: toSeo(profile.seo),
    contact: {
      email: settings.contact?.email || undefined,
      whatsappNumber: settings.contact?.whatsappNumber || undefined,
      location: settings.contact?.location || undefined,
    },
    socialLinks: (settings.socialLinks || []).map((item: Doc) => ({
      platform: item.platform,
      url: item.url,
      label: item.label,
    })),
    updatedAt: profile.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// Homepage (single request for the whole page)
// ---------------------------------------------------------------------------

const getHome = async () => {
  const settings = (await SiteSettingsServices.getSettingsDoc()) as Doc;
  const home = settings.home || {};

  // Selected work: chosen projects in order, otherwise featured projects
  const selectedIds = (home.selectedWork?.projects || []).map((id: unknown) => String(id));
  let selected: Doc[];
  if (selectedIds.length) {
    const docs = await ProjectModel.find({ _id: { $in: selectedIds }, ...LISTED })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .lean();
    selected = orderByIds(docs, selectedIds);
  } else {
    selected = await ProjectModel.find({ ...LISTED, featured: true })
      .select(CARD_FIELDS)
      .populate(populateCategories)
      .sort("featuredOrder sortOrder")
      .limit(6)
      .lean();
  }

  const serviceIds = (home.services?.items || []).map((id: unknown) => String(id));
  const services = serviceIds.length
    ? orderByIds(
        await ServiceModel.find({ _id: { $in: serviceIds }, ...PUBLISHED_SERVICE }).lean(),
        serviceIds,
      )
    : await ServiceModel.find(PUBLISHED_SERVICE).sort("sortOrder").limit(8).lean();

  const industryIds = (home.industries?.items || []).map((id: unknown) => String(id));
  const allCategories = await CategoryModel.find(PUBLISHED_CATEGORY)
    .select("name slug shortDescription icon coverImage parent sortOrder showOnHome")
    .sort("sortOrder name")
    .lean();
  const industries = industryIds.length
    ? orderByIds(allCategories, industryIds)
    : allCategories.filter(category => category.showOnHome);
  const counts = await getRollupCounts(allCategories);

  const profile = (await ProfileServices.getProfileDoc()) as Doc;
  const totalProjects = await ProjectModel.countDocuments(LISTED);

  return {
    hero: {
      eyebrow: home.heroEyebrow,
      headline: home.heroHeadline,
      highlight: home.heroHighlight,
      subtext: home.heroSubtext,
      primaryCta: home.primaryCta,
      secondaryCta: home.secondaryCta,
    },
    sections: home.sections || {},
    selectedWork: {
      heading: home.selectedWork?.heading,
      intro: home.selectedWork?.intro,
      projects: selected.map(toProjectCard),
    },
    services: {
      heading: home.services?.heading,
      intro: home.services?.intro,
      items: services.map(toServiceCard),
    },
    industries: {
      heading: home.industries?.heading,
      intro: home.industries?.intro,
      items: industries.map(category =>
        toCategoryCard(category, counts.get(String(category._id)) || 0),
      ),
    },
    process: {
      heading: home.process?.heading,
      intro: home.process?.intro,
      steps: toFeatureList(home.process?.steps),
    },
    capabilities: {
      heading: home.capabilities?.heading,
      intro: home.capabilities?.intro,
      items: toFeatureList(home.capabilities?.items),
      technologies: home.capabilities?.technologies || [],
    },
    about: {
      heading: home.about?.heading,
      text: home.about?.text,
      ctaLabel: home.about?.ctaLabel,
      profile: {
        name: profile.name,
        title: profile.title,
        shortIntro: profile.shortIntro,
        photo: toMedia(profile.photo),
        availability:
          profile.availabilityStatus && profile.availabilityStatus !== "hidden"
            ? { status: profile.availabilityStatus, note: profile.availabilityNote }
            : undefined,
      },
    },
    finalCta: home.finalCta,
    counts: { projects: totalProjects },
  };
};

// ---------------------------------------------------------------------------
// Sitemap (published + listed content only)
// ---------------------------------------------------------------------------

const getSitemap = async () => {
  const [projects, categories, services, profile, settings] = await Promise.all([
    ProjectModel.find({ ...LISTED, "seo.noIndex": { $ne: true } }).select("slug updatedAt").lean(),
    CategoryModel.find({ ...PUBLISHED_CATEGORY, "seo.noIndex": { $ne: true } })
      .select("slug updatedAt")
      .lean(),
    ServiceModel.find({ ...PUBLISHED_SERVICE, "seo.noIndex": { $ne: true } })
      .select("slug updatedAt")
      .lean(),
    ProfileServices.getProfileDoc(),
    SiteSettingsServices.getSettingsDoc(),
  ]);
  const map = (items: Doc[]) => items.map(item => ({ slug: item.slug, updatedAt: item.updatedAt }));
  return {
    projects: map(projects),
    categories: map(categories),
    services: map(services),
    profileUpdatedAt: (profile as Doc)?.updatedAt,
    settingsUpdatedAt: (settings as Doc)?.updatedAt,
  };
};

export const PublicServices = {
  getPublicSettings,
  getLegalPage,
  listProjects,
  getProjectBySlug,
  buildProjectDetail,
  listCategories,
  getCategoryBySlug,
  listServices,
  getServiceBySlug,
  getPublicProfile,
  getHome,
  getSitemap,
};
