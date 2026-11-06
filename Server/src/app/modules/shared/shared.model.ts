import { Schema } from "mongoose";
import { BLOCK_TYPES } from "./shared.constant";
import {
  TContentBlock,
  TCta,
  TFaq,
  TFeatureItem,
  TMediaRef,
  TSeo,
  TVideoRef,
} from "./shared.interface";

// Reusable Mongoose sub-schemas shared by Project, Category, Service, Profile
// and SiteSettings. Request validation lives in shared.validation.ts.

export const mediaRefSchema = new Schema<TMediaRef>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
    caption: { type: String, trim: true },
    width: Number,
    height: Number,
    assetId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },
  },
  { _id: false },
);

export const videoRefSchema = new Schema<TVideoRef>(
  {
    url: { type: String, required: true, trim: true },
    title: String,
    posterUrl: String,
    captionsUrl: String,
    transcript: String,
  },
  { _id: false },
);

export const seoSchema = new Schema<TSeo>(
  {
    title: String,
    description: String,
    ogImage: String,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

export const ctaSchema = new Schema<TCta>(
  {
    heading: String,
    text: String,
    buttonLabel: String,
    buttonHref: String,
  },
  { _id: false },
);

export const faqSchema = new Schema<TFaq>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

export const featureItemSchema = new Schema<TFeatureItem>({
  title: { type: String, required: true },
  description: String,
  icon: String,
});

// `data` is validated per block type by Zod before it is saved.
export const contentBlockSchema = new Schema<TContentBlock>({
  type: { type: String, enum: BLOCK_TYPES, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
});
