import { Response } from "express";
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PublicServices } from "./public.service";

const ok = <T>(res: Response, message: string, data: T) =>
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message, data });

const getSettings = catchAsync(async (req, res) => {
  ok(res, "Settings retrieved", await PublicServices.getPublicSettings());
});

const getHome = catchAsync(async (req, res) => {
  ok(res, "Home retrieved", await PublicServices.getHome());
});

const getLegalPage = catchAsync(async (req, res) => {
  ok(res, "Page retrieved", await PublicServices.getLegalPage(req.params.doc as "privacy" | "terms"));
});

const getProjects = catchAsync(async (req, res) => {
  ok(res, "Projects retrieved", await PublicServices.listProjects(req.query));
});

// A moved slug answers with { redirectSlug } so the page can issue a 308.
const getProject = catchAsync(async (req, res) => {
  const found = await PublicServices.getProjectBySlug(req.params.slug);
  if (!found) throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  ok(res, "Project retrieved", "redirectSlug" in found ? { redirectSlug: found.redirectSlug } : found.project);
});

const getCategories = catchAsync(async (req, res) => {
  ok(res, "Categories retrieved", await PublicServices.listCategories());
});

const getCategory = catchAsync(async (req, res) => {
  const found = await PublicServices.getCategoryBySlug(req.params.slug);
  if (!found) throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  ok(res, "Category retrieved", "redirectSlug" in found ? { redirectSlug: found.redirectSlug } : found.category);
});

const getServices = catchAsync(async (req, res) => {
  ok(res, "Services retrieved", await PublicServices.listServices());
});

const getService = catchAsync(async (req, res) => {
  const found = await PublicServices.getServiceBySlug(req.params.slug);
  if (!found) throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  ok(res, "Service retrieved", "redirectSlug" in found ? { redirectSlug: found.redirectSlug } : found.service);
});

const getProfile = catchAsync(async (req, res) => {
  ok(res, "Profile retrieved", await PublicServices.getPublicProfile());
});

const getSitemap = catchAsync(async (req, res) => {
  ok(res, "Sitemap retrieved", await PublicServices.getSitemap());
});

export const PublicControllers = {
  getSettings,
  getHome,
  getLegalPage,
  getProjects,
  getProject,
  getCategories,
  getCategory,
  getServices,
  getService,
  getProfile,
  getSitemap,
};
