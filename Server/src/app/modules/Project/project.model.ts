import { Schema, model } from "mongoose";
import { PUBLISH_STATUSES } from "../shared/shared.constant";
import {
  contentBlockSchema,
  ctaSchema,
  featureItemSchema,
  mediaRefSchema,
  seoSchema,
  videoRefSchema,
} from "../shared/shared.model";
import { PROJECT_STATUSES, PROJECT_TYPES, PROJECT_VISIBILITY } from "./project.constant";
import { TProject } from "./project.interface";

const projectSchema = new Schema<TProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subtitle: String,
    summary: String,
    overview: String,
    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    subcategory: String,
    tags: { type: [String], default: [] },
    brandName: String,
    projectStatus: { type: String, enum: PROJECT_STATUSES, default: "concept" },
    isClientWork: { type: Boolean, default: false },
    clientName: String,
    publishStatus: { type: String, enum: PUBLISH_STATUSES, default: "draft" },
    visibility: { type: String, enum: PROJECT_VISIBILITY, default: "listed" },
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    publishedAt: Date,
    media: {
      coverImage: { type: mediaRefSchema, default: undefined },
      logo: { type: mediaRefSchema, default: undefined },
      browserMockup: { type: mediaRefSchema, default: undefined },
      fullPageScreenshot: { type: mediaRefSchema, default: undefined },
      desktopScreenshots: { type: [mediaRefSchema], default: [] },
      tabletScreenshots: { type: [mediaRefSchema], default: [] },
      mobileScreenshots: { type: [mediaRefSchema], default: [] },
      gallery: { type: [mediaRefSchema], default: [] },
    },
    video: { type: videoRefSchema, default: undefined },
    links: {
      liveUrl: String,
      liveUrlLabel: String,
      secondaryUrl: String,
      secondaryUrlLabel: String,
      sourceUrl: String,
      showSourceUrl: { type: Boolean, default: false },
      appStoreUrl: String,
      playStoreUrl: String,
    },
    platforms: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    corePages: { type: [String], default: [] },
    designHighlights: { type: [String], default: [] },
    features: { type: [featureItemSchema], default: [] },
    modules: { type: [featureItemSchema], default: [] },
    workflows: { type: [featureItemSchema], default: [] },
    caseStudy: {
      goals: String,
      problem: String,
      solution: String,
      targetAudience: String,
      process: String,
      designDecisions: String,
      challenges: String,
      implementation: String,
      role: String,
      collaboration: String,
      timeline: String,
      outcomes: String,
      lessons: String,
      limitations: String,
    },
    contentBlocks: { type: [contentBlockSchema], default: [] },
    demoAccess: {
      enabled: { type: Boolean, default: false },
      username: String,
      password: String,
      loginUrl: String,
      instructions: String,
      limitations: String,
    },
    relatedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    cta: { type: ctaSchema, default: undefined },
    seo: { type: seoSchema, default: undefined },
    internalNotes: String,
    previousSlugs: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Public listing: published + listed, ordered
projectSchema.index({ publishStatus: 1, visibility: 1, sortOrder: 1 });
projectSchema.index({ categories: 1 });
projectSchema.index({ projectType: 1 });
projectSchema.index({ featured: 1, featuredOrder: 1 });
projectSchema.index({ previousSlugs: 1 });

export const ProjectModel = model<TProject>("Project", projectSchema);
