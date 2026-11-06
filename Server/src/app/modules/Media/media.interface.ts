import { MEDIA_KINDS, MEDIA_PROVIDERS } from "./media.constant";

export type TMediaKind = (typeof MEDIA_KINDS)[number];
export type TMediaProvider = (typeof MEDIA_PROVIDERS)[number];

export type TMediaAsset = {
  kind: TMediaKind;
  provider: TMediaProvider;
  url: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizeBytes?: number;
  posterUrl?: string; // video thumbnail
  storageKey?: string; // S3 object key for uploaded files
  tags: string[];
};
