import { Schema, model } from "mongoose";
import { SIMPLE_PUBLISH_STATUSES } from "../shared/shared.constant";
import {
  contentBlockSchema,
  ctaSchema,
  faqSchema,
  mediaRefSchema,
  seoSchema,
} from "../shared/shared.model";
import { TCategory } from "./category.interface";

const categorySchema = new Schema<TCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: String,
    introduction: String,
    emailIntro: String,
    highlights: { type: [String], default: [] },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    icon: String,
    coverImage: { type: mediaRefSchema, default: undefined },
    featuredImage: { type: mediaRefSchema, default: undefined },
    contentBlocks: { type: [contentBlockSchema], default: [] },
    featuredProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    relatedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    faqs: { type: [faqSchema], default: [] },
    cta: { type: ctaSchema, default: undefined },
    seo: { type: seoSchema, default: undefined },
    showOnHome: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: SIMPLE_PUBLISH_STATUSES, default: "draft" },
    previousSlugs: { type: [String], default: [] },
  },
  { timestamps: true },
);

categorySchema.index({ status: 1, sortOrder: 1 });
categorySchema.index({ previousSlugs: 1 });
categorySchema.index({ parent: 1 });

export const CategoryModel = model<TCategory>("Category", categorySchema);
