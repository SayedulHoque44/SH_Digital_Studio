import { Schema, model } from "mongoose";
import { PROJECT_TYPES } from "../Project/project.constant";
import { SIMPLE_PUBLISH_STATUSES } from "../shared/shared.constant";
import {
  ctaSchema,
  faqSchema,
  featureItemSchema,
  mediaRefSchema,
  seoSchema,
} from "../shared/shared.model";
import { TService } from "./service.interface";

const serviceSchema = new Schema<TService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: String,
    description: String,
    icon: String,
    image: { type: mediaRefSchema, default: undefined },
    benefits: { type: [String], default: [] },
    features: { type: [featureItemSchema], default: [] },
    deliverables: { type: [String], default: [] },
    industries: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    relatedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    projectTypes: [{ type: String, enum: PROJECT_TYPES }],
    startingPrice: String,
    priceNote: String,
    timeline: String,
    faqs: { type: [faqSchema], default: [] },
    cta: { type: ctaSchema, default: undefined },
    seo: { type: seoSchema, default: undefined },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: SIMPLE_PUBLISH_STATUSES, default: "draft" },
    previousSlugs: { type: [String], default: [] },
  },
  { timestamps: true },
);

serviceSchema.index({ status: 1, sortOrder: 1 });
serviceSchema.index({ previousSlugs: 1 });

export const ServiceModel = model<TService>("Service", serviceSchema);
