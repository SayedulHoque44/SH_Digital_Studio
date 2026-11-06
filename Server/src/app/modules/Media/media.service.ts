import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import httpStatus from "http-status";
import QueryBuilder from "../../../builder/QueryBuilder";
import config from "../../config";
import AppError from "../../error/AppError";
import { deleteS3Object, getS3Client, isS3Configured, publicUrlForKey } from "../../utils/s3";
import { logger } from "../../utils/logger";
import { CategoryModel } from "../Category/category.model";
import { ProfileModel } from "../Profile/profile.model";
import { ProjectModel } from "../Project/project.model";
import { ServiceModel } from "../Service/service.model";
import { SiteSettingsModel } from "../SiteSettings/siteSettings.model";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MediaSearchFields,
} from "./media.constant";
import { TMediaAsset } from "./media.interface";
import { MediaAssetModel } from "./media.model";
import { detectVideoProvider } from "./media.utils";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)(\?|$)/i;

const getMediaConfig = () => ({
  uploadsEnabled: isS3Configured(),
  maxImageBytes: MAX_IMAGE_BYTES,
  maxVideoBytes: MAX_VIDEO_BYTES,
  allowedImageTypes: Object.keys(ALLOWED_IMAGE_TYPES),
  allowedVideoTypes: Object.keys(ALLOWED_VIDEO_TYPES),
});

const createMediaIntoDB = async (payload: Partial<TMediaAsset>) => {
  const data: Partial<TMediaAsset> = { ...payload };
  const video = detectVideoProvider(payload.url!);

  if (video) {
    data.kind = "video";
    data.provider = video.provider;
    data.posterUrl = payload.posterUrl || video.posterUrl;
  } else if (payload.storageKey) {
    // Uploaded through a presigned URL: the key and URL must belong to the
    // configured bucket/prefix - clients cannot register arbitrary keys.
    if (
      !payload.storageKey.startsWith(`${config.media_upload_prefix}/`) ||
      payload.url !== publicUrlForKey(payload.storageKey)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid upload reference");
    }
    data.provider = "upload";
  } else {
    data.provider = payload.url!.startsWith("/") ? "static" : "external";
  }

  if (!data.kind) {
    data.kind =
      VIDEO_EXTENSIONS.test(payload.url!) || payload.mimeType?.startsWith("video/")
        ? "video"
        : "image";
  }

  return MediaAssetModel.create(data);
};

const getMediaFromDB = async (query: Record<string, unknown>) => {
  const mediaQuery = new QueryBuilder(MediaAssetModel.find(), query, 24)
    .search(MediaSearchFields)
    .filter(["kind"])
    .sort({}, "-createdAt")
    .paginate();
  const result = await mediaQuery.modelQuery.lean();
  const meta = await mediaQuery.countTotal();
  return { meta, result };
};

const updateMediaIntoDB = async (id: string, payload: Partial<TMediaAsset>) => {
  const media = await MediaAssetModel.findByIdAndUpdate(id, { $set: payload }, {
    new: true,
    runValidators: true,
  }).lean();
  if (!media) {
    throw new AppError(httpStatus.NOT_FOUND, "Media item not found");
  }
  return media;
};

/**
 * Counts where a media URL is used across all content. Media is embedded in
 * documents (not referenced), so this is how the library warns before a
 * file that is still in use gets removed.
 */
const findMediaUsage = async (url: string) => {
  const projectPaths = [
    "media.coverImage.url",
    "media.logo.url",
    "media.browserMockup.url",
    "media.fullPageScreenshot.url",
    "media.desktopScreenshots.url",
    "media.tabletScreenshots.url",
    "media.mobileScreenshots.url",
    "media.gallery.url",
    "video.url",
    "video.posterUrl",
    "seo.ogImage",
    "contentBlocks.data.image.url",
    "contentBlocks.data.images.url",
    "contentBlocks.data.before.url",
    "contentBlocks.data.after.url",
    "contentBlocks.data.video.url",
  ];
  const categoryPaths = [
    "coverImage.url",
    "featuredImage.url",
    "seo.ogImage",
    "contentBlocks.data.image.url",
    "contentBlocks.data.images.url",
  ];
  const anyOf = (paths: string[]) => ({ $or: paths.map(path => ({ [path]: url })) });

  const [projects, categories, services, profile, settings] = await Promise.all([
    ProjectModel.find(anyOf(projectPaths)).select("title").lean(),
    CategoryModel.find(anyOf(categoryPaths)).select("name").lean(),
    ServiceModel.find(anyOf(["image.url", "seo.ogImage"])).select("title").lean(),
    ProfileModel.countDocuments(anyOf(["photo.url", "experience.logo.url"])),
    SiteSettingsModel.countDocuments(
      anyOf(["seo.defaultOgImage", "brand.logoUrl", "brand.logoDarkUrl"]),
    ),
  ]);

  const usedIn = [
    ...projects.map(item => `Project: ${item.title}`),
    ...categories.map(item => `Category: ${item.name}`),
    ...services.map(item => `Service: ${item.title}`),
    ...(profile ? ["Profile"] : []),
    ...(settings ? ["Site settings"] : []),
  ];
  return { count: usedIn.length, usedIn };
};

const getMediaUsageFromDB = async (id: string) => {
  const media = await MediaAssetModel.findById(id).lean();
  if (!media) {
    throw new AppError(httpStatus.NOT_FOUND, "Media item not found");
  }
  return findMediaUsage(media.url);
};

const deleteMediaFromDB = async (id: string, force: boolean) => {
  const media = await MediaAssetModel.findById(id);
  if (!media) {
    throw new AppError(httpStatus.NOT_FOUND, "Media item not found");
  }

  const usage = await findMediaUsage(media.url);
  if (usage.count > 0 && !force) {
    throw new AppError(
      httpStatus.CONFLICT,
      `This file is still used in ${usage.count} place(s): ${usage.usedIn.slice(0, 3).join(", ")}`,
    );
  }

  if (media.provider === "upload" && media.storageKey && isS3Configured()) {
    try {
      await deleteS3Object(media.storageKey);
    } catch (error: any) {
      logger.warn("Could not delete S3 object", { reason: error?.message });
    }
  }
  await media.deleteOne();
  return media;
};

/**
 * Issues a short-lived presigned PUT URL so the browser uploads straight to
 * S3 (the API server never handles the file bytes). Content type and exact
 * size are part of the signature, so the upload cannot be swapped for a
 * different file type or a larger file.
 */
const createUploadUrl = async (payload: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}) => {
  if (!isS3Configured()) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "File uploads are not configured. Add media by URL, or configure S3 (see Server/README.md).",
    );
  }

  const imageExt = ALLOWED_IMAGE_TYPES[payload.contentType];
  const videoExt = ALLOWED_VIDEO_TYPES[payload.contentType];
  const extension = imageExt || videoExt;
  if (!extension) {
    throw new AppError(httpStatus.BAD_REQUEST, "This file type is not allowed");
  }
  const maxBytes = imageExt ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (payload.sizeBytes > maxBytes) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`,
    );
  }

  const now = new Date();
  const key = `${config.media_upload_prefix}/${now.getUTCFullYear()}/${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    getS3Client(),
    new PutObjectCommand({
      Bucket: config.aws_s3_bucket_name,
      Key: key,
      ContentType: payload.contentType,
      ContentLength: payload.sizeBytes,
    }),
    { expiresIn: 300 },
  );

  return { uploadUrl, key, publicUrl: publicUrlForKey(key) };
};

export const MediaServices = {
  getMediaConfig,
  createMediaIntoDB,
  getMediaFromDB,
  updateMediaIntoDB,
  getMediaUsageFromDB,
  deleteMediaFromDB,
  createUploadUrl,
};
