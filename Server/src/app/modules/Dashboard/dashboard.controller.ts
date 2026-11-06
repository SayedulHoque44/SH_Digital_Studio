import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.service";

const getDashboard = catchAsync(async (req, res) => {
  const dashboard = await DashboardServices.getDashboardFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard retrieved",
    data: dashboard,
  });
});

export const DashboardControllers = { getDashboard };
