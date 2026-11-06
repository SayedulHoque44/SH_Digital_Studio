import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryServices } from "./category.service";

const createCategory = catchAsync(async (req, res) => {
  const category = await CategoryServices.createCategoryIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created",
    data: category,
  });
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await CategoryServices.getCategoriesFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved",
    data: categories,
  });
});

const getCategoryOptions = catchAsync(async (req, res) => {
  const options = await CategoryServices.getCategoryOptionsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category options retrieved",
    data: options,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
  const category = await CategoryServices.getSingleCategoryFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved",
    data: category,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await CategoryServices.updateCategoryIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category saved",
    data: category,
  });
});

const getDeleteImpact = catchAsync(async (req, res) => {
  const impact = await CategoryServices.getDeleteImpactFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Delete impact calculated",
    data: impact,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await CategoryServices.deleteCategoryFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted",
    data: null,
  });
});

const reorderCategories = catchAsync(async (req, res) => {
  await CategoryServices.reorderCategories(req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order saved",
    data: null,
  });
});

export const CategoryControllers = {
  createCategory,
  getCategories,
  getCategoryOptions,
  getSingleCategory,
  updateCategory,
  getDeleteImpact,
  deleteCategory,
  reorderCategories,
};
