import httpStatus from "http-status";
import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { ProjectModel } from "../Project/project.model";
import { ServiceModel } from "../Service/service.model";
import { SiteSettingsModel } from "../SiteSettings/siteSettings.model";
import {
  applyOrder,
  emptyToNull,
  generateUniqueSlug,
  resolveSlugChange,
  uniqueIds,
} from "../shared/shared.utils";
import { CategorySearchFields, CategorySortOptions } from "./category.constant";
import { TCategory } from "./category.interface";
import { CategoryModel } from "./category.model";

type TCategoryPayload = Partial<TCategory> & { slug?: string; parent?: unknown };

const normalize = (payload: TCategoryPayload) => {
  const data: Record<string, unknown> = { ...payload };
  if ("parent" in payload) data.parent = emptyToNull(payload.parent);
  if (payload.featuredProjects) data.featuredProjects = uniqueIds(payload.featuredProjects);
  if (payload.relatedServices) data.relatedServices = uniqueIds(payload.relatedServices);
  delete data.slug;
  return data;
};

/**
 * The taxonomy is kept to two levels (industry -> sub-category, e.g.
 * Restaurants -> Fine Dining). That keeps URLs, menus and filters simple and
 * rules out parent cycles.
 */
const assertValidParent = async (categoryId: string | undefined, parentId: unknown) => {
  if (!parentId) return;
  if (categoryId && String(parentId) === categoryId) {
    throw new AppError(httpStatus.BAD_REQUEST, "A category cannot be its own parent");
  }
  const parent = await CategoryModel.findById(parentId).select("parent").lean();
  if (!parent) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parent category not found");
  }
  if (parent.parent) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Choose a top-level category as the parent (only two levels are supported)",
    );
  }
  if (categoryId && (await CategoryModel.exists({ parent: categoryId }))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This category has sub-categories, so it cannot become a sub-category itself",
    );
  }
};

const createCategoryIntoDB = async (payload: TCategoryPayload) => {
  const data = normalize(payload);
  await assertValidParent(undefined, data.parent);
  const slug = await generateUniqueSlug(CategoryModel, payload.slug || payload.name!);
  return CategoryModel.create({ ...data, slug });
};

// Includes how many projects use each category (total and published)
const getCategoriesFromDB = async (query: Record<string, unknown>) => {
  const categoriesQuery = new QueryBuilder(
    CategoryModel.find()
      .select("name slug shortDescription parent status sortOrder showOnHome coverImage icon updatedAt")
      .populate("parent", "name slug"),
    { limit: 100, ...query },
    100,
  )
    .search(CategorySearchFields)
    .filter(["status"])
    .sort(CategorySortOptions, "sortOrder name")
    .paginate();

  const categories = await categoriesQuery.modelQuery.lean();
  const meta = await categoriesQuery.countTotal();

  const counts = await ProjectModel.aggregate<{
    _id: Types.ObjectId;
    total: number;
    published: number;
  }>([
    { $unwind: "$categories" },
    {
      $group: {
        _id: "$categories",
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ["$publishStatus", "published"] }, 1, 0] },
        },
      },
    },
  ]);
  const countMap = new Map(counts.map(item => [String(item._id), item]));

  const result = categories.map(category => ({
    ...category,
    projectCount: countMap.get(String(category._id))?.total || 0,
    publishedProjectCount: countMap.get(String(category._id))?.published || 0,
  }));

  return { meta, result };
};

const getCategoryOptionsFromDB = async () =>
  CategoryModel.find()
    .select("name slug parent status")
    .sort("sortOrder name")
    .lean();

const getSingleCategoryFromDB = async (id: string) => {
  const category = await CategoryModel.findById(id).lean();
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

const updateCategoryIntoDB = async (id: string, payload: TCategoryPayload) => {
  const existing = await CategoryModel.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  const data = normalize(payload);
  if ("parent" in data) await assertValidParent(id, data.parent);
  Object.assign(data, await resolveSlugChange(CategoryModel, existing, payload.slug));

  return CategoryModel.findByIdAndUpdate(id, { $set: data }, {
    new: true,
    runValidators: true,
  }).lean();
};

// What deleting this category affects - shown in the confirmation dialog
const getDeleteImpactFromDB = async (id: string) => {
  const [projectCount, publishedProjectCount, childCount] = await Promise.all([
    ProjectModel.countDocuments({ categories: id }),
    ProjectModel.countDocuments({ categories: id, publishStatus: "published" }),
    CategoryModel.countDocuments({ parent: id }),
  ]);
  return { projectCount, publishedProjectCount, childCount };
};

/**
 * Deleting a category never deletes projects. Projects simply lose this
 * category, sub-categories become top-level, and homepage/service references
 * are removed.
 */
const deleteCategoryFromDB = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  await category.deleteOne();
  const objectId = category._id;
  await Promise.all([
    ProjectModel.updateMany({ categories: objectId }, { $pull: { categories: objectId } }),
    CategoryModel.updateMany({ parent: objectId }, { $set: { parent: null } }),
    ServiceModel.updateMany({ industries: objectId }, { $pull: { industries: objectId } }),
    SiteSettingsModel.updateMany({}, { $pull: { "home.industries.items": objectId } }),
  ]);
  return category;
};

const reorderCategories = async (ids: string[]) => {
  await applyOrder(CategoryModel, ids);
};

export const CategoryServices = {
  createCategoryIntoDB,
  getCategoriesFromDB,
  getCategoryOptionsFromDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  getDeleteImpactFromDB,
  deleteCategoryFromDB,
  reorderCategories,
};
