import { Types } from "mongoose";
import { TCta, TFaq, TFeatureItem, TMediaRef, TSeo } from "../shared/shared.interface";
import { TProjectType } from "../Project/project.interface";

export type TService = {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string; // markdown
  icon?: string;
  image?: TMediaRef;
  benefits: string[];
  features: TFeatureItem[];
  deliverables: string[];
  industries: Types.ObjectId[];
  relatedProjects: Types.ObjectId[];
  // Used to show matching work automatically when relatedProjects is empty
  projectTypes: TProjectType[];
  // Optional and empty by default - only publish confirmed prices/timelines
  startingPrice?: string;
  priceNote?: string;
  timeline?: string;
  faqs: TFaq[];
  cta?: TCta;
  seo?: TSeo;
  sortOrder: number;
  status: "draft" | "published";
  previousSlugs: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
