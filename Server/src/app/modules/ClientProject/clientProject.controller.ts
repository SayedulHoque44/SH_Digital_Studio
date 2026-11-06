import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ClientProjectServices } from "./clientProject.service";

const getClientProjects = catchAsync(async (req, res) => {
  const projects = await ClientProjectServices.getClientProjectsFromDB(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Client projects retrieved", data: projects });
});

const getSingleClientProject = catchAsync(async (req, res) => {
  const project = await ClientProjectServices.getSingleClientProjectFromDB(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Client project retrieved", data: project });
});

const createClientProject = catchAsync(async (req, res) => {
  const project = await ClientProjectServices.createClientProjectIntoDB(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Client project created", data: project });
});

const updateClientProject = catchAsync(async (req, res) => {
  const project = await ClientProjectServices.updateClientProjectIntoDB(req.params.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Client project saved", data: project });
});

const deleteClientProject = catchAsync(async (req, res) => {
  await ClientProjectServices.deleteClientProjectFromDB(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Client project deleted", data: null });
});

const recordPayment = catchAsync(async (req, res) => {
  const project = await ClientProjectServices.recordPaymentIntoDB(req.params.id, req.params.renewalId, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Payment recorded", data: project });
});

export const ClientProjectControllers = {
  getClientProjects,
  getSingleClientProject,
  createClientProject,
  updateClientProject,
  deleteClientProject,
  recordPayment,
};
