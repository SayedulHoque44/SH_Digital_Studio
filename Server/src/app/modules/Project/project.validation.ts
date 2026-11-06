import { z } from "zod";
import {
  contentBlocks,
  cta,
  featureItem,
  idParams,
  markdown,
  mediaRef,
  objectId,
  optionalExternalUrl,
  optionalMediaRef,
  optionalText,
  paginationQuery,
  publishStatus,
  seo,
  slug,
  stringList,
  text,
  videoRef,
} from "../shared/shared.validation";
import { PROJECT_STATUSES, PROJECT_TYPES, PROJECT_VISIBILITY } from "./project.constant";

const mediaList = (max = 20) => z.array(mediaRef).max(max);

const projectBody = z.object({
  title: text(120).min(2, "Title is required"),
  slug: z.union([z.literal(""), slug]).optional(),
  subtitle: optionalText(160),
  summary: optionalText(320),
  overview: markdown,
  projectType: z.enum(PROJECT_TYPES),
  categories: z.array(objectId).max(10).optional(),
  subcategory: optionalText(80),
  tags: stringList(20, 40).optional(),
  brandName: optionalText(80),
  projectStatus: z.enum(PROJECT_STATUSES).optional(),
  isClientWork: z.boolean().optional(),
  clientName: optionalText(120),
  publishStatus: publishStatus.optional(),
  visibility: z.enum(PROJECT_VISIBILITY).optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).max(100000).optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  media: z
    .object({
      coverImage: optionalMediaRef,
      logo: optionalMediaRef,
      browserMockup: optionalMediaRef,
      fullPageScreenshot: optionalMediaRef,
      desktopScreenshots: mediaList().optional(),
      tabletScreenshots: mediaList().optional(),
      mobileScreenshots: mediaList().optional(),
      gallery: mediaList(40).optional(),
    })
    .optional(),
  video: videoRef.optional().nullable(),
  links: z
    .object({
      liveUrl: optionalExternalUrl,
      liveUrlLabel: optionalText(40),
      secondaryUrl: optionalExternalUrl,
      secondaryUrlLabel: optionalText(40),
      sourceUrl: optionalExternalUrl,
      showSourceUrl: z.boolean().optional(),
      appStoreUrl: optionalExternalUrl,
      playStoreUrl: optionalExternalUrl,
    })
    .optional(),
  platforms: stringList(10, 40).optional(),
  techStack: stringList(40, 40).optional(),
  corePages: stringList(30, 60).optional(),
  designHighlights: stringList(12, 160).optional(),
  features: z.array(featureItem).max(30).optional(),
  modules: z.array(featureItem).max(30).optional(),
  workflows: z.array(featureItem).max(20).optional(),
  caseStudy: z
    .object({
      goals: markdown,
      problem: markdown,
      solution: markdown,
      targetAudience: markdown,
      process: markdown,
      designDecisions: markdown,
      challenges: markdown,
      implementation: markdown,
      role: markdown,
      collaboration: markdown,
      timeline: markdown,
      outcomes: markdown,
      lessons: markdown,
      limitations: markdown,
    })
    .optional(),
  contentBlocks: contentBlocks.optional(),
  demoAccess: z
    .object({
      enabled: z.boolean(),
      username: optionalText(120),
      password: optionalText(120),
      loginUrl: optionalExternalUrl,
      instructions: optionalText(1000),
      limitations: optionalText(600),
    })
    .refine(
      value => !value.enabled || !!(value.username || value.instructions),
      {
        message: "Add demo credentials or instructions before enabling the panel",
        path: ["username"],
      },
    )
    .optional(),
  relatedProjects: z.array(objectId).max(6).optional(),
  cta: cta.optional(),
  seo: seo.optional(),
  internalNotes: optionalText(5000),
});

const createProjectSchema = z.object({ body: projectBody });

const updateProjectSchema = z.object({
  params: idParams,
  body: projectBody.partial(),
});

const listProjectsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    publishStatus: publishStatus.optional(),
    projectType: z.enum(PROJECT_TYPES).optional(),
    category: objectId.optional(),
    featured: z.enum(["true", "false"]).optional(),
    sort: z.string().max(20).optional(),
  }),
});

export const ProjectValidations = {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
};
