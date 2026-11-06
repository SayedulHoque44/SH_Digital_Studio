import { Types } from "mongoose";
import {
  TContentBlock,
  TCta,
  TFaq,
  TMediaRef,
  TSeo,
} from "../shared/shared.interface";

export type TCategoryStatus = "draft" | "published";

export type TCategory = {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  shortDescription?: string;
  // Long-form markdown introduction for the industry landing page
  introduction?: string;
  // Short plain-text intro you can paste into an email with the page link
  emailIntro?: string;
  // "What we build for this industry" bullet points
  highlights: string[];
  parent?: Types.ObjectId | null;
  icon?: string;
  coverImage?: TMediaRef;
  featuredImage?: TMediaRef;
  contentBlocks: TContentBlock[];
  // Ordered projects shown first on the category page
  featuredProjects: Types.ObjectId[];
  relatedServices: Types.ObjectId[];
  faqs: TFaq[];
  cta?: TCta;
  seo?: TSeo;
  showOnHome: boolean;
  sortOrder: number;
  status: TCategoryStatus;
  previousSlugs: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
