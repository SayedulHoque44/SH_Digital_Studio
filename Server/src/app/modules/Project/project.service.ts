import httpStatus from "http-status";
import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { CategoryModel } from "../Category/category.model";
import { ProfileModel } from "../Profile/profile.model";
import { ServiceModel } from "../Service/service.model";
import { SiteSettingsModel } from "../SiteSettings/siteSettings.model";
import {
  applyOrder,
  generateUniqueSlug,
  resolveSlugChange,
  uniqueIds,
} from "../shared/shared.utils";
import { ProjectSearchFields, ProjectSortOptions } from "./project.constant";
import { TProject } from "./project.interface";
import { ProjectModel } from "./project.model";

type TProjectPayload = Partial<TProject> & { slug?: string };

// Fields returned to the admin list table (keeps the payload small)
const LIST_FIELDS =
  "title slug projectType projectStatus publishStatus visibility featured featuredOrder sortOrder categories media.coverImage subcategory isClientWork publishedAt updatedAt createdAt";

/**
 * A published project needs a summary - it is the text shown on every card
 * and in search/social previews. Everything else is optional.
 */
const assertPublishable = (project: Partial<TProject>) => {
  if (project.publishStatus === "published" && !project.summary?.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Add a short summary before publishing - it is used on project cards and previews",
    );
  }
};

const normalize = (payload: TProjectPayload, selfId?: string) => {
  const data: Record<string, unknown> = { ...payload };
  if (payload.categories) data.categories = uniqueIds(payload.categories);
  if (payload.relatedProjects) {
    data.relatedProjects = uniqueIds(payload.relatedProjects).filter(id => id !== selfId);
  }
  if (payload.publishedAt === null) data.publishedAt = undefined;
  delete data.slug; // handled separately (uniqueness + redirect history)
  return data;
};

const createProjectIntoDB = async (payload: TProjectPayload) => {
  const data = normalize(payload);
  const slug = await generateUniqueSlug(ProjectModel, payload.slug || payload.title!);

  if (data.publishStatus === "published" && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  assertPublishable(data as Partial<TProject>);

  return ProjectModel.create({ ...data, slug });
};

const getProjectsFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  if (typeof query.category === "string") {
    filter.categories = new Types.ObjectId(query.category);
  }
  if (query.featured === "true") filter.featured = true;
  if (query.featured === "false") filter.featured = false;

  const projectsQuery = new QueryBuilder(
    ProjectModel.find().select(LIST_FIELDS).populate("categories", "name slug"),
    query,
  )
    .search(ProjectSearchFields)
    .filter(["publishStatus", "projectType"])
    .where(filter)
    .sort(ProjectSortOptions, "sortOrder -createdAt")
    .paginate();

  const result = await projectsQuery.modelQuery.lean();
  const meta = await projectsQuery.countTotal();
  return { meta, result };
};

// Lightweight list for pickers (related projects, featured selections)
const getProjectOptionsFromDB = async () => {
  return ProjectModel.find()
    .select("title slug projectType publishStatus visibility media.coverImage")
    .sort("sortOrder -createdAt")
    .lean();
};

const getSingleProjectFromDB = async (id: string) => {
  const project = await ProjectModel.findById(id).lean();
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  return project;
};

const updateProjectIntoDB = async (id: string, payload: TProjectPayload) => {
  const existing = await ProjectModel.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const data = normalize(payload, id);
  Object.assign(
    data,
    await resolveSlugChange(ProjectModel, existing, payload.slug),
  );

  const nextStatus = (data.publishStatus as string) || existing.publishStatus;
  if (nextStatus === "published" && !existing.publishedAt && !data.publishedAt) {
    data.publishedAt = new Date();
  }
  assertPublishable({
    publishStatus: nextStatus as TProject["publishStatus"],
    summary: (data.summary as string | undefined) ?? existing.summary,
  });

  return ProjectModel.findByIdAndUpdate(id, { $set: data }, {
    new: true,
    runValidators: true,
  }).lean();
};

const duplicateProjectIntoDB = async (id: string) => {
  const source = await ProjectModel.findById(id).lean();
  if (!source) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { _id, createdAt, updatedAt, previousSlugs, publishedAt, ...rest } =
    source as TProject & { _id: Types.ObjectId };

  const title = `${source.title} (Copy)`;
  return ProjectModel.create({
    ...rest,
    title,
    slug: await generateUniqueSlug(ProjectModel, `${source.slug}-copy`),
    publishStatus: "draft",
    featured: false,
    previousSlugs: [],
    // Content blocks get fresh ids so the copy is fully independent
    contentBlocks: (source.contentBlocks || []).map(block => ({
      type: block.type,
      data: block.data,
    })),
  });
};

/**
 * Deletes a project and removes every reference to it, so no other page
 * keeps pointing at a missing document.
 */
const deleteProjectFromDB = async (id: string) => {
  const project = await ProjectModel.findById(id);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  await project.deleteOne();
  const objectId = project._id;
  await Promise.all([
    ProjectModel.updateMany({ relatedProjects: objectId }, { $pull: { relatedProjects: objectId } }),
    CategoryModel.updateMany({ featuredProjects: objectId }, { $pull: { featuredProjects: objectId } }),
    ServiceModel.updateMany({ relatedProjects: objectId }, { $pull: { relatedProjects: objectId } }),
    ProfileModel.updateMany(
      {},
      {
        $pull: {
          featuredProjects: objectId,
          "experience.$[].relatedProjects": objectId,
        },
      },
    ),
    SiteSettingsModel.updateMany({}, { $pull: { "home.selectedWork.projects": objectId } }),
  ]);
  return project;
};

const reorderProjects = async (ids: string[]) => {
  await applyOrder(ProjectModel, ids);
};

// Admin-only: fetch any project (including drafts) by slug for previews
const getProjectBySlugForPreview = async (slug: string) => {
  return ProjectModel.findOne({ slug }).lean();
};

export const ProjectServices = {
  createProjectIntoDB,
  getProjectsFromDB,
  getProjectOptionsFromDB,
  getSingleProjectFromDB,
  updateProjectIntoDB,
  duplicateProjectIntoDB,
  deleteProjectFromDB,
  reorderProjects,
  getProjectBySlugForPreview,
};
