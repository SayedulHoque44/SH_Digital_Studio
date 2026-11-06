import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MediaServices } from "./media.service";

const getMediaConfig = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media configuration retrieved",
    data: MediaServices.getMediaConfig(),
  });
});

const createMedia = catchAsync(async (req, res) => {
  const media = await MediaServices.createMediaIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Media added to the library",
    data: media,
  });
});

const getMedia = catchAsync(async (req, res) => {
  const media = await MediaServices.getMediaFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media retrieved",
    data: media,
  });
});

const updateMedia = catchAsync(async (req, res) => {
  const media = await MediaServices.updateMediaIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media updated",
    data: media,
  });
});

const getMediaUsage = catchAsync(async (req, res) => {
  const usage = await MediaServices.getMediaUsageFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media usage retrieved",
    data: usage,
  });
});

const deleteMedia = catchAsync(async (req, res) => {
  await MediaServices.deleteMediaFromDB(req.params.id, req.query.force === "true");
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Media deleted",
    data: null,
  });
});

const createUploadUrl = catchAsync(async (req, res) => {
  const upload = await MediaServices.createUploadUrl(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Upload URL created",
    data: upload,
  });
});

export const MediaControllers = {
  getMediaConfig,
  createMedia,
  getMedia,
  updateMedia,
  getMediaUsage,
  deleteMedia,
  createUploadUrl,
};
