import { Types } from "mongoose";
import {
  TContentBlock,
  TCta,
  TFeatureItem,
  TMediaRef,
  TPublishStatus,
  TSeo,
  TVideoRef,
} from "../shared/shared.interface";
import { PROJECT_STATUSES, PROJECT_TYPES, PROJECT_VISIBILITY } from "./project.constant";

export type TProjectType = (typeof PROJECT_TYPES)[number];
export type TProjectStatus = (typeof PROJECT_STATUSES)[number];
export type TProjectVisibility = (typeof PROJECT_VISIBILITY)[number];

export type TProjectMedia = {
  coverImage?: TMediaRef;
  logo?: TMediaRef;
  browserMockup?: TMediaRef;
  // Tall, scrollable capture of a whole web page
  fullPageScreenshot?: TMediaRef;
  desktopScreenshots: TMediaRef[];
  tabletScreenshots: TMediaRef[];
  mobileScreenshots: TMediaRef[];
  gallery: TMediaRef[];
};

export type TProjectLinks = {
  liveUrl?: string;
  liveUrlLabel?: string;
  secondaryUrl?: string;
  secondaryUrlLabel?: string;
  sourceUrl?: string;
  // Source code links are hidden unless explicitly marked public
  showSourceUrl: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
};

export type TCaseStudy = {
  goals?: string;
  problem?: string;
  solution?: string;
  targetAudience?: string;
  process?: string;
  designDecisions?: string;
  challenges?: string;
  implementation?: string;
  role?: string;
  collaboration?: string;
  timeline?: string;
  outcomes?: string;
  lessons?: string;
  limitations?: string;
};

// Public demo credentials. Only exposed publicly while `enabled` is true -
// these must always be sandbox/demo accounts, never real or admin credentials.
export type TDemoAccess = {
  enabled: boolean;
  username?: string;
  password?: string;
  loginUrl?: string;
  instructions?: string;
  limitations?: string;
};

export type TProject = {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  overview?: string;
  projectType: TProjectType;
  categories: Types.ObjectId[];
  subcategory?: string;
  tags: string[];
  brandName?: string;
  projectStatus: TProjectStatus;
  isClientWork: boolean;
  clientName?: string;
  publishStatus: TPublishStatus;
  visibility: TProjectVisibility;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  publishedAt?: Date;
  media: TProjectMedia;
  video?: TVideoRef;
  links: TProjectLinks;
  platforms: string[];
  techStack: string[];
  corePages: string[];
  designHighlights: string[];
  features: TFeatureItem[];
  modules: TFeatureItem[];
  workflows: TFeatureItem[];
  caseStudy: TCaseStudy;
  contentBlocks: TContentBlock[];
  demoAccess: TDemoAccess;
  relatedProjects: Types.ObjectId[];
  cta?: TCta;
  seo?: TSeo;
  // Private - never returned by public endpoints
  internalNotes?: string;
  previousSlugs: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
