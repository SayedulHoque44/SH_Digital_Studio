/* eslint-disable no-console */
/**
 * Idempotent content seed:  npm run seed
 *
 * - Inserts only what is missing (matched by slug/key) using $setOnInsert,
 *   so running it again never creates duplicates and never overwrites
 *   anything you edited in the admin panel.
 * - Relationships (featured projects, related services, homepage picks) are
 *   only wired up for documents created during the same run.
 * - Never deletes or drops anything.
 */
import mongoose, { Model, Types } from "mongoose";
import { connectDatabase, disconnectDatabase } from "../app/config/db";
import { CategoryModel } from "../app/modules/Category/category.model";
import { MediaAssetModel } from "../app/modules/Media/media.model";
import { DEFAULT_PROFILE } from "../app/modules/Profile/profile.defaults";
import { ProfileModel } from "../app/modules/Profile/profile.model";
import { ProjectModel } from "../app/modules/Project/project.model";
import { ServiceModel } from "../app/modules/Service/service.model";
import { DEFAULT_SITE_SETTINGS } from "../app/modules/SiteSettings/siteSettings.defaults";
import { SiteSettingsModel } from "../app/modules/SiteSettings/siteSettings.model";
import { SEED_CATEGORIES } from "./seedData/categories";
import { DEMO_TECH_STACK, SEED_PROJECTS, demoMedia } from "./seedData/projects";
import { SEED_SERVICES } from "./seedData/services";

type TUpsertResult = { id: Types.ObjectId; created: boolean };

// Insert-if-missing helper. Returns the document id and whether it was created.
async function insertIfMissing<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  doc: Record<string, unknown>,
): Promise<TUpsertResult> {
  const result = await model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  if (result.upsertedId) {
    return { id: result.upsertedId as Types.ObjectId, created: true };
  }
  const existing = await model.findOne(filter).select("_id").lean();
  return { id: (existing as { _id: Types.ObjectId })._id, created: false };
}

const SELECTED_WORK = [
  "aurum-menu",
  "fizzaria-and-italian",
  "smoke-and-bao",
  "orbit-bowl-bar",
  "crumb-and-kettle",
  "vesper-flame",
];
const HOME_SERVICES = [
  "custom-website-development",
  "restaurant-website-development",
  "landing-page-development",
  "web-application-development",
  "saas-and-dashboard-development",
  "ecommerce-development",
  "booking-and-inquiry-systems",
  "website-redesign",
  "website-maintenance-and-optimization",
];
const HOME_INDUSTRIES = ["restaurants", "gyms", "travel", "photography", "saas"];
const PROFILE_FEATURED = ["aurum-menu", "fizzaria-and-italian", "orbit-bowl-bar"];

async function seed() {
  await connectDatabase();
  console.log(`Seeding database "${mongoose.connection.db?.databaseName}"\n`);
  const summary: Record<string, { created: number; existing: number }> = {};
  const track = (key: string, created: boolean) => {
    summary[key] = summary[key] || { created: 0, existing: 0 };
    summary[key][created ? "created" : "existing"] += 1;
  };

  // 1. Categories (parents before sub-categories)
  const categoryIds = new Map<string, Types.ObjectId>();
  const createdCategories = new Set<string>();
  const ordered = [
    ...SEED_CATEGORIES.filter(item => !item.parentSlug),
    ...SEED_CATEGORIES.filter(item => item.parentSlug),
  ];
  for (const category of ordered) {
    const { relatedServiceSlugs, parentSlug, ...data } = category;
    void relatedServiceSlugs; // wired up in step 4
    const result = await insertIfMissing(CategoryModel, { slug: category.slug }, {
      ...data,
      parent: parentSlug ? categoryIds.get(parentSlug) || null : null,
      status: category.status || "published",
      showOnHome: Boolean(category.showOnHome),
      // keep the order of the seed file (industries first, then sub-categories)
      sortOrder: SEED_CATEGORIES.indexOf(category),
      contentBlocks: [],
      featuredProjects: [],
      relatedServices: [],
      previousSlugs: [],
    });
    categoryIds.set(category.slug, result.id);
    if (result.created) createdCategories.add(category.slug);
    track("categories", result.created);
  }

  // 2. Services
  const serviceIds = new Map<string, Types.ObjectId>();
  const createdServices = new Set<string>();
  for (const [index, service] of SEED_SERVICES.entries()) {
    const { industrySlugs = [], relatedProjectSlugs, ...data } = service;
    void relatedProjectSlugs;
    const result = await insertIfMissing(ServiceModel, { slug: service.slug }, {
      ...data,
      industries: industrySlugs.map(slug => categoryIds.get(slug)).filter(Boolean),
      relatedProjects: [],
      startingPrice: "",
      timeline: "",
      status: service.status || "published",
      sortOrder: index,
      previousSlugs: [],
    });
    serviceIds.set(service.slug, result.id);
    if (result.created) createdServices.add(service.slug);
    track("services", result.created);
  }

  // 3. Projects (the deployed restaurant demos)
  const projectIds = new Map<string, Types.ObjectId>();
  const publishedAt = new Date();
  for (const project of SEED_PROJECTS) {
    const result = await insertIfMissing(ProjectModel, { slug: project.slug }, {
      title: project.title,
      slug: project.slug,
      subtitle: project.subtitle,
      summary: project.summary,
      overview: project.overview,
      projectType: "website",
      categories: project.categorySlugs.map(slug => categoryIds.get(slug)).filter(Boolean),
      subcategory: project.subcategory,
      tags: project.tags,
      brandName: project.brandName,
      projectStatus: "concept",
      isClientWork: false,
      publishStatus: "published",
      visibility: "listed",
      featured: project.featured,
      featuredOrder: project.featuredOrder,
      sortOrder: project.sortOrder,
      publishedAt,
      media: demoMedia(project.slug, project.brandName),
      links: {
        liveUrl: project.liveUrl,
        liveUrlLabel: "Open live demo",
        showSourceUrl: false,
      },
      platforms: ["Web (desktop, tablet & mobile)"],
      techStack: DEMO_TECH_STACK,
      corePages: project.corePages,
      designHighlights: project.designHighlights,
      features: project.features,
      modules: [],
      workflows: [],
      caseStudy: { limitations: project.limitations },
      contentBlocks: [],
      demoAccess: { enabled: false },
      relatedProjects: [],
      seo: project.seo,
      previousSlugs: [],
    });
    projectIds.set(project.slug, result.id);
    track("projects", result.created);
  }

  // 4. Relationships for documents created in this run only
  for (const category of SEED_CATEGORIES) {
    if (!createdCategories.has(category.slug)) continue;
    const featured = SEED_PROJECTS.filter(project => project.categorySlugs.includes(category.slug))
      .sort((a, b) => a.featuredOrder - b.featuredOrder)
      .slice(0, 4)
      .map(project => projectIds.get(project.slug));
    await CategoryModel.updateOne(
      { slug: category.slug },
      {
        $set: {
          featuredProjects: featured.filter(Boolean),
          relatedServices: (category.relatedServiceSlugs || [])
            .map(slug => serviceIds.get(slug))
            .filter(Boolean),
        },
      },
    );
  }
  for (const service of SEED_SERVICES) {
    if (!createdServices.has(service.slug) || !service.relatedProjectSlugs) continue;
    await ServiceModel.updateOne(
      { slug: service.slug },
      {
        $set: {
          relatedProjects: service.relatedProjectSlugs
            .map(slug => projectIds.get(slug))
            .filter(Boolean),
        },
      },
    );
  }

  // 5. Site settings singleton (homepage picks resolved to ids)
  const settings = await insertIfMissing(SiteSettingsModel, { key: "main" }, {
    ...DEFAULT_SITE_SETTINGS,
    home: {
      ...DEFAULT_SITE_SETTINGS.home,
      selectedWork: {
        ...DEFAULT_SITE_SETTINGS.home.selectedWork,
        projects: SELECTED_WORK.map(slug => projectIds.get(slug)).filter(Boolean),
      },
      services: {
        ...DEFAULT_SITE_SETTINGS.home.services,
        items: HOME_SERVICES.map(slug => serviceIds.get(slug)).filter(Boolean),
      },
      industries: {
        ...DEFAULT_SITE_SETTINGS.home.industries,
        items: HOME_INDUSTRIES.map(slug => categoryIds.get(slug)).filter(Boolean),
      },
    },
  });
  track("site settings", settings.created);

  // 6. Profile singleton
  const profile = await insertIfMissing(ProfileModel, { key: "main" }, {
    ...DEFAULT_PROFILE,
    featuredProjects: PROFILE_FEATURED.map(slug => projectIds.get(slug)).filter(Boolean),
  });
  track("profile", profile.created);

  // 7. Register the captured screenshots in the media library for reuse
  for (const project of SEED_PROJECTS) {
    const media = demoMedia(project.slug, project.brandName);
    const files = [
      media.coverImage,
      ...media.desktopScreenshots.slice(1),
      media.fullPageScreenshot,
      ...media.tabletScreenshots,
      ...media.mobileScreenshots,
    ];
    for (const file of files) {
      const result = await insertIfMissing(MediaAssetModel, { url: file.url }, {
        kind: "image",
        provider: "static",
        url: file.url,
        title: file.alt,
        alt: file.alt,
        width: file.width,
        height: file.height,
        mimeType: "image/webp",
        tags: ["demo screenshot", project.slug],
      });
      track("media library items", result.created);
    }
  }

  console.log("Seed summary (created / already existed):");
  Object.entries(summary).forEach(([key, value]) =>
    console.log(`  ${key.padEnd(22)} ${String(value.created).padStart(3)} created   ${String(value.existing).padStart(3)} existing`),
  );
}

seed()
  .then(async () => {
    await disconnectDatabase();
    console.log("\nDone.");
    process.exit(0);
  })
  .catch(async error => {
    console.error("Seed failed:", error?.message || error);
    await disconnectDatabase().catch(() => undefined);
    process.exit(1);
  });
