import httpStatus from "http-status";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PublicServices } from "../Public/public.service";
import { ProjectServices } from "./project.service";

const createProject = catchAsync(async (req, res) => {
  const project = await ProjectServices.createProjectIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project created",
    data: project,
  });
});

const getProjects = catchAsync(async (req, res) => {
  const projects = await ProjectServices.getProjectsFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects retrieved",
    data: projects,
  });
});

const getProjectOptions = catchAsync(async (req, res) => {
  const options = await ProjectServices.getProjectOptionsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project options retrieved",
    data: options,
  });
});

const getSingleProject = catchAsync(async (req, res) => {
  const project = await ProjectServices.getSingleProjectFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project retrieved",
    data: project,
  });
});

const updateProject = catchAsync(async (req, res) => {
  const project = await ProjectServices.updateProjectIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project saved",
    data: project,
  });
});

const duplicateProject = catchAsync(async (req, res) => {
  const project = await ProjectServices.duplicateProjectIntoDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project duplicated as a draft",
    data: project,
  });
});

const deleteProject = catchAsync(async (req, res) => {
  await ProjectServices.deleteProjectFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted",
    data: null,
  });
});

const reorderProjects = catchAsync(async (req, res) => {
  await ProjectServices.reorderProjects(req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order saved",
    data: null,
  });
});

// Returns the same shape as the public endpoint, but for any status, so the
// Next.js draft preview renders exactly what visitors would see.
const previewProject = catchAsync(async (req, res) => {
  const project = await ProjectServices.getProjectBySlugForPreview(req.params.slug);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }
  const data = await PublicServices.buildProjectDetail(project);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project preview retrieved",
    data,
  });
});

export const ProjectControllers = {
  createProject,
  getProjects,
  getProjectOptions,
  getSingleProject,
  updateProject,
  duplicateProject,
  deleteProject,
  reorderProjects,
  previewProject,
};
