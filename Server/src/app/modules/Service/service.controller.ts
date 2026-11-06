import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ServiceServices } from "./service.service";

const createService = catchAsync(async (req, res) => {
  const service = await ServiceServices.createServiceIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service created",
    data: service,
  });
});

const getServices = catchAsync(async (req, res) => {
  const services = await ServiceServices.getServicesFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services retrieved",
    data: services,
  });
});

const getServiceOptions = catchAsync(async (req, res) => {
  const options = await ServiceServices.getServiceOptionsFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service options retrieved",
    data: options,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const service = await ServiceServices.getSingleServiceFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service retrieved",
    data: service,
  });
});

const updateService = catchAsync(async (req, res) => {
  const service = await ServiceServices.updateServiceIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service saved",
    data: service,
  });
});

const deleteService = catchAsync(async (req, res) => {
  await ServiceServices.deleteServiceFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service deleted",
    data: null,
  });
});

const reorderServices = catchAsync(async (req, res) => {
  await ServiceServices.reorderServices(req.body.ids);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order saved",
    data: null,
  });
});

export const ServiceControllers = {
  createService,
  getServices,
  getServiceOptions,
  getSingleService,
  updateService,
  deleteService,
  reorderServices,
};
