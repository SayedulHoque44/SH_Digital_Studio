import { z } from "zod";
import {
  idParams,
  mediaUrl,
  optionalMediaUrl,
  optionalText,
  paginationQuery,
  stringList,
} from "../shared/shared.validation";
import { MEDIA_KINDS } from "./media.constant";

const mediaBody = z.object({
  kind: z.enum(MEDIA_KINDS).optional(),
  url: mediaUrl,
  title: optionalText(120),
  alt: optionalText(320),
  caption: optionalText(320),
  description: optionalText(1000),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  mimeType: optionalText(60),
  sizeBytes: z.number().int().nonnegative().optional(),
  posterUrl: optionalMediaUrl,
  storageKey: optionalText(300),
  tags: stringList(20, 40).optional(),
});

const createMediaSchema = z.object({ body: mediaBody });

const updateMediaSchema = z.object({
  params: idParams,
  body: mediaBody.omit({ storageKey: true, sizeBytes: true, mimeType: true }).partial(),
});

const listMediaSchema = z.object({
  query: z.object({
    ...paginationQuery,
    kind: z.enum(MEDIA_KINDS).optional(),
  }),
});

const deleteMediaSchema = z.object({
  params: idParams,
  query: z.object({ force: z.enum(["true", "false"]).optional() }),
});

const uploadUrlSchema = z.object({
  body: z.object({
    fileName: z.string().trim().min(1).max(200),
    contentType: z.string().trim().max(60),
    sizeBytes: z.number().int().positive(),
  }),
});

export const MediaValidations = {
  createMediaSchema,
  updateMediaSchema,
  listMediaSchema,
  deleteMediaSchema,
  uploadUrlSchema,
};
