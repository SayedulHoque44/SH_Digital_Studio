import { z } from "zod";
import {
  contentBlocks,
  cta,
  faq,
  idParams,
  markdown,
  objectId,
  optionalMediaRef,
  optionalText,
  paginationQuery,
  seo,
  simplePublishStatus,
  slug,
  stringList,
  text,
} from "../shared/shared.validation";

const categoryBody = z.object({
  name: text(80).min(2, "Name is required"),
  slug: z.union([z.literal(""), slug]).optional(),
  shortDescription: optionalText(320),
  introduction: markdown,
  emailIntro: optionalText(600),
  highlights: stringList(12, 120).optional(),
  parent: z.union([objectId, z.literal(""), z.null()]).optional(),
  icon: optionalText(40),
  coverImage: optionalMediaRef,
  featuredImage: optionalMediaRef,
  contentBlocks: contentBlocks.optional(),
  featuredProjects: z.array(objectId).max(24).optional(),
  relatedServices: z.array(objectId).max(12).optional(),
  faqs: z.array(faq).max(20).optional(),
  cta: cta.optional(),
  seo: seo.optional(),
  showOnHome: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
  status: simplePublishStatus.optional(),
});

const createCategorySchema = z.object({ body: categoryBody });

const updateCategorySchema = z.object({
  params: idParams,
  body: categoryBody.partial(),
});

const listCategoriesSchema = z.object({
  query: z.object({
    ...paginationQuery,
    status: simplePublishStatus.optional(),
    sort: z.string().max(20).optional(),
  }),
});

export const CategoryValidations = {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
};
