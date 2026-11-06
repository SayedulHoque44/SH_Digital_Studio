import httpStatus from "http-status";
import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { CategoryModel } from "../Category/category.model";
import { SiteSettingsModel } from "../SiteSettings/siteSettings.model";
import {
  applyOrder,
  generateUniqueSlug,
  resolveSlugChange,
  uniqueIds,
} from "../shared/shared.utils";
import { ServiceSearchFields, ServiceSortOptions } from "./service.constant";
import { TService } from "./service.interface";
import { ServiceModel } from "./service.model";

type TServicePayload = Partial<TService> & { slug?: string };

const normalize = (payload: TServicePayload) => {
  const data: Record<string, unknown> = { ...payload };
  if (payload.industries) data.industries = uniqueIds(payload.industries);
  if (payload.relatedProjects) data.relatedProjects = uniqueIds(payload.relatedProjects);
  delete data.slug;
  return data;
};

const createServiceIntoDB = async (payload: TServicePayload) => {
  const slug = await generateUniqueSlug(ServiceModel, payload.slug || payload.title!);
  return ServiceModel.create({ ...normalize(payload), slug });
};

const getServicesFromDB = async (query: Record<string, unknown>) => {
  const servicesQuery = new QueryBuilder(
    ServiceModel.find().select(
      "title slug shortDescription icon status sortOrder startingPrice timeline updatedAt",
    ),
    { limit: 100, ...query },
    100,
  )
    .search(ServiceSearchFields)
    .filter(["status"])
    .sort(ServiceSortOptions, "sortOrder title")
    .paginate();

  const result = await servicesQuery.modelQuery.lean();
  const meta = await servicesQuery.countTotal();
  return { meta, result };
};

const getServiceOptionsFromDB = async () =>
  ServiceModel.find().select("title slug status").sort("sortOrder title").lean();

const getSingleServiceFromDB = async (id: string) => {
  const service = await ServiceModel.findById(id).lean();
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  return service;
};

const updateServiceIntoDB = async (id: string, payload: TServicePayload) => {
  const existing = await ServiceModel.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  const data = normalize(payload);
  Object.assign(data, await resolveSlugChange(ServiceModel, existing, payload.slug));
  return ServiceModel.findByIdAndUpdate(id, { $set: data }, {
    new: true,
    runValidators: true,
  }).lean();
};

const deleteServiceFromDB = async (id: string) => {
  const service = await ServiceModel.findById(id);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }
  await service.deleteOne();
  await SiteSettingsModel.updateMany({}, { $pull: { "home.services.items": service._id } });
  // Category pages reference services too
  await CategoryModel.updateMany(
    { relatedServices: service._id },
    { $pull: { relatedServices: service._id } },
  );
  return service;
};

const reorderServices = async (ids: string[]) => {
  await applyOrder(ServiceModel, ids);
};

export const ServiceServices = {
  createServiceIntoDB,
  getServicesFromDB,
  getServiceOptionsFromDB,
  getSingleServiceFromDB,
  updateServiceIntoDB,
  deleteServiceFromDB,
  reorderServices,
};
