import { Types } from "mongoose";
import { BLOCK_TYPES, PUBLISH_STATUSES } from "./shared.constant";

export type TPublishStatus = (typeof PUBLISH_STATUSES)[number];
export type TBlockType = (typeof BLOCK_TYPES)[number];

// Media is embedded (url + presentation data) rather than referenced, so a
// page never breaks because a library item was edited or removed. `assetId`
// optionally links back to the media library entry it was picked from.
export type TMediaRef = {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  assetId?: Types.ObjectId;
};

export type TVideoRef = {
  url: string;
  title?: string;
  posterUrl?: string;
  captionsUrl?: string;
  transcript?: string;
};

export type TSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
};

export type TCta = {
  heading?: string;
  text?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type TFaq = {
  question: string;
  answer: string;
};

export type TFeatureItem = {
  title: string;
  description?: string;
  icon?: string;
};

export type TContentBlock = {
  _id?: Types.ObjectId;
  type: TBlockType;
  data: Record<string, unknown>;
};
