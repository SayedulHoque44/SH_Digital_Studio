import { Schema, model } from "mongoose";
import { MEDIA_KINDS, MEDIA_PROVIDERS } from "./media.constant";
import { TMediaAsset } from "./media.interface";

const mediaAssetSchema = new Schema<TMediaAsset>(
  {
    kind: { type: String, enum: MEDIA_KINDS, required: true },
    provider: { type: String, enum: MEDIA_PROVIDERS, default: "external" },
    url: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    alt: { type: String, trim: true },
    caption: { type: String, trim: true },
    description: String,
    width: Number,
    height: Number,
    mimeType: String,
    sizeBytes: Number,
    posterUrl: String,
    storageKey: String,
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ kind: 1 });

export const MediaAssetModel = model<TMediaAsset>("MediaAsset", mediaAssetSchema);
