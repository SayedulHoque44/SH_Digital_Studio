import { z } from "zod";
import { PROJECT_TYPES } from "../Project/project.constant";
import {
  cta,
  faq,
  featureItem,
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

const serviceBody = z.object({
  title: text(100).min(2, "Title is required"),
  slug: z.union([z.literal(""), slug]).optional(),
  shortDescription: optionalText(320),
  description: markdown,
  icon: optionalText(40),
  image: optionalMediaRef,
  benefits: stringList(12, 200).optional(),
  features: z.array(featureItem).max(20).optional(),
  deliverables: stringList(20, 160).optional(),
  industries: z.array(objectId).max(20).optional(),
  relatedProjects: z.array(objectId).max(12).optional(),
  projectTypes: z.array(z.enum(PROJECT_TYPES)).max(7).optional(),
  startingPrice: optionalText(60),
  priceNote: optionalText(200),
  timeline: optionalText(80),
  faqs: z.array(faq).max(20).optional(),
  cta: cta.optional(),
  seo: seo.optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
  status: simplePublishStatus.optional(),
});

const createServiceSchema = z.object({ body: serviceBody });

const updateServiceSchema = z.object({
  params: idParams,
  body: serviceBody.partial(),
});

const listServicesSchema = z.object({
  query: z.object({
    ...paginationQuery,
    status: simplePublishStatus.optional(),
    sort: z.string().max(20).optional(),
  }),
});

export const ServiceValidations = {
  createServiceSchema,
  updateServiceSchema,
  listServicesSchema,
};
